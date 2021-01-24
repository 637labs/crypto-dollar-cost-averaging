from typing import AnyStr, Dict, Generator, Tuple

from .firestore import get_db

_SPECS_COLLECTION = "trade_specs"

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


def _spec_from_dict(spec_dict) -> DictSpec:
    trades = spec_dict["trades"]
    trades_dict = {
        trade["product_id"]: trade["quote_currency_amount"] for trade in trades
    }
    return DictSpec(trades_dict)


def get_trade_spec(spec_id: str) -> TradeSpec:
    spec_data = get_db().collection(_SPECS_COLLECTION).document(spec_id).get()
    if spec_data.exists:
        return _spec_from_dict(spec_data.to_dict())
    else:
        raise Exception(f"Unable to lookup trade spec '{spec_id}'")
