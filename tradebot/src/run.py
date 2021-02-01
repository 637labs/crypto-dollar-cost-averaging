import json
import os
import sys
from typing import AnyStr, Dict, List, Tuple

from cbpro import AuthenticatedClient
from flask import Flask, request

from .client_helper import get_client
from .orders import DailyTargetDepositReached, place_market_buy
from .profile import ProfileId
from .pubsub_helper import get_event_data
from .rest_helper import format_error
from .trade_spec import TradeSpec, get_trade_specs

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
    print("Running tradebot ...")
    print(
        json.dumps(
            {
                "GCloud Project ID": os.environ["GCLOUD_PROJECT"],
                "Profile Namespace": profile.namespace,
                "Profile ID": profile.identifier,
            }
        )
    )

    client = get_client(profile)
    specs = get_trade_specs(profile)
    execute_trades(client, profile, specs)

    return ("", 204)


@app.route("/", methods=["POST"])
def handle_event():
    envelope = request.get_json()
    data = get_event_data(envelope)

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

    response = process_profile_request(profile)

    # Flush the stdout to avoid log buffering.
    sys.stdout.flush()

    return response


@app.route("/direct", methods=["POST"])
def handle_direct_invocation():
    envelope = request.get_json()

    profile_params = envelope["profile"]
    profile = ProfileId(profile_params["namespace"], profile_params["identifier"])

    response = process_profile_request(profile)

    # Flush the stdout to avoid log buffering.
    sys.stdout.flush()

    return response
