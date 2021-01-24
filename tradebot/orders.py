import uuid

from cbpro import AuthenticatedClient

from .trade_spec import ProductId
from .firestore import get_db, SERVER_TIMESTAMP
from .profile import ProfileId

_ORDER_RECORDS_COLLECTION = u"order_records"


def _create_order_record(
    profile: ProfileId, product_id: ProductId, quote_currency_amount: int
):
    client_oid = uuid.uuid4().hex
    _, order_ref = (
        get_db()
        .collection(_ORDER_RECORDS_COLLECTION)
        .add(
            {
                u"profile": profile.get_b32_qualified_id(),
                u"product": product_id,
                u"quote_currency_amount": quote_currency_amount,
                u"client_oid": client_oid,
                u"timestamp": SERVER_TIMESTAMP,
            }
        )
    )
    return order_ref, client_oid


def _update_order_record(order_ref, server_oid: str) -> None:
    order_ref.update({u"server_oid": server_oid})


def place_market_buy(
    client: AuthenticatedClient,
    profile: ProfileId,
    product_id: ProductId,
    funds: float,
):
    # Create a record of the order we want to place
    order_ref, client_oid = _create_order_record(profile, product_id, funds)
    # Place the order
    response = client.place_market_order(
        product_id, "buy", funds=str(funds), client_oid=client_oid
    )
    # Update our records with the server-generated order ID
    server_oid = response["id"]
    _update_order_record(order_ref, server_oid)
