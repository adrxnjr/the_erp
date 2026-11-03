import logging
from slowapi import Limiter
from slowapi.util import get_remote_address
from app.core.config import settings

logger = logging.getLogger(__name__)

# Rate limiter instance keyed by client IP address.
# In multi-worker production environments, supply REDIS_URL (e.g. redis://:auth@redis:6379/0)
# to distribute rate-limit buckets across all ASGI worker processes.
# In development or single-node mode, safely defaults to in-memory storage.
storage_uri = "memory://"
if settings.REDIS_URL:
    storage_uri = settings.REDIS_URL
    logger.info("Configured distributed SlowAPI rate limiter backed by Redis: %s", storage_uri)
else:
    logger.info("Using in-memory SlowAPI rate limiter (default for development/single-worker)")

limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["100/minute"],
    storage_uri=storage_uri,
)
