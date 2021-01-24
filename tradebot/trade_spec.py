from typing import AnyStr, Dict, Generator, Tuple

_QUOTE_CURRENCY_ID = "USD"


CryptoId = AnyStr
ProductId = AnyStr


def _product_id(crypto: CryptoId):
    return f"{crypto}-{_QUOTE_CURRENCY_ID}"


class TradeSpec:
    def trades(self) -> Generator[None, Tuple[ProductId, int], None]:
        pass


class DictSpec(TradeSpec):
    def __init__(self, trades: Dict[ProductId, int]):
        self._trades = trades

    def trades(self) -> Generator[None, Tuple[ProductId, int], None]:
        for product_id, amount in self._trades.items():
            yield product_id, amount


_EMPTY_SPEC = DictSpec({})


def get_trade_spec() -> TradeSpec:
    return _EMPTY_SPEC
