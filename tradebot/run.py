import os
import sys
from typing import AnyStr, Dict

import cbpro

from .client_helper import get_client
from .profile import ProfileId
from .trade_spec import TradeSpec, get_trade_spec


def execute_trade(client: cbpro.AuthenticatedClient, spec: TradeSpec):
    for product_id, quote_currency_amount in spec.trades():
        client.place_market_order(product_id, "buy", funds=quote_currency_amount)


if __name__ == "__main__":
    assert len(sys.argv) == 3
    profile = ProfileId(sys.argv[1], sys.argv[2])

    client = get_client(profile)
    spec = get_trade_spec()
    execute_trade(client, spec)
