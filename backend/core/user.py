from .firestore_helper import get_db, lock_on_key, transactional

COINBASE = "coinbase"
_VALID_PROVIDERS = (COINBASE,)

_USERS_COLLECTION = "users"


class UserNotFoundError(Exception):
    pass


class UserId:
    def __init__(self, provider, identifier):
        assert provider in _VALID_PROVIDERS
        self.provider = provider
        self.identifier = identifier

        self._guid = None

    def get_guid(self) -> str:
        if not self._guid:
            user_query = (
                get_db()
                .collection(_USERS_COLLECTION)
                .where("provider", "==", self.provider)
                .where("identifier", "==", self.identifier)
            )
            [user] = user_query.stream()

            self._guid = user.id

        return self._guid


@transactional
def _create_user(transaction, provider, identifier):
    matching_user_query = (
        get_db()
        .collection(_USERS_COLLECTION)
        .where("provider", "==", provider)
        .where("identifier", "==", identifier)
    )
    matches = list(matching_user_query.stream(transaction=transaction))
    if matches:
        raise Exception(
            f"User <'provider':'{provider}', 'identifier':'{identifier}'> already exists!"
        )
    user_ref = get_db().collection(_USERS_COLLECTION).document()
    transaction.create(user_ref, {"provider": provider, "identifier": identifier})

    return UserId(provider, identifier)


@transactional
def _get_or_create_user(transaction, provider, identifier, email):
    matching_user_query = (
        get_db()
        .collection(_USERS_COLLECTION)
        .where("provider", "==", provider)
        .where("identifier", "==", identifier)
    )
    matches = list(matching_user_query.stream(transaction=transaction))
    if len(matches) == 1:
        [user] = matches
        # Update the user's email with the latest shared by the provider
        transaction.update(user.reference, {"email": email})
        return UserId(user.get("provider"), user.get("identifier"))
    elif matches:
        raise Exception(
            f"Multiple users exist with <'provider':'{provider}', 'identifier':'{identifier}'>!"
        )
    user_ref = get_db().collection(_USERS_COLLECTION).document()
    transaction.create(
        user_ref, {"provider": provider, "identifier": identifier, "email": email}
    )

    return UserId(provider, identifier)


def create_user(provider: str, identifier: str) -> UserId:
    transaction = get_db().transaction()
    return _create_user(transaction, provider, identifier)


def get_or_create_user(provider: str, identifier: str, email: str) -> UserId:
    transaction = get_db().transaction()
    return _get_or_create_user(transaction, provider, identifier, email)


def get_by_guid(user_guid: str) -> UserId:
    user = get_db().collection(_USERS_COLLECTION).document(user_guid).get()
    if not user.exists:
        raise UserNotFoundError(f"Did not find UserId@{user_guid}")
    return UserId(user.get("provider"), user.get("identifier"))
