from typing import AnyStr, Dict, List

from .firestore_helper import get_db, DocumentSnapshot
from .profile import ProfileId, get_profile_field, get_profile_subcollection

ProductId = AnyStr


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
        return self.daily_target_amount / self.daily_frequency

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
