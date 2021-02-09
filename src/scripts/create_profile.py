import argparse

from cbpro import AuthenticatedClient

from ..app.client_helper import PROFILE_NAMESPACE_TO_API_URL
from ..app.profile import ProfileId, create_profile, set_profile_nickname
from ..app.secrets import create_api_b64_secret, create_api_key, create_api_passphrase


def build_argparser():
    parser = argparse.ArgumentParser()
    parser.add_argument("--namespace", required=True, type=str)
    parser.add_argument("--api-key", required=True, type=str)
    parser.add_argument("--api-secret", required=True, type=str)
    parser.add_argument("--api-passphrase", required=True, type=str)
    parser.add_argument("--profile-nickname", required=False, type=str)
    return parser


def get_profile_identifier(client: AuthenticatedClient) -> str:
    profile_ids = {acc["profile_id"] for acc in client.get_accounts()}
    assert len(profile_ids) == 1
    [identifier] = [p_id for p_id in profile_ids]
    return identifier


def create_secrets(
    profile_id: ProfileId, api_key: str, api_secret: str, api_passphrase: str
) -> None:
    create_api_key(profile_id, api_key)
    create_api_b64_secret(profile_id, api_secret)
    create_api_passphrase(profile_id, api_passphrase)


if __name__ == "__main__":
    argument_parser = build_argparser()
    args = argument_parser.parse_args()

    api_url = PROFILE_NAMESPACE_TO_API_URL[args.namespace]

    client = AuthenticatedClient(
        args.api_key, args.api_secret, args.api_passphrase, api_url=api_url
    )

    identifier = get_profile_identifier(client)
    print(f"Fetched profile identifier: '{identifier}'")

    print("Creating profile...")
    profile_id = create_profile(args.namespace, identifier)
    print(f"Done, created ProfileId@{profile_id.get_guid()}")
    if args.profile_nickname:
        print(f"Setting profile nickname to '{args.profile_nickname}'")
        set_profile_nickname(profile_id, args.profile_nickname)

    print("Creating secrets...")
    create_secrets(profile_id, args.api_key, args.api_secret, args.api_passphrase)
    print("Done")
