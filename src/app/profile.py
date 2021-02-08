import base64

from .firestore_helper import get_db, lock_on_key, transactional

LOCAL_NS = "LOCAL"
SANDBOX_NS = "SANDBOX"
CBPRO_BETA_NS = "CBPRO_BETA"
_VALID_NAMESPACES = (LOCAL_NS, SANDBOX_NS, CBPRO_BETA_NS)

_PROFILES_COLLECTION = "profiles"


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


def create_profile(namespace: str, identifier: str) -> ProfileId:
    transaction = get_db().transaction()
    return _create_profile(transaction, namespace, identifier)
