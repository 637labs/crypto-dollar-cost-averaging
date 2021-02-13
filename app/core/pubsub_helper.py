import base64
import json
import os
from contextlib import contextmanager

from google.cloud import pubsub_v1


_CLIENT = pubsub_v1.PublisherClient()


class _ContextualPublisher:
    def __init__(self, futures: list):
        self._topic_path = _CLIENT.topic_path(
            os.environ["GCLOUD_PROJECT"], os.environ["TARGET_TOPIC"]
        )
        self._futures = futures

    def publish_event(self, data: dict) -> None:
        json_data = json.dumps(data)
        b64data = base64.standard_b64encode(json_data.encode())
        future = _CLIENT.publish(self._topic_path, b64data)
        self._futures.append(future)


@contextmanager
def publisher():
    futures = []
    yield _ContextualPublisher(futures)
    [f.result() for f in futures]


def get_event_field(envelope) -> str:
    if not envelope:
        raise Exception("no Pub/Sub message received")

    if not isinstance(envelope, dict) or "message" not in envelope:
        raise Exception("invalid Pub/Sub message format")

    pubsub_message = envelope["message"]

    if not isinstance(pubsub_message, dict):
        raise Exception("expected 'message' to be a dict")

    b64data = pubsub_message["data"]
    return base64.standard_b64decode(b64data).decode()


def _deserialize_data_dict(ser_data: str) -> dict:
    deser_1 = base64.standard_b64decode(ser_data)
    deser_2 = base64.standard_b64decode(deser_1).decode()
    return json.loads(deser_2)


def get_event_data_dict(envelope) -> dict:
    if not envelope:
        raise Exception("no Pub/Sub message received")

    if not isinstance(envelope, dict) or "message" not in envelope:
        raise Exception("invalid Pub/Sub message format")

    pubsub_message = envelope["message"]

    if not isinstance(pubsub_message, dict):
        raise Exception("expected 'message' to be a dict")

    data_b64 = pubsub_message["data"]
    return _deserialize_data_dict(data_b64)
