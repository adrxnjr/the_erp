import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import Request, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.core.config import settings
from app.core.exceptions import AppError
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.models.user import RefreshToken, User
from app.schemas.auth import TokenResponse
from app.services.audit_service import record_audit

STAFF_ROLES = {
    "super_admin",
    "principal",
    "correspondent",
    "school_admin",
    "teacher",
    "accountant",
    "non_teaching",
    "driver",
    "transport_coordinator",
    "counselor",
}
PARENT_STUDENT_ROLES = {"parent", "student"}


class AuthService:
    @staticmethod
    def authenticate_and_login(
        db: Session,
        username: str,
        password: str,
        portal_type: str,
        request: Optional[Request] = None,
    ) -> TokenResponse:
        """
        Validates credentials, checks account lockout, portal compatibility,
        and returns access and refresh tokens.
        """
        # 1. Fetch user eagerly with user_roles and role relations
        # Support lookup by username, email, phone_number, or associated student/guardian/staff identifiers
        from app.models.student import Student, Guardian
        from app.models.staff import Staff

        clean_id = username.strip()
        user = None

        # A. Try matching by exact username or email first
        base_stmt = (
            select(User)
            .options(selectinload(User.user_roles))
            .where((User.username == clean_id) | (User.email == clean_id))
        )
        user = db.execute(base_stmt).scalars().first()

        # B. If not found and portal is 'parent', check parent phone via User or Guardian
        if not user and portal_type in ("parent", "parent_student"):
            parent_stmt = (
                select(User)
                .options(selectinload(User.user_roles))
                .outerjoin(Guardian, Guardian.user_id == User.id)
                .where(
                    (User.portal_type == "parent")
                    & ((User.phone_number == clean_id) | (Guardian.phone_number == clean_id))
                )
            )
            user = db.execute(parent_stmt).scalars().first()

        # C. If not found and portal is 'student', check student registration/admission number
        if not user and portal_type in ("student", "parent_student"):
            possible_adm = [clean_id]
            if clean_id.isdigit():
                num = int(clean_id)
                possible_adm.extend([f"ADM-2026-{num:04d}", f"ADM-{num:04d}", f"REG-{num:04d}", str(num), f"{num:02d}"])

            st_user_stmt = (
                select(User)
                .options(selectinload(User.user_roles))
                .join(Student, Student.user_id == User.id)
                .where(
                    (Student.admission_number.in_(possible_adm))
                    | (Student.roll_number == clean_id)
                    | (User.username == f"student{clean_id}")
                )
            )
            user = db.execute(st_user_stmt).scalars().first()

        # D. If not found and portal is 'staff', check staff phone number or employee ID
        if not user and portal_type == "staff":
            staff_user_stmt = (
                select(User)
                .options(selectinload(User.user_roles))
                .outerjoin(Staff, Staff.user_id == User.id)
                .where(
                    (User.portal_type == "staff")
                    & (
                        (User.phone_number == clean_id)
                        | (Staff.phone_number == clean_id)
                        | (Staff.employee_id == clean_id)
                    )
                )
            )
            user = db.execute(staff_user_stmt).scalars().first()

        # E. General phone fallback if still not matched
        if not user:
            phone_stmt = (
                select(User)
                .options(selectinload(User.user_roles))
                .where(User.phone_number == clean_id)
            )
            user = db.execute(phone_stmt).scalars().first()

        # Generic authentication failure message to prevent account enumeration
        generic_auth_error = AppError(
            message="Invalid credentials. Please check your username and password.",
            status_code=status.HTTP_401_UNAUTHORIZED,
            error_code="INVALID_CREDENTIALS",
        )

        if not user:
            # Perform dummy verification to mitigate timing attacks
            verify_password("dummy", "$2b$12$dummyhashplaceholderforconstanttimexxxxxxxxxx")
            raise generic_auth_error

        # 2. Check if account is locked
        if user.is_locked:
            raise AppError(
                message="Account is locked due to too many failed login attempts. Contact an administrator.",
                status_code=status.HTTP_403_FORBIDDEN,
                error_code="ACCOUNT_LOCKED",
            )

        if not user.is_active:
            raise AppError(
                message="Account is deactivated. Contact an administrator.",
                status_code=status.HTTP_403_FORBIDDEN,
                error_code="ACCOUNT_DEACTIVATED",
            )

        # 3. Verify password
        if not verify_password(password, user.hashed_password):
            user.failed_login_attempts += 1
            if user.failed_login_attempts >= 5:
                user.is_locked = True
                record_audit(
                    db=db,
                    action="ACCOUNT_LOCKED_FAILED_ATTEMPTS",
                    entity_name="users",
                    record_id=str(user.id),
                    actor_user_id=user.id,
                    new_values={"is_locked": True, "failed_login_attempts": user.failed_login_attempts},
                    request=request,
                )
            db.commit()
            raise generic_auth_error

        # 4. Check portal compatibility
        user_role_names = [ur.role.name for ur in user.user_roles if ur.role and ur.role.is_active]
        is_staff_role = any(r in STAFF_ROLES for r in user_role_names)
        is_parent_student_role = any(r in PARENT_STUDENT_ROLES for r in user_role_names)

        if portal_type == "staff" and not is_staff_role:
            raise AppError(
                message="Your account roles are not permitted to access the Staff Portal.",
                status_code=status.HTTP_403_FORBIDDEN,
                error_code="PORTAL_INCOMPATIBLE",
            )
        if portal_type in ("parent_student", "parent", "student"):
            if portal_type == "parent" and "parent" not in user_role_names:
                raise AppError(
                    message="Your account is not registered as a Parent account.",
                    status_code=status.HTTP_403_FORBIDDEN,
                    error_code="PORTAL_INCOMPATIBLE",
                )
            elif portal_type == "student" and "student" not in user_role_names:
                raise AppError(
                    message="Your account is not registered as a Student account.",
                    status_code=status.HTTP_403_FORBIDDEN,
                    error_code="PORTAL_INCOMPATIBLE",
                )
            elif portal_type == "parent_student" and not is_parent_student_role:
                raise AppError(
                    message="Your account roles are not permitted to access the Parent/Student Portal.",
                    status_code=status.HTTP_403_FORBIDDEN,
                    error_code="PORTAL_INCOMPATIBLE",
                )

        # 5. Reset lockout counter & record login timestamp
        user.failed_login_attempts = 0
        user.last_login_at = datetime.now(timezone.utc)

        # 6. Issue tokens
        access_token, _, _ = create_access_token(
            user_id=str(user.id),
            roles=user_role_names,
            portal_type=portal_type,
        )
        refresh_token, r_jti, r_exp = create_refresh_token(
            user_id=str(user.id),
            portal_type=portal_type,
        )

        # 7. Persist Refresh Token JTI
        db_token = RefreshToken(
            id=uuid.uuid4(),
            user_id=user.id,
            token_jti=r_jti,
            expires_at=r_exp,
            is_revoked=False,
        )
        db.add(db_token)

        # Audit successful login
        record_audit(
            db=db,
            action="LOGIN_SUCCESS",
            entity_name="users",
            record_id=str(user.id),
            actor_user_id=user.id,
            new_values={"portal_type": portal_type, "roles": user_role_names},
            request=request,
        )

        db.commit()

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user_id=user.id,
            username=user.username,
            full_name=user.full_name,
            portal_type=portal_type,
            roles=user_role_names,
            must_change_password=user.must_change_password,
        )

    @staticmethod
    def rotate_tokens(db: Session, raw_refresh_token: str, request: Optional[Request] = None) -> TokenResponse:
        """
        Validates refresh JWT, verifies that its JTI is active and unrevoked,
        revokes the old token, and issues a rotated new token pair.
        """
        payload = decode_token(raw_refresh_token, expected_type="refresh")
        user_id_str = payload.get("sub")
        old_jti = payload.get("jti")

        try:
            user_uuid = uuid.UUID(user_id_str)
        except (ValueError, TypeError):
            raise AppError(
                message="Invalid token subject.",
                status_code=status.HTTP_401_UNAUTHORIZED,
                error_code="INVALID_TOKEN",
            )

        # Find existing active refresh token
        stmt = (
            select(RefreshToken)
            .where(RefreshToken.token_jti == old_jti, RefreshToken.user_id == user_uuid)
        )
        existing_token = db.execute(stmt).scalar_one_or_none()

        if not existing_token or existing_token.is_revoked:
            raise AppError(
                message="Refresh token has been revoked or is invalid. Please log in again.",
                status_code=status.HTTP_401_UNAUTHORIZED,
                error_code="REVOKED_REFRESH_TOKEN",
            )

        # Revoke the old token (Token Rotation)
        existing_token.is_revoked = True
        existing_token.revoked_at = datetime.now(timezone.utc)

        # Load user
        user = db.execute(
            select(User).options(selectinload(User.user_roles)).where(User.id == user_uuid)
        ).scalar_one_or_none()

        if not user or not user.is_active or user.is_locked:
            db.commit()
            raise AppError(
                message="User account is deactivated or locked.",
                status_code=status.HTTP_403_FORBIDDEN,
                error_code="ACCOUNT_INACTIVE",
            )

        user_role_names = [ur.role.name for ur in user.user_roles if ur.role and ur.role.is_active]
        portal_type = payload.get("portal_type", user.portal_type)

        # Issue new pair
        new_access_token, _, _ = create_access_token(
            user_id=str(user.id),
            roles=user_role_names,
            portal_type=portal_type,
        )
        new_refresh_token, new_jti, new_exp = create_refresh_token(
            user_id=str(user.id),
            portal_type=portal_type,
        )

        db_new_token = RefreshToken(
            id=uuid.uuid4(),
            user_id=user.id,
            token_jti=new_jti,
            expires_at=new_exp,
            is_revoked=False,
        )
        db.add(db_new_token)
        db.commit()

        return TokenResponse(
            access_token=new_access_token,
            refresh_token=new_refresh_token,
            token_type="bearer",
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user_id=user.id,
            username=user.username,
            full_name=user.full_name,
            portal_type=portal_type,
            roles=user_role_names,
            must_change_password=user.must_change_password,
        )

    @staticmethod
    def logout(db: Session, raw_refresh_token: str, user: User, request: Optional[Request] = None) -> None:
        """Revokes the given refresh token on logout."""
        try:
            payload = decode_token(raw_refresh_token, expected_type="refresh")
            jti = payload.get("jti")
            stmt = select(RefreshToken).where(RefreshToken.token_jti == jti)
            token_record = db.execute(stmt).scalar_one_or_none()
            if token_record:
                token_record.is_revoked = True
                token_record.revoked_at = datetime.now(timezone.utc)
                record_audit(
                    db=db,
                    action="LOGOUT",
                    entity_name="users",
                    record_id=str(user.id),
                    actor_user_id=user.id,
                    request=request,
                )
                db.commit()
        except Exception:
            # Safe logout fallback
            pass

    @staticmethod
    def change_password(
        db: Session,
        user: User,
        current_password: str,
        new_password: str,
        request: Optional[Request] = None,
    ) -> None:
        """Allows authenticated user to change their own password."""
        if not verify_password(current_password, user.hashed_password):
            raise AppError(
                message="Current password does not match.",
                status_code=status.HTTP_400_BAD_REQUEST,
                error_code="INVALID_CURRENT_PASSWORD",
            )
        user.hashed_password = hash_password(new_password)
        user.must_change_password = False

        record_audit(
            db=db,
            action="PASSWORD_CHANGED",
            entity_name="users",
            record_id=str(user.id),
            actor_user_id=user.id,
            request=request,
        )
        db.commit()
