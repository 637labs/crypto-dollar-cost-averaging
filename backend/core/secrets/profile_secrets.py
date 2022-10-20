from backend.core.profile import ProfileId
from backend.core.secrets.secrets_helper import get_secret, set_secret, delete_secret


def get_api_key(profile_id: ProfileId) -> str:
    return get_secret(f"API_KEY_{profile_id.get_guid()}")


def set_api_key(profile_id: ProfileId, api_key: str) -> None:
    set_secret(f"API_KEY_{profile_id.get_guid()}", api_key)


def delete_api_key(profile_id: ProfileId) -> None:
    delete_secret(f"API_KEY_{profile_id.get_guid()}")


def get_api_b64_secret(profile_id: ProfileId) -> str:
    return get_secret(f"API_SECRET_{profile_id.get_guid()}")


def set_api_b64_secret(profile_id: ProfileId, api_b64_secret: str) -> None:
    set_secret(f"API_SECRET_{profile_id.get_guid()}", api_b64_secret)


def delete_api_b64_secret(profile_id: ProfileId) -> None:
    delete_secret(f"API_SECRET_{profile_id.get_guid()}")


def get_api_passphrase(profile_id: ProfileId) -> str:
    return get_secret(f"API_PASSPHRASE_{profile_id.get_guid()}")


def set_api_passphrase(profile_id: ProfileId, api_passphrase: str) -> None:
    set_secret(f"API_PASSPHRASE_{profile_id.get_guid()}", api_passphrase)


def delete_api_passphrase(profile_id: ProfileId) -> None:
    delete_secret(f"API_PASSPHRASE_{profile_id.get_guid()}")
