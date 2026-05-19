import time
from typing import Any

from app.config import settings

_cache: dict[str, tuple[Any, float, int]] = {}


def get_cached(key: str) -> Any | None:
    item = _cache.get(key)
    if not item:
        return None
    if len(item) == 2:
        data, timestamp = item
        ttl = settings.cache_ttl_seconds
    else:
        data, timestamp, ttl = item
    if time.time() - timestamp > ttl:
        _cache.pop(key, None)
        return None
    return data


def set_cached(key: str, data: Any, ttl: int | None = None) -> None:
    _cache[key] = (data, time.time(), ttl or settings.cache_ttl_seconds)


def delete_cached(key: str) -> None:
    _cache.pop(key, None)
