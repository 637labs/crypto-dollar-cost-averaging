from contextlib import contextmanager

from google.cloud import firestore

_CLIENT = None

SERVER_TIMESTAMP = firestore.SERVER_TIMESTAMP
transactional = firestore.transactional
Transaction = firestore.Transaction
OrderDescending = firestore.Query.DESCENDING


def get_db():
    global _CLIENT
    if not _CLIENT:
        _CLIENT = firestore.Client()
    return _CLIENT


_LOCKS = u"locks"
_LOCK_VAL = u"value"


class _Lock:
    def __init__(
        self, lock_ref: firestore.DocumentReference, transaction: firestore.Transaction
    ):
        self._lock_ref = lock_ref
        self._transaction = transaction

        lock_snapshot = lock_ref.get(transaction=transaction)
        self._initial_value = lock_snapshot.to_dict().get(_LOCK_VAL, 0)

    def increment(self):
        self._transaction.update(self._lock_ref, {_LOCK_VAL: self._initial_value + 1})


def _acquire_lock(key: str, transaction: firestore.Transaction):
    lock_ref = get_db().collection(_LOCKS).document(key)
    return _Lock(lock_ref, transaction)


@contextmanager
def lock_on_key(key: str, transaction: firestore.Transaction):
    lock = _acquire_lock(key, transaction)
    try:
        yield
    except:
        pass
    else:
        lock.increment()
