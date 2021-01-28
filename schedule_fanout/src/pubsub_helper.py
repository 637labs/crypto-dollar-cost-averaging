import base64
import json
import os
from contextlib import contextmanager

from google.cloud import pubsub_v1


PROJECT_ID = os.environ["GCLOUD_PROJECT"]
TARGET_TOPIC_ID = os.environ["TARGET_TOPIC"]

_CLIENT = pubsub_v1.PublisherClient()
_TOPIC_PATH = _CLIENT.topic_path(PROJECT_ID, TARGET_TOPIC_ID)


class _ContextualPublisher:
    def __init__(self, futures: list):
        self._futures = futures

    def publish_event(self, data: dict) -> None:
        json_data = json.dumps(data)
        b64data = base64.standard_b64encode(json_data.encode())
        future = _CLIENT.publish(_TOPIC_PATH, b64data)
        self._futures.append(future)


@contextmanager
def publisher():
    futures = []
    yield _ContextualPublisher(futures)
    [f.result() for f in futures]


def get_event_data(envelope) -> str:
    if not envelope:
        raise Exception("no Pub/Sub message received")

    if not isinstance(envelope, dict) or "message" not in envelope:
        raise Exception("invalid Pub/Sub message format")

    pubsub_message = envelope["message"]

    if not isinstance(pubsub_message, dict):
        raise Exception("expected 'message' to be a dict")

    b64data = pubsub_message["data"]
    return base64.standard_b64decode(b64data).decode()
