from typing import AnyStr, Dict, Generator, Tuple


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


_EMPTY_SPEC = DictSpec({})


def get_trade_spec() -> TradeSpec:
    return _EMPTY_SPEC
