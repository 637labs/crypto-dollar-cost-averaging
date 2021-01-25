import base64
import json

from .rest_helper import log_and_format_error


def _deserialize_message_data(ser_data: str) -> dict:
    deser = base64.standard_b64decode(ser_data)
    return json.loads(deser)


def get_event_data(envelope, logger) -> dict:
    if not envelope:
        return log_and_format_error("no Pub/Sub message received", logger)

    if not isinstance(envelope, dict) or "message" not in envelope:
        return log_and_format_error("invalid Pub/Sub message format", logger)

    pubsub_message = envelope["message"]

    if not isinstance(pubsub_message, dict):
        return log_and_format_error("expected 'message' to be a dict", logger)

    data_b64 = pubsub_message["data"]
    return _deserialize_message_data(data_b64)
