import base64

from .firestore import get_db

LOCAL_NS = "LOCAL"
SANDBOX_NS = "SANDBOX"
_VALID_NAMESPACES = [SANDBOX_NS, LOCAL_NS]

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
