import time
from typing import Any

from app.config import settings

_cache: dict[str, tuple[Any, float]] = {}


def get_cached(key: str) -> Any | None:
    item = _cache.get(key)
    if not item:
        return None
    data, timestamp = item
    if time.time() - timestamp > settings.cache_ttl_seconds:
        _cache.pop(key, None)
        return None
    return data


def set_cached(key: str, data: Any) -> None:
    _cache[key] = (data, time.time())

