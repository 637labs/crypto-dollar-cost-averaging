import sys

from cbpro import AuthenticatedClient
from flask import Flask, request, jsonify

from backend.core.cbpro_client_helper import PROFILE_NAMESPACE_TO_API_URL
from backend.core.profile import ProfileId, get_or_create_profile, DEFAULT_NS
from backend.core.secrets.profile_secrets import (
    set_api_b64_secret,
    set_api_key,
    set_api_passphrase,
)
from backend.core.secrets.user_secrets import (
    set_basic_access_token,
    set_basic_refresh_token,
)
from backend.core.user import get_by_guid, get_or_create_user


app = Flask(__name__)


@app.route("/user/get-or-create/v1", methods=["POST"])
def handle_get_or_create_user():
    envelope = request.get_json()

    try:
        user_params = envelope["user"]
        user_id = get_or_create_user(user_params["provider"], user_params["id"])
    except KeyError as e:
        return (str(e), 400)

    # Flush the stdout to avoid log buffering.
    sys.stdout.flush()

    return jsonify(id=user_id.get_guid())


@app.route("/user/oauth/basic/set/v1", methods=["POST"])
def handle_set_basic_oauth_creds():
    envelope = request.get_json()

    try:
        user_id = get_by_guid(envelope["userId"])

        creds_params = envelope["oauthCredentials"]
        set_basic_access_token(user_id, creds_params["accessToken"])
        set_basic_refresh_token(user_id, creds_params["refreshToken"])
    except KeyError as e:
        return (str(e), 400)

    # Flush the stdout to avoid log buffering.
    sys.stdout.flush()

    return ("", 200)


def _get_profile_identifier(client: AuthenticatedClient) -> str:
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


@app.route("/user/portfolio-profile/create/v1", methods=["POST"])
def handle_create_cbpro_profile():
    envelope = request.get_json()

    try:
        user_id = get_by_guid(envelope["userId"])

        namespace = envelope.get("profileNamespace", DEFAULT_NS)

        creds = envelope["profileCredentials"]
        api_key = creds["apiKey"]
        api_secret = creds["b64Secret"]
        api_passphrase = creds["passphrase"]
    except KeyError as e:
        return (str(e), 400)

    # fetch CBPro profile id
    api_url = PROFILE_NAMESPACE_TO_API_URL[namespace]
    client = AuthenticatedClient(api_key, api_secret, api_passphrase, api_url=api_url)
    identifier = _get_profile_identifier(client)

    # create profile
    profile_id = get_or_create_profile(namespace, identifier, user_id)
    _set_profile_secrets(profile_id, api_key, api_secret, api_passphrase)

    # Flush the stdout to avoid log buffering.
    sys.stdout.flush()

    return ("", 200)
