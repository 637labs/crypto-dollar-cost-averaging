import os

from google.api_core.exceptions import NotFound
from google.cloud import secretmanager

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
    return f"projects/{_PROJECT_ID}/secrets/{secret_name}"


def _get_qualified_secret_version_name(secret_name: str) -> str:
    return f"projects/{_PROJECT_ID}/secrets/{secret_name}/versions/latest"


def get_secret(secret_name: str) -> str:
    res = _get_client().access_secret_version(
        name=_get_qualified_secret_version_name(secret_name)
    )
    return res.payload.data.decode("utf-8")


def create_secret(secret_name: str, secret_payload: str) -> None:
    secret = _get_client().create_secret(
        {
            "parent": _get_secret_parent_name(),
            "secret_id": secret_name,
            "secret": {"replication": {"automatic": {}}},
        }
    )
    _get_client().add_secret_version(
        parent=secret.name, payload={"data": secret_payload.encode()}
    )


def set_secret(secret_name: str, secret_payload: str) -> None:
    try:
        secret = _get_client().get_secret(name=_get_qualified_secret_name(secret_name))
    except NotFound:
        create_secret(secret_name, secret_payload)
    else:
        stale_versions = list(
            _get_client().list_secret_versions({"parent": secret.name})
        )
        _get_client().add_secret_version(
            parent=secret.name, payload={"data": secret_payload.encode()}
        )
        for stale_v in stale_versions:
            _get_client().destroy_secret_version(name=stale_v.name)
