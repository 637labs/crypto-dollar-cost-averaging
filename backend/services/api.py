import sys
from typing import Optional

from flask import Flask, Response, jsonify, request

from backend.core.cbpro_client_helper import (
    PROFILE_NAMESPACE_TO_API_URL,
    CbProAuthenticatedClient,
    get_client as get_cbpro_client,
    InvalidCoinbaseProAPIKey,
)
from backend.core.profile import (
    DEFAULT_NS,
    ProfileId,
    get_or_create_profile,
    get_by_guid as get_profile_by_guid,
    delete_profile,
    list_user_profiles,
    ProfileNotFoundError,
    ProfileUserMismatchError,
)
from backend.core.secrets.profile_secrets import (
    set_api_b64_secret,
    set_api_key,
    set_api_passphrase,
    delete_api_key,
    delete_api_b64_secret,
    delete_api_passphrase,
)
from backend.core.trade_spec import (
    get_all_trade_specs,
    remove_allocation,
    set_allocation,
)
from backend.core.secrets.user_secrets import (
    set_basic_access_token,
    set_basic_refresh_token,
)
from backend.core.user import (
    get_by_guid as get_user_by_guid,
    get_or_create_user,
    UserNotFoundError,
)

app = Flask(__name__)


@app.route("/user/get-or-create/v1", methods=["POST"])
def handle_get_or_create_user():
    envelope = request.get_json()

    try:
        user_params = envelope["user"]
        user_id = get_or_create_user(
            user_params["provider"], user_params["id"], user_params["email"]
        )
    except KeyError as e:
        return (str(e), 400)

    # Flush the stdout to avoid log buffering.
    sys.stdout.flush()

    return jsonify(id=user_id.get_guid())


@app.route("/user/oauth/basic/set/v1", methods=["POST"])
def handle_set_basic_oauth_creds():
    envelope = request.get_json()

    try:
        user_id = get_user_by_guid(envelope["userId"])

        creds_params = envelope["oauthCredentials"]
        set_basic_access_token(user_id, creds_params["accessToken"])
        set_basic_refresh_token(user_id, creds_params["refreshToken"])
    except KeyError as err:
        return (str(err), 400)
    except UserNotFoundError as err:
        return (str(err), 404)

    # Flush the stdout to avoid log buffering.
    sys.stdout.flush()

    return ("", 200)


def _get_profile_identifier(client: CbProAuthenticatedClient) -> str:
    profile_ids = {acc["profile_id"] for acc in client.get_accounts()}
    assert len(profile_ids) == 1
    [identifier] = [p_id for p_id in profile_ids]
    return identifier


def _set_profile_secrets(
    profile_id: ProfileId, api_key: str, api_secret: str, api_passphrase: str
) -> None:
    set_api_key(profile_id, api_key)
    set_api_b64_secret(profile_id, api_secret)
    set_api_passphrase(profile_id, api_passphrase)


def _delete_profile_secrets(profile_id: ProfileId) -> None:
    delete_api_key(profile_id)
    delete_api_b64_secret(profile_id)
    delete_api_passphrase(profile_id)


def _get_portfolio_name(client: CbProAuthenticatedClient, profile_id: ProfileId) -> str:
    profile_data = client.get_profile(profile_id.identifier)
    return profile_data["name"]


def _get_portfolio_usd_balance(
    client: CbProAuthenticatedClient, profile_id: ProfileId
) -> float:
    currency_accounts = client.get_accounts()
    usd_accounts = [
        acc
        for acc in currency_accounts
        if acc["currency"] == "USD" and acc["trading_enabled"]
    ]
    assert (
        len(usd_accounts) == 1
    ), f"Found more than one USD account for profile {profile_id.get_guid()}"

    [usd_account] = usd_accounts
    assert usd_account["profile_id"] == profile_id.identifier
    return round(float(usd_account["available"]), ndigits=2)


def _portfolio_to_response(
    profile_id: ProfileId,
    client: Optional[CbProAuthenticatedClient] = None,
    include_trade_specs: bool = True,
) -> Response:
    try:
        client = client or get_cbpro_client(profile_id)
        trade_specs = get_all_trade_specs(profile_id) if include_trade_specs else []
        return jsonify(
            id=profile_id.get_guid(),
            displayName=_get_portfolio_name(client, profile_id),
            tradeSpecs=[
                spec.to_dict() for spec in sorted(trade_specs, key=lambda s: s.product)
            ],
            usdBalance=_get_portfolio_usd_balance(client, profile_id),
        )
    except InvalidCoinbaseProAPIKey:
        print(
            f"Invalid Coinbase Pro API key for ProfileId@{profile_id.get_guid()} -- deleting portfolio ..."
        )
        _delete_profile_secrets(profile_id)
        print(f"Deleted secrets for ProfileId@{profile_id.get_guid()}")
        delete_profile(profile_id)
        print(f"Deleted ProfileId@{profile_id.get_guid()}")

        return ("", 404)


