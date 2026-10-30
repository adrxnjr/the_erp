import uuid
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional
import jwt
import bcrypt

from app.core.config import settings
from app.core.exceptions import AppError


def hash_password(password: str) -> str:
    """Hash plaintext password using bcrypt with salt."""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify plaintext password against bcrypt hash."""
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8"),
        )
    except Exception:
        return False


def create_token(
    subject: str,
    token_type: str,
    expires_delta: timedelta,
    extra_claims: Optional[Dict[str, Any]] = None,
) -> tuple[str, str, datetime]:
    """
    Creates a signed JWT with standard claims: sub, exp, iat, jti, and type.
    Returns (token_str, jti, expires_at).
    """
    now = datetime.now(timezone.utc)
    expires_at = now + expires_delta
    jti = str(uuid.uuid4())

    payload: Dict[str, Any] = {
        "sub": subject,
        "type": token_type,
        "jti": jti,
        "iat": int(now.timestamp()),
        "exp": int(expires_at.timestamp()),
    }

    if extra_claims:
        # Exclude reserved keys from extra_claims to prevent tampering
        for k, v in extra_claims.items():
            if k not in payload:
                payload[k] = v

    token = jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return token, jti, expires_at


def create_access_token(
    user_id: str,
    roles: List[str],
    portal_type: str,
) -> tuple[str, str, datetime]:
    """Generates a short-lived access JWT (default: 30 minutes)."""
    return create_token(
        subject=user_id,
        token_type="access",
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
        extra_claims={
            "roles": roles,
            "portal_type": portal_type,
        },
    )


def create_refresh_token(
    user_id: str,
    portal_type: str,
) -> tuple[str, str, datetime]:
    """Generates a long-lived refresh JWT (default: 7 days)."""
    return create_token(
        subject=user_id,
        token_type="refresh",
        expires_delta=timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
        extra_claims={
            "portal_type": portal_type,
        },
    )


def decode_token(token: str, expected_type: Optional[str] = None) -> Dict[str, Any]:
    """
    Decodes and validates a JWT signature and expiration.
    Optionally enforces expected token type ('access' or 'refresh').
    """
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
            options={"require": ["exp", "iat", "sub", "jti", "type"]},
            leeway=120,
        )
    except jwt.ExpiredSignatureError:
        raise AppError(
            message="Token has expired. Please authenticate again.",
            status_code=401,
            error_code="TOKEN_EXPIRED",
        )
    except jwt.InvalidTokenError as exc:
        raise AppError(
            message=f"Invalid authentication token: {str(exc)}",
            status_code=401,
            error_code="INVALID_TOKEN",
        )

    if expected_type and payload.get("type") != expected_type:
        raise AppError(
            message=f"Invalid token type. Expected '{expected_type}', got '{payload.get('type')}'.",
            status_code=401,
            error_code="INVALID_TOKEN_TYPE",
        )

    return payload
