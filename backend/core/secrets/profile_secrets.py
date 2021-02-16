from backend.core.profile import ProfileId
from backend.core.secrets.secrets_helper import create_secret, get_secret


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
