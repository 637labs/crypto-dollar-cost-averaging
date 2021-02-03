from typing import Tuple


def format_error(msg: str) -> Tuple[str, int]:
    return f"Bad Request: {msg}", 400