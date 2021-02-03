import sys
from typing import Generator, Tuple

from flask import Flask, request

from .firestore_helper import get_db
from .pubsub_helper import get_event_field, publisher

app = Flask(__name__)


def _get_profiles_on_schedule(
    schedule_id: str,
) -> Generator[None, Tuple[str, str], None]:
    profiles_query = (
        get_db().collection("profiles").where("schedule", "==", schedule_id)
    )
    unique_profiles = set()
    for profile_doc in profiles_query.stream():
        profile_data = profile_doc.to_dict()
        profile_id = (profile_data["namespace"], profile_data["identifier"])
        if profile_id in unique_profiles:
            raise Exception(
                f"Encountered duplicate profile: 'namespace': {profile_id[0]}, 'identifier': {profile_id[1]}"
            )
        unique_profiles.add(profile_id)

        yield profile_id


@app.route("/", methods=["POST"])
def handle_event():
    envelope = request.get_json()
    schedule_id = get_event_field(envelope)
    print(f"Starting fanout for schedule '{schedule_id}'...")

    profiles_count = 0
    with publisher() as pub:
        for namespace, identifier in _get_profiles_on_schedule(schedule_id):
            pub.publish_event(
                {"profile": {"namespace": namespace, "identifier": identifier}}
            )
            profiles_count += 1

    print(f"Published events for {profiles_count} profiles")

    # Flush the stdout to avoid log buffering.
    sys.stdout.flush()

    return "", 204
