from typing import AnyStr, Dict, Generator, Tuple

from .firestore import get_db
from .profile import ProfileId, get_profile_field

ProductId = AnyStr


class TradeSpec:
    def trades(self) -> Generator[None, Tuple[ProductId, float], None]:
        pass


class DictSpec(TradeSpec):
    def __init__(self, trades: Dict[ProductId, float]):
        self._trades = trades

    def trades(self) -> Generator[None, Tuple[ProductId, float], None]:
        for product_id, amount in self._trades.items():
            yield product_id, amount


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


def get_trade_spec(profile: ProfileId) -> TradeSpec:
    daily_deposit_amounts = _get_target_daily_deposits(profile)
    daily_frequency = _get_daily_deposit_frequency(profile)

    unit_deposit_amounts = {
        product_id: daily_amount / daily_frequency
        for (product_id, daily_amount) in daily_deposit_amounts.items()
    }
    return DictSpec(unit_deposit_amounts)
