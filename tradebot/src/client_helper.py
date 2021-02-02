import os

from cbpro import AuthenticatedClient

from .profile import CBPRO_BETA_NS, LOCAL_NS, SANDBOX_NS, ProfileId
from .secrets import get_api_b64_secret, get_api_key, get_api_passphrase

_PROFILE_NAMESPACE_TO_API_URL = {
    SANDBOX_NS: "https://api-public.sandbox.pro.coinbase.com",
    CBPRO_BETA_NS: "https://api.pro.coinbase.com",
}


def _get_api_url_for_user_namespace(namespace: str) -> str:
    return _PROFILE_NAMESPACE_TO_API_URL[namespace]


def _build_client_from_env() -> AuthenticatedClient:
    api_key = os.environ["API_KEY"]
    b64secret = os.environ["API_KEY_SECRET"]
    passphrase = os.environ["API_KEY_PW"]

    api_url = os.environ["API_URL"]

    return AuthenticatedClient(api_key, b64secret, passphrase, api_url=api_url)


def _build_client_for_profile(profile: ProfileId) -> AuthenticatedClient:
    api_key = get_api_key(profile)
    b64secret = get_api_b64_secret(profile)
    passphrase = get_api_passphrase(profile)

    api_url = _get_api_url_for_user_namespace(profile.namespace)

    return AuthenticatedClient(api_key, b64secret, passphrase, api_url=api_url)


def get_client(profile: ProfileId) -> AuthenticatedClient:
    if profile.namespace == LOCAL_NS:
        return _build_client_from_env()
    else:
        return _build_client_for_profile(profile)
