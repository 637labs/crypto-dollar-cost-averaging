from typing import AnyStr, Dict, List

from .firestore_helper import get_db
from .profile import ProfileId, get_profile_field

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


def get_trade_specs(profile: ProfileId) -> List[TradeSpec]:
    daily_deposit_amounts = _get_target_daily_deposits(profile)
    daily_frequency = _get_daily_deposit_frequency(profile)

    return [
        TradeSpec(product_id, daily_frequency, daily_amount)
        for (product_id, daily_amount) in daily_deposit_amounts.items()
    ]
