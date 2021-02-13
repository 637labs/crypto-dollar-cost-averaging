import json
import os
import sys
from typing import AnyStr, Dict, List, Tuple

from cbpro import AuthenticatedClient
from flask import Flask, request

from app.core.client_helper import get_client
from app.core.orders import DailyTargetDepositReached, place_market_buy
from app.core.profile import ProfileId
from app.core.pubsub_helper import get_event_data_dict
from app.core.rest_helper import format_error
from app.core.trade_spec import ProductId, TradeSpec, get_trade_spec, get_trade_specs

app = Flask(__name__)


def execute_trades(
    client: AuthenticatedClient, profile: ProfileId, specs: List[TradeSpec]
):
    for spec in specs:
        try:
            place_market_buy(client, profile, spec)
        except DailyTargetDepositReached as e:
            print(f"Already hit daily limit for '{e.product_id}'")


def process_profile_request(profile: ProfileId) -> Tuple[str, int]:
    print("Running tradebot (legacy profile-scoped event) ...")
    print(
        json.dumps(
            {
                "Profile Namespace": profile.namespace,
                "Profile ID": profile.identifier,
            }
        )
    )

    client = get_client(profile)
    specs = get_trade_specs(profile)
    execute_trades(client, profile, specs)

    return ("", 204)


def process_product_request(
    profile: ProfileId, product_id: ProductId
) -> Tuple[str, int]:
    print("Running tradebot ...")
    print(
        json.dumps(
            {
                "Profile Namespace": profile.namespace,
                "Profile ID": profile.identifier,
                "Product": product_id,
            }
        )
    )
    client = get_client(profile)
    spec = get_trade_spec(profile, product_id)

    try:
        place_market_buy(client, profile, spec)
    except DailyTargetDepositReached as e:
        print(f"Already hit daily limit for '{e.product_id}'")

    return ("", 204)


@app.route("/", methods=["POST"])
def handle_event():
    envelope = request.get_json()
    data = get_event_data_dict(envelope)

    if not isinstance(data, dict) or "profile" not in data:
        return format_error("no 'profile' in message data")
    profile_params = data["profile"]
    if not isinstance(profile_params, dict):
        return format_error("expected 'profile' to be a dict")
    if "namespace" not in profile_params:
        return format_error("no 'namespace'")
    if "identifier" not in profile_params:
        return format_error("no 'identifier'")

    profile = ProfileId(profile_params["namespace"], profile_params["identifier"])

    if "product" in data:
        response = process_product_request(profile, data["product"])
    else:
        response = process_profile_request(profile)

    # Flush the stdout to avoid log buffering.
    sys.stdout.flush()

    return response


@app.route("/direct", methods=["POST"])
def handle_direct_invocation():
    envelope = request.get_json()

    profile_params = envelope["profile"]
    profile = ProfileId(profile_params["namespace"], profile_params["identifier"])
    product = envelope["product"]

    response = process_product_request(profile, product)

    # Flush the stdout to avoid log buffering.
    sys.stdout.flush()

    return response