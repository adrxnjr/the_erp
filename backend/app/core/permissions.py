import uuid
from typing import Callable, List, Optional
from fastapi import Depends, Header, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload, joinedload

from app.core.exceptions import AppError
from app.core.security import decode_token
from app.db.dependencies import get_db
from app.models.user import User, UserRole

bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    """
    Extracts Bearer token from Authorization header, validates signature,
    and returns the active User from the database.
    """
    if credentials is None:
        raise AppError(
            message="Authentication credentials required. Please provide a Bearer token.",
            status_code=status.HTTP_401_UNAUTHORIZED,
            error_code="NOT_AUTHENTICATED",
        )

    payload = decode_token(credentials.credentials, expected_type="access")
    user_id_str = payload.get("sub")
    if not user_id_str:
        raise AppError(
            message="Malformed authentication token.",
            status_code=status.HTTP_401_UNAUTHORIZED,
            error_code="INVALID_TOKEN",
        )

    try:
        user_uuid = uuid.UUID(user_id_str)
    except ValueError:
        raise AppError(
            message="Malformed user identifier in token.",
            status_code=status.HTTP_401_UNAUTHORIZED,
            error_code="INVALID_TOKEN",
        )

    # Fetch user eagerly with user_roles and role relations
    stmt = (
        select(User)
        .options(selectinload(User.user_roles).joinedload(UserRole.role))
        .where(User.id == user_uuid)
    )
    user = db.execute(stmt).scalar_one_or_none()

    if user is None:
        raise AppError(
            message="User account no longer exists.",
            status_code=status.HTTP_401_UNAUTHORIZED,
            error_code="USER_NOT_FOUND",
        )

    if not user.is_active:
        raise AppError(
            message="User account is deactivated. Contact an administrator.",
            status_code=status.HTTP_403_FORBIDDEN,
            error_code="ACCOUNT_DEACTIVATED",
        )

    if user.is_locked:
        raise AppError(
            message="Account is locked due to consecutive failed login attempts.",
            status_code=status.HTTP_403_FORBIDDEN,
            error_code="ACCOUNT_LOCKED",
        )

    return user


def require_portal(allowed_portal: str) -> Callable[[User], User]:
    """Ensures user is logged into the correct portal ('staff' or 'parent_student')."""
    def portal_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.portal_type != allowed_portal:
            raise AppError(
                message=f"Access denied. Account is not registered for the '{allowed_portal}' portal.",
                status_code=status.HTTP_403_FORBIDDEN,
                error_code="PORTAL_ACCESS_DENIED",
            )
        return current_user
    return portal_checker


def require_roles(*allowed_roles: str) -> Callable[[User], User]:
    """
    RBAC dependency factory. Ensures the current user possesses at least one of the specified roles.
    """
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        # Load user role names
        user_role_names = [ur.role.name for ur in current_user.user_roles if ur.role and ur.role.is_active]

        # Check if user possesses any allowed role (super_admin always has access)
        if "super_admin" in user_role_names:
            return current_user

        has_permission = any(role in user_role_names for role in allowed_roles)
        if not has_permission:
            raise AppError(
                message=f"Insufficient permissions. Requires one of: {', '.join(allowed_roles)}.",
                status_code=status.HTTP_403_FORBIDDEN,
                error_code="FORBIDDEN_ROLE",
            )
        return current_user

    return role_checker


# Convenient pre-configured dependency shortcuts
require_super_admin = require_roles("super_admin")
require_school_admin = require_roles("super_admin", "school_admin", "principal")
require_staff = require_portal("staff")
require_parent_or_student = require_portal("parent_student")
