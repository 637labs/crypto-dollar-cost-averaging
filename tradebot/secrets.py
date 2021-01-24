import os

from google.cloud import secretmanager

from .profile import ProfileId

_PROJECT_ID = os.environ["GCLOUD_PROJECT"]

_CLIENT: secretmanager.SecretManagerServiceClient = None


def _get_client() -> secretmanager.SecretManagerServiceClient:
    global _CLIENT
    if not _CLIENT:
        _CLIENT = secretmanager.SecretManagerServiceClient()

    return _CLIENT


def _get_qualified_secret_name(secret_name: str) -> str:
    return f"projects/{_PROJECT_ID}/secrets/{secret_name}/versions/latest"


def get_secret(secret_name: str) -> str:
    res = _get_client().access_secret_version(
        name=_get_qualified_secret_name(secret_name)
    )
    return res.payload.data.decode("utf-8")


def get_api_key(profile_id: ProfileId) -> str:
    return get_secret(f"API_KEY_{profile_id.get_guid()}")


def get_api_b64_secret(profile_id: ProfileId) -> str:
    return get_secret(f"API_SECRET_{profile_id.get_guid()}")


def get_api_passphrase(profile_id: ProfileId) -> str:
    return get_secret(f"API_PASSPHRASE_{profile_id.get_guid()}")
