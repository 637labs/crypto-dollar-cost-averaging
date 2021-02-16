import sys

from flask import Flask, request, jsonify

from backend.core.user import get_by_guid, get_or_create_user
from backend.core.secrets.user_secrets import (
    set_basic_access_token,
    set_basic_refresh_token,
)

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
