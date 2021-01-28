import base64
import json


def _deserialize_message_data(ser_data: str) -> dict:
    deser_1 = base64.standard_b64decode(ser_data)
    deser_2 = base64.standard_b64decode(deser_1).decode()
    return json.loads(deser_2)


def get_event_data(envelope) -> dict:
    if not envelope:
        raise Exception("no Pub/Sub message received")

    if not isinstance(envelope, dict) or "message" not in envelope:
        raise Exception("invalid Pub/Sub message format")

    pubsub_message = envelope["message"]

    if not isinstance(pubsub_message, dict):
        raise Exception("expected 'message' to be a dict")

    data_b64 = pubsub_message["data"]
    return _deserialize_message_data(data_b64)
