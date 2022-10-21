import base64
import os
from typing import Optional

from backend.core.firestore_helper import get_db, lock_on_key, transactional
from backend.core.user import UserId

LOCAL_NS = "LOCAL"
SANDBOX_NS = "SANDBOX"
CBPRO_BETA_NS = "CBPRO_BETA"
_VALID_NAMESPACES = (LOCAL_NS, SANDBOX_NS, CBPRO_BETA_NS)

DEFAULT_NS = os.environ.get("DEFAULT_PROFILE_NAMESPACE", CBPRO_BETA_NS)
assert DEFAULT_NS in _VALID_NAMESPACES

_PROFILES_COLLECTION = "profiles"


class ProfileNotFoundError(Exception):
    pass


class ProfileUserMismatchError(Exception):
    pass


class ProfileId:
    def __init__(self, namespace: str, identifier: str):
        assert namespace in _VALID_NAMESPACES
        self.namespace = namespace
        self.identifier = identifier

        self._guid = None

    def _get_qualified_id(self) -> str:
        return f"{self.namespace}:{self.identifier}"

    def _get_b32_qualified_id(self) -> str:
        """Base32-encoded qualified ID.

        Standard Base32 character set is used, with '=' substituted by '_'
        """
        return (
            base64.b32encode(self._get_qualified_id().encode())
            .decode()
            .replace("=", "_")
        )

    def get_guid(self) -> str:
        if not self._guid:
            if self.namespace == LOCAL_NS:
                self._guid = self._get_b32_qualified_id()
            else:
                profile_query = (
                    get_db()
                    .collection(_PROFILES_COLLECTION)
                    .where("namespace", "==", self.namespace)
                    .where("identifier", "==", self.identifier)
                )
                [profile_ref] = profile_query.stream()

                self._guid = profile_ref.id

        return self._guid


def get_profile_field(profile_id: ProfileId, field: str):
    profile_ref = (
        get_db().collection(_PROFILES_COLLECTION).document(profile_id.get_guid())
    )
    profile = profile_ref.get()
    if not profile.exists:
        raise Exception(f"Could not locate profile '{profile_id.get_guid()}'")

    profile_data = profile.to_dict()
    if field not in profile_data:
        raise Exception(f"Profile does not contain field '{field}'")
    return profile_data[field]


def _set_profile_field(profile_id: ProfileId, field: str, value):
    profile_ref = (
        get_db().collection(_PROFILES_COLLECTION).document(profile_id.get_guid())
    )
    profile = profile_ref.get()
    if not profile.exists:
        raise Exception(f"Could not locate profile '{profile_id.get_guid()}'")

    profile_ref.update({field: value})


def set_profile_nickname(profile_id: ProfileId, nickname: str):
    _set_profile_field(profile_id, "nickname", nickname)


def get_profile_subcollection(profile_id: ProfileId, subcollection_id: str):
    profile_ref = (
        get_db().collection(_PROFILES_COLLECTION).document(profile_id.get_guid())
    )
    return profile_ref.collection(subcollection_id)


@transactional
def _create_profile(transaction, namespace, identifier):
    matching_profile_query = (
        get_db()
        .collection(_PROFILES_COLLECTION)
        .where("namespace", "==", namespace)
        .where("identifier", "==", identifier)
    )
    matches = list(matching_profile_query.stream(transaction=transaction))
    if matches:
        raise Exception(
            f"Profile <'namespace':'{namespace}', 'identifier':'{identifier}'> already exists!"
        )
    profile_ref = get_db().collection(_PROFILES_COLLECTION).document()
    transaction.create(profile_ref, {"namespace": namespace, "identifier": identifier})

    return ProfileId(namespace, identifier)


@transactional
def _get_or_create_profile(transaction, namespace, identifier, user: UserId = None):
    matching_profile_query = (
        get_db()
        .collection(_PROFILES_COLLECTION)
        .where("namespace", "==", namespace)
        .where("identifier", "==", identifier)
    )
    matches = list(matching_profile_query.stream(transaction=transaction))
    if len(matches) == 1:
        [profile] = matches

        # make sure user is set
        if user:
            current_user = profile.to_dict().get("user")
            if current_user and current_user != user.get_guid():
                raise Exception(f"Unexpected user set for ProfileId@{profile.id}")
            elif not current_user:
                transaction.update(profile.reference, {"user": user.get_guid()})

        return ProfileId(namespace, identifier)
    elif matches:
        raise Exception(
            f"Multiple profiles exist with <'namespace':'{namespace}', 'identifier':'{identifier}'>!"
        )
    profile_ref = get_db().collection(_PROFILES_COLLECTION).document()
    profile_data = {"namespace": namespace, "identifier": identifier}
    if user:
        profile_data["user"] = user.get_guid()
    transaction.create(profile_ref, profile_data)

    return ProfileId(namespace, identifier)


def create_profile(namespace: str, identifier: str) -> ProfileId:
    transaction = get_db().transaction()
    return _create_profile(transaction, namespace, identifier)


def get_or_create_profile(
    namespace: str, identifier: str, user: UserId = None
) -> ProfileId:
    transaction = get_db().transaction()
    return _get_or_create_profile(transaction, namespace, identifier, user)


def delete_profile(profile_id: ProfileId) -> None:
    get_db().collection(_PROFILES_COLLECTION).document(profile_id.get_guid()).delete()


def get_for_user(user: UserId, namespace: str) -> Optional[ProfileId]:
    query = (
        get_db()
        .collection(_PROFILES_COLLECTION)
        .where("namespace", "==", namespace)
        .where("user", "==", user.get_guid())
    )
    matches = list(query.stream())
    if matches:
        [profile] = matches
        return ProfileId(profile.get("namespace"), profile.get("identifier"))
    return None


def get_by_guid(profile_guid: str, user: Optional[UserId] = None) -> ProfileId:
    profile = get_db().collection(_PROFILES_COLLECTION).document(profile_guid).get()
    if not profile.exists:
        raise ProfileNotFoundError(f"Did not find ProfileId@{profile_guid}")
    if user and profile.get("user") != user.get_guid():
        raise ProfileUserMismatchError(
            f"ProfileId@{profile_guid} does not belong to UserId@{user.get_guid()}"
        )
    return ProfileId(profile.get("namespace"), profile.get("identifier"))
