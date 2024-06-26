import base64
import os
import uuid
from datetime import date

from coinbasepro import AuthenticatedClient
from coinbasepro.exceptions import BadRequest

from .firestore_helper import (
    SERVER_TIMESTAMP,
    OrderDescending,
    Transaction,
    get_db,
    lock_on_key,
    transactional,
)
from .profile import ProfileId
from .pubsub_helper import publisher
from .trade_spec import ProductId, TradeSpec

_ORDER_RECORDS_COLLECTION = "order_records"


class UnhandledMarketOrderException(Exception):
    def __init__(self, profile_id: ProfileId, product_id: ProductId, err: Exception):
        super(UnhandledMarketOrderException, self).__init__(
            f"Unhandled market order exception for ProfileId@{profile_id.get_guid()} | {product_id}: {err}"
        )


class DailyTargetDepositReached(Exception):
    def __init__(self, product_id: ProductId):
        super(DailyTargetDepositReached, self).__init__(
            f"Daily deposit target reached for product '{product_id}'"
        )
        self.product_id = product_id


def _order_lock_key(profile: ProfileId, product: ProductId) -> str:
    key = f"{profile.get_guid()}:{product}"
    return base64.urlsafe_b64encode(key.encode()).decode()


def _build_latest_orders_query(profile: ProfileId, product: ProductId, limit: int):
    return (
        get_db()
        .collection(_ORDER_RECORDS_COLLECTION)
        .where("profile", "==", profile.get_guid())
        .where("product", "==", product)
        .order_by("timestamp", direction=OrderDescending)
        .limit(limit)
    )


def _sum_total_order_amounts_today(recent_orders) -> float:
    today = date.today()
    todays_orders = [
        order for order in recent_orders if order.get("timestamp").date() == today
    ]
    return sum(order.get("quote_currency_amount") for order in todays_orders)


@transactional
def _create_order_record(
    transaction: Transaction,
    profile: ProfileId,
    spec: TradeSpec,
):
    product_id = spec.get_product_id()
    with lock_on_key(_order_lock_key(profile, product_id), transaction):

        recent_orders_query = _build_latest_orders_query(
            profile, product_id, 2 * spec.get_daily_frequency()
        )
        recent_orders = [
            order for order in recent_orders_query.stream(transaction=transaction)
        ]
        todays_sum = _sum_total_order_amounts_today(recent_orders)
        if todays_sum >= spec.get_daily_limit():
            raise DailyTargetDepositReached(product_id)

        order_ref = get_db().collection(_ORDER_RECORDS_COLLECTION).document()
        client_oid = uuid.uuid4().hex
        transaction.create(
            order_ref,
            {
                "profile": profile.get_guid(),
                "product": product_id,
                "quote_currency_amount": spec.get_quote_amount(),
                "client_oid": client_oid,
                "timestamp": SERVER_TIMESTAMP,
                "status": "STAGED",
            },
        )
        return order_ref, client_oid


def _try_create_order_record(profile: ProfileId, spec: TradeSpec):
    transaction = get_db().transaction()
    return _create_order_record(transaction, profile, spec)


def _update_order_record(order_ref, server_oid: str) -> None:
    order_ref.update({"server_oid": server_oid, "status": "ACCEPTED"})


def _mark_order_rejected(order_ref, response_obj):
    order_ref.update({"status": "REJECTED", "server_response": str(response_obj)})


def place_market_buy(client: AuthenticatedClient, profile: ProfileId, spec: TradeSpec):
    # Create a record of the order we want to place
    order_ref, client_oid = _try_create_order_record(profile, spec)

    # Place the order
    try:
        response = client.place_market_order(
            spec.get_product_id(),
            "buy",
            funds=str(spec.get_quote_amount()),
            client_oid=client_oid,
        )
    except BadRequest as err:
        if "Insufficient funds" in str(err):
            with publisher(os.environ["INSUFFICIENT_FUNDS_TOPIC"]) as pub:
                pub.publish_event({"profileId": profile.get_guid()})
            _mark_order_rejected(order_ref, "Insufficient funds")
        else:
            raise UnhandledMarketOrderException(
                profile, spec.get_product_id(), err
            ) from err
    except Exception as err:
        raise UnhandledMarketOrderException(
            profile, spec.get_product_id(), err
        ) from err
    else:
        # Update our records with the server-generated order ID
        if "id" in response:
            server_oid = response["id"]
            _update_order_record(order_ref, server_oid)
        else:
            _mark_order_rejected(order_ref, response)
