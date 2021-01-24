from google.cloud import firestore

_CLIENT = None

SERVER_TIMESTAMP = firestore.SERVER_TIMESTAMP


def get_db():
    global _CLIENT
    if not _CLIENT:
        _CLIENT = firestore.Client()
    return _CLIENT