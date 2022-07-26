from typing import AnyStr, Dict, List

from .cbpro_client_helper import get_public_client, PublicClient
from .firestore_helper import get_db, DocumentSnapshot
from .profile import ProfileId, get_profile_field, get_profile_subcollection

ProductId = AnyStr
ScheduleId = AnyStr


class TradeSpec:
    def __init__(
        self, product: ProductId, daily_frequency: int, daily_target_amount: float
    ):
        self.product = product
        self.daily_frequency = daily_frequency
        self.daily_target_amount = daily_target_amount

    def get_product_id(self) -> ProductId:
        return self.product

    def get_quote_amount(self) -> float:
        # Round to 1 decimal because some exchanges will barf of exceedingly precise order amounts
        return round(self.daily_target_amount / self.daily_frequency, ndigits=1)

    def get_daily_limit(self) -> float:
        return self.daily_target_amount

    def get_daily_frequency(self) -> int:
        return self.daily_frequency

    def to_dict(self):
        return {
            "productId": self.product,
            "dailyTargetAmount": self.daily_target_amount,
        }


def _get_target_daily_deposits(profile: ProfileId) -> Dict[ProductId, float]:
    target_deposit_list = get_profile_field(profile, "target_daily_deposits")
    assert isinstance(target_deposit_list, list)
    return {td["product_id"]: float(td["deposit_amount"]) for td in target_deposit_list}


def _get_daily_deposit_frequency(profile: ProfileId) -> int:
    schedule_id = get_profile_field(profile, "schedule")
    assert schedule_id and isinstance(schedule_id, str)

    schedule_ref = get_db().collection("schedules").document(schedule_id)
    schedule = schedule_ref.get()
    if not schedule.exists:
        raise Exception(f"Unknown schedule '{schedule_id}'")

    return int(schedule.to_dict()["daily_frequency"])


def legacy_get_trade_specs(profile: ProfileId) -> List[TradeSpec]:
    daily_deposit_amounts = _get_target_daily_deposits(profile)
    daily_frequency = _get_daily_deposit_frequency(profile)

    return [
        TradeSpec(product_id, daily_frequency, daily_amount)
        for (product_id, daily_amount) in daily_deposit_amounts.items()
    ]


def _trade_spec_from_document(trade_spec_doc: DocumentSnapshot) -> TradeSpec:
    daily_target_amount = float(trade_spec_doc.get("deposit_amount"))

    schedule_id = trade_spec_doc.get("schedule")
    assert schedule_id and isinstance(schedule_id, str)

    schedule_ref = get_db().collection("schedules").document(schedule_id)
    schedule = schedule_ref.get()
    if not schedule.exists:
        raise Exception(f"Unknown schedule '{schedule_id}'")

    daily_frequency = int(schedule.get("daily_frequency"))

    return TradeSpec(trade_spec_doc.id, daily_frequency, daily_target_amount)


def _find_optimal_schedule(
    product_id: ProductId, daily_target_amount: float, client: PublicClient
) -> ScheduleId:
    buy_minimum = _get_validated_product_buy_minimum(product_id, client)
    if daily_target_amount < buy_minimum:
        raise f"Target daily amount ${daily_target_amount} is below the minimum buy (${buy_minimum}) for '{product_id}'"

    schedules_by_daily_frequency = sorted(
        [
            (int(schedule_doc.to_dict()["daily_frequency"]), schedule_doc.id)
            for schedule_doc in get_db().collection("schedules").stream()
        ],
        reverse=True,
    )
    for daily_frequency, schedule_id in schedules_by_daily_frequency:
        # Ensure that the per-order amount meets the exchange's minimum, but also ensure it's at least $2 since some exchanges charge a minimum fee of $0.01
        if daily_target_amount // daily_frequency >= max(buy_minimum + 1, 2):
            return schedule_id

    assert f"Unable to find valid schedule for product '{product_id}' with target daily amount of ${daily_target_amount} and minimum market buy of ${buy_minimum}"


def get_trade_spec(profile: ProfileId, product_id: ProductId) -> TradeSpec:
    target_deposits_collection = get_profile_subcollection(profile, "target_deposits")
    deposit_spec = target_deposits_collection.document(product_id).get()
    if not deposit_spec.exists:
        raise Exception(
            f"Could not find target deposit spec for profile '{profile.get_guid()}' and product '{product_id}'"
        )
    return _trade_spec_from_document(deposit_spec)


def get_all_trade_specs(profile: ProfileId) -> List[TradeSpec]:
    target_deposits_collection = get_profile_subcollection(profile, "target_deposits")
    return [
        _trade_spec_from_document(spec_doc)
        for spec_doc in target_deposits_collection.stream()
    ]


def _is_supported_product(product_details: dict) -> bool:
    return not (
        product_details["trading_disabled"]
        or product_details["auction_mode"]
        or product_details["post_only"]
        or product_details["limit_only"]
        or product_details["cancel_only"]
        or product_details["quote_currency"] != "USD"
    )


def _get_validated_product_buy_minimum(
    product_id: ProductId, client: PublicClient
) -> float:
    all_products = client.get_products()
    matching_products = list(filter(lambda p: p.get("id") == product_id, all_products))
    if not matching_products:
        raise Exception(f"Could not find product '{product_id}'")
    if len(matching_products) > 1:
        raise AssertionError(f"Found multiple products with ID '{product_id}'")

    [product_details] = matching_products
    if not _is_supported_product(product_details):
        raise f"Unsupported product '{product_id}'"

    return float(product_details["min_market_funds"])


def set_allocation(
    profile: ProfileId, product_id: ProductId, daily_target_amount: float
) -> None:
    schedule_id = _find_optimal_schedule(
        product_id, daily_target_amount, get_public_client(profile.namespace)
    )
    target_deposits_collection = get_profile_subcollection(profile, "target_deposits")
    target_deposits_collection.document(product_id).set(
        {"deposit_amount": daily_target_amount, "schedule": schedule_id}
    )


def remove_allocation(profile: ProfileId, product_id: ProductId) -> bool:
    target_deposits_collection = get_profile_subcollection(profile, "target_deposits")
    for configured_deposit in target_deposits_collection.stream():
        if configured_deposit.id == product_id:
            configured_deposit.reference.delete()
            return True
    return False
