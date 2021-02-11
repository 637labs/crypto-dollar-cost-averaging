import argparse
from typing import List, Tuple, Dict

from ..app.firestore_helper import get_db
from ..app.profile import ProfileId, get_profile_subcollection


def build_argparser():
    parser = argparse.ArgumentParser()
    parser.add_argument("--profile-nickname", required=True, type=str)
    parser.add_argument(
        "--deposit",
        required=True,
        action="append",
        nargs=3,
        metavar=("asset", "USD amount", "schedule ID"),
    )
    return parser


def postprocess_deposits(
    deposits: List[Tuple[str, str, str]]
) -> Dict[str, Tuple[float, str]]:
    return {dep[0]: (float(dep[1]), dep[2]) for dep in deposits}


def set_target_deposits(
    profile_id: ProfileId, deposit_specs: Dict[str, Tuple[float, str]]
):
    deposits_collection = get_profile_subcollection(profile_id, "target_deposits")
    for configured_deposit in deposits_collection.stream():
        if configured_deposit.id not in deposit_specs:
            configured_deposit.reference.delete()

    for asset, (amount, schedule_id) in deposit_specs.items():
        product_id = f"{asset}-USD"
        deposits_collection.document(product_id).set(
            {"deposit_amount": amount, "schedule": schedule_id}
        )


if __name__ == "__main__":
    argument_parser = build_argparser()
    args = argument_parser.parse_args()

    [profile] = list(
        get_db()
        .collection("profiles")
        .where("nickname", "==", args.profile_nickname)
        .stream()
    )
    profile_id = ProfileId(profile.get("namespace"), profile.get("identifier"))
    print(f"Found ProfileId@{profile_id.get_guid()}")

    deposit_specs = postprocess_deposits(args.deposit)
    print(f"Configuring with {deposit_specs}...")
    set_target_deposits(profile_id, deposit_specs)
    print("Done!")
