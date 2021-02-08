import sys
from typing import Generator, Tuple

from flask import Flask, request

from .firestore_helper import get_db
from .pubsub_helper import get_event_field, publisher

app = Flask(__name__)


def _get_target_deposits_on_schedule(
    schedule_id: str,
) -> Generator[None, Tuple[str, str, str], None]:
    target_deposits_query = (
        get_db()
        .collection_group("target_deposits")
        .where("schedule", "==", schedule_id)
    )

    for deposit in target_deposits_query.stream():
        product_id = deposit.id
        parent_profile_ref = deposit.reference.parent.parent
        assert parent_profile_ref and parent_profile_ref.parent.id == "profiles"
        parent_profile = parent_profile_ref.get()
        assert parent_profile.exists

        yield (
            parent_profile.get("namespace"),
            parent_profile.get("identifier"),
            product_id,
        )


@app.route("/", methods=["POST"])
def handle_event():
    envelope = request.get_json()
    schedule_id = get_event_field(envelope)
    print(f"Starting fanout for schedule '{schedule_id}'...")

    events_count = 0
    with publisher() as pub:
        for namespace, identifier, product_id in _get_target_deposits_on_schedule(
            schedule_id
        ):
            pub.publish_event(
                {
                    "profile": {"namespace": namespace, "identifier": identifier},
                    "product": product_id,
                }
            )
            events_count += 1

    print(f"Published {events_count} fanout events")

    # Flush the stdout to avoid log buffering.
    sys.stdout.flush()

    return "", 204
