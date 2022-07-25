import os

from coinbasepro import AuthenticatedClient, PublicClient

from .profile import CBPRO_BETA_NS, LOCAL_NS, SANDBOX_NS, ProfileId
from backend.core.secrets.profile_secrets import (
    get_api_b64_secret,
    get_api_key,
    get_api_passphrase,
)

PROFILE_NAMESPACE_TO_API_URL = {
    SANDBOX_NS: "https://api-public.sandbox.pro.coinbase.com",
    CBPRO_BETA_NS: "https://api.pro.coinbase.com",
}

_CLIENT_BY_NAMESPACE = {}


class CbProAuthenticatedClient(AuthenticatedClient):
    def get_profile(self, profile_id: str):
        """
        Args:
            profile_id: str ID, e.g. "86602c68-306a-4500-ac73-4ce56a91d83c"

        Returns:
            dict: profile details. Example:
                {
                    "id": "86602c68-306a-4500-ac73-4ce56a91d83c",
                    "user_id": "5844eceecf7e803e259d0365",
                    "name": "default portfolio",
                    "active": true,
                    "is_default": true,
                    "created_at": "2019-11-18T15:08:40.236309Z"
                }
        """
        return self._send_message("get", "/profiles/" + profile_id)


def _get_api_url_for_user_namespace(namespace: str) -> str:
    return PROFILE_NAMESPACE_TO_API_URL[namespace]


def _build_client_from_env() -> CbProAuthenticatedClient:
    api_key = os.environ["API_KEY"]
    b64secret = os.environ["API_KEY_SECRET"]
    passphrase = os.environ["API_KEY_PW"]

    api_url = os.environ["API_URL"]

    return CbProAuthenticatedClient(api_key, b64secret, passphrase, api_url=api_url)


def _build_client_for_profile(profile: ProfileId) -> CbProAuthenticatedClient:
    api_key = get_api_key(profile)
    b64secret = get_api_b64_secret(profile)
    passphrase = get_api_passphrase(profile)

    api_url = _get_api_url_for_user_namespace(profile.namespace)

    return CbProAuthenticatedClient(api_key, b64secret, passphrase, api_url=api_url)


def get_client(profile: ProfileId) -> CbProAuthenticatedClient:
    if profile.namespace == LOCAL_NS:
        return _build_client_from_env()
    else:
        return _build_client_for_profile(profile)


def get_public_client(namespace: str) -> PublicClient:
    if namespace not in _CLIENT_BY_NAMESPACE:
        _CLIENT_BY_NAMESPACE[namespace] = PublicClient(
            api_url=PROFILE_NAMESPACE_TO_API_URL[namespace]
        )
    return _CLIENT_BY_NAMESPACE[namespace]
