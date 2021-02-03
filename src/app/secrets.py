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


def _get_secret_parent_name() -> str:
    return f"projects/{_PROJECT_ID}"


def _get_qualified_secret_name(secret_name: str) -> str:
    return f"projects/{_PROJECT_ID}/secrets/{secret_name}/versions/latest"


def get_secret(secret_name: str) -> str:
    res = _get_client().access_secret_version(
        name=_get_qualified_secret_name(secret_name)
    )
    return res.payload.data.decode("utf-8")


def create_secret(secret_name: str, secret_payload: str) -> None:
    secret = _get_client().create_secret(
        {
            "parent": _get_secret_parent_name(),
            "secret_id": secret_name,
            "secret": {"replication": {"automatic": []}},
        }
    )
    _get_client().add_secret_version(
        parent=secret.name, payload={"data": secret_payload.encode()}
    )


def get_api_key(profile_id: ProfileId) -> str:
    return get_secret(f"API_KEY_{profile_id.get_guid()}")


def create_api_key(profile_id: ProfileId, api_key: str) -> None:
    create_secret(f"API_KEY_{profile_id.get_guid()}", api_key)


def get_api_b64_secret(profile_id: ProfileId) -> str:
    return get_secret(f"API_SECRET_{profile_id.get_guid()}")


def create_api_b64_secret(profile_id: ProfileId, api_b64_secret: str) -> None:
    create_secret(f"API_SECRET_{profile_id.get_guid()}", api_b64_secret)


def get_api_passphrase(profile_id: ProfileId) -> str:
    return get_secret(f"API_PASSPHRASE_{profile_id.get_guid()}")


def create_api_passphrase(profile_id: ProfileId, api_passphrase: str) -> None:
    create_secret(f"API_PASSPHRASE_{profile_id.get_guid()}", api_passphrase)
