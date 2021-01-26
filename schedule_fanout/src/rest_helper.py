from typing import Tuple


def log_and_format_error(msg: str, logger) -> Tuple[str, int]:
    logger.error(f"error: {msg}")
    return f"Bad Request: {msg}", 400