def _profile_id_to_light_dict(profile_id: ProfileId) -> dict:
    return {
        "id": profile_id.get_guid(),
        "displayName": _get_portfolio_name(get_cbpro_client(profile_id), profile_id),
    }


@app.route("/user/portfolio-profile/create/v1", methods=["POST"])
def handle_create_cbpro_profile():
    envelope = request.get_json()

    try:
        user_id = get_user_by_guid(envelope["userId"])

        namespace = envelope.get("profileNamespace", DEFAULT_NS)

        creds = envelope["profileCredentials"]
        api_key = creds["apiKey"]
        api_secret = creds["b64Secret"]
        api_passphrase = creds["passphrase"]
    except KeyError as err:
        return (str(err), 400)
    except UserNotFoundError as err:
        return (str(err), 404)

    # fetch CBPro profile id
    api_url = PROFILE_NAMESPACE_TO_API_URL[namespace]
    client = CbProAuthenticatedClient(
        api_key, api_secret, api_passphrase, api_url=api_url
    )
    identifier = _get_profile_identifier(client)

    # create profile
    profile_id = get_or_create_profile(namespace, identifier, user_id)
    _set_profile_secrets(profile_id, api_key, api_secret, api_passphrase)

    # Flush the stdout to avoid log buffering.
    sys.stdout.flush()

    return _portfolio_to_response(profile_id, client, include_trade_specs=False)


@app.route("/user/<user_guid>/portfolios/v1", methods=["GET"])
def handle_list_cbpro_portfolios(user_guid: str):
    try:
        user = get_user_by_guid(user_guid)
    except UserNotFoundError as err:
        return (str(err), 404)
    return jsonify(
        portfolios=[
            _profile_id_to_light_dict(profile_id)
            for profile_id in list_user_profiles(user)
        ]
    )


@app.route("/user/<user_guid>/portfolio/<portfolio_guid>/v1", methods=["GET"])
def handle_get_cbpro_portfolio(user_guid: str, portfolio_guid: str):
    try:
        user = get_user_by_guid(user_guid)
        profile_id = get_profile_by_guid(portfolio_guid, user)
    except UserNotFoundError as err:
        return (str(err), 404)
    except (ProfileNotFoundError, ProfileUserMismatchError) as err:
        print(err)
        return ("Portfolio not found", 404)
    else:
        return _portfolio_to_response(profile_id)


@app.route(
    "/user/portfolio-profile/<profile_guid>/allocation/<product_id>/set/v1",
    methods=["POST"],
)
def handle_set_allocation(profile_guid: str, product_id: str):
    envelope = request.get_json()

    try:
        user_id = get_user_by_guid(envelope["userId"])
        target_amount = envelope["dailyTargetAmount"]
    except KeyError as err:
        return (str(err), 400)
    except UserNotFoundError as err:
        return (str(err), 404)

    try:
        profile_id = get_profile_by_guid(profile_guid, user=user_id)
    except (ProfileNotFoundError, ProfileUserMismatchError) as err:
        print(err)
        return ("Portfolio not found", 404)
    set_allocation(profile_id, product_id, target_amount)

    return _portfolio_to_response(profile_id)


@app.route(
    "/user/portfolio-profile/<profile_guid>/allocation/<product_id>/remove/v1",
    methods=["POST"],
)
def handle_remove_allocation(profile_guid: str, product_id: str):
    envelope = request.get_json()

    try:
        user_id = get_user_by_guid(envelope["userId"])
    except KeyError as err:
        return (str(err), 400)
    except UserNotFoundError as err:
        return (str(err), 404)

    try:
        profile_id = get_profile_by_guid(profile_guid, user=user_id)
    except (ProfileNotFoundError, ProfileUserMismatchError) as err:
        print(err)
        return ("Portfolio not found", 404)
    remove_allocation(profile_id, product_id)

    return _portfolio_to_response(profile_id)
