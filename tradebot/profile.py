import base64

LOCAL_NS = "LOCAL"
SANDBOX_NS = "SANDBOX"
_VALID_NAMESPACES = [SANDBOX_NS, LOCAL_NS]


class ProfileId:
    def __init__(self, namespace: str, identifier: str):
        assert namespace in _VALID_NAMESPACES
        self.namespace = namespace
        self.identifier = identifier

    def get_qualified_id(self):
        return f"{self.namespace}:{self.identifier}"

    def get_b32_qualified_id(self):
        """Base32-encoded qualified ID.

        Standard Base32 character set is used, with '=' substituted by '_'
        """
        return (
            base64.b32encode(self.get_qualified_id().encode())
            .decode()
            .replace("=", "_")
        )
