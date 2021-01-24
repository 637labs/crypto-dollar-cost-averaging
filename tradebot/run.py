import os
import sys
from typing import AnyStr, Dict

from cbpro import AuthenticatedClient

from .client_helper import get_client
from .orders import place_market_buy
from .profile import ProfileId
from .trade_spec import TradeSpec, get_trade_spec


def execute_trade(client: AuthenticatedClient, profile: ProfileId, spec: TradeSpec):
    for product_id, quote_currency_amount in spec.trades():
        place_market_buy(client, profile, product_id, quote_currency_amount)


if __name__ == "__main__":
    assert len(sys.argv) == 4
    profile = ProfileId(sys.argv[1], sys.argv[2])

    project_id = os.environ["GCLOUD_PROJECT"]
    print(f"Project ID: {project_id}")
    print(f"Profile Namespace: {profile.namespace}")
    print(f"Profile ID: {profile.identifier}")

    trade_spec_id = sys.argv[3]

    client = get_client(profile)
    spec = get_trade_spec(trade_spec_id)
    execute_trade(client, profile, spec)
