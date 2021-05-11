from backend.core.secrets.secrets_helper import get_secret, set_secret
from backend.core.user import UserId


def get_basic_access_token(user_id: UserId) -> str:
    return get_secret(f"USER_BASIC_ACCESS_TOKEN_{user_id.get_guid()}")


def set_basic_access_token(user_id: UserId, access_token: str) -> None:
    set_secret(f"USER_BASIC_ACCESS_TOKEN_{user_id.get_guid()}", access_token)


def get_basic_refresh_token(user_id: UserId) -> str:
    return get_secret(f"USER_BASIC_REFRESH_TOKEN_{user_id.get_guid()}")


def set_basic_refresh_token(user_id: UserId, refresh_token: str) -> None:
    set_secret(f"USER_BASIC_REFRESH_TOKEN_{user_id.get_guid()}", refresh_token)
