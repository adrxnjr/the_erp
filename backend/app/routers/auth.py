from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.orm import Session

from app.core.permissions import get_current_user, require_super_admin
from app.core.rate_limit import limiter
from app.db.dependencies import get_db
from app.models.user import User
from app.schemas.auth import (
    AdminResetPasswordRequest,
    ChangePasswordRequest,
    LoginRequest,
    RefreshTokenRequest,
    TokenResponse,
    UserResponse,
)
from app.services.auth_service import AuthService
from app.services.user_service import UserService

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/login",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="User Login (Staff, Parent, or Student)",
    description="Authenticates credentials against portal type. Enforces 5-attempt account lockout.",
)
@limiter.limit("120/minute")
def login(
    request: Request,
    payload: LoginRequest,
    db: Session = Depends(get_db),
):
    return AuthService.authenticate_and_login(
        db=db,
        username=payload.username,
        password=payload.password,
        portal_type=payload.portal_type,
        request=request,
    )


@router.post(
    "/refresh",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="Token Rotation",
    description="Rotates valid refresh token and issues a new access/refresh token pair.",
)
def refresh_token(
    request: Request,
    payload: RefreshTokenRequest,
    db: Session = Depends(get_db),
):
    return AuthService.rotate_tokens(db=db, raw_refresh_token=payload.refresh_token, request=request)


@router.post(
    "/logout",
    status_code=status.HTTP_200_OK,
    summary="User Logout",
    description="Revokes the active refresh token.",
)
def logout(
    request: Request,
    payload: RefreshTokenRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    AuthService.logout(db=db, raw_refresh_token=payload.refresh_token, user=current_user, request=request)
    return {"message": "Successfully logged out."}


@router.get(
    "/me",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Current User Profile",
    description="Returns authenticated user details and assigned roles.",
)
def get_me(current_user: User = Depends(get_current_user)):
    roles = [ur.role.name for ur in current_user.user_roles if ur.role and ur.role.is_active]
    return UserResponse(
        id=current_user.id,
        username=current_user.username,
        email=current_user.email,
        full_name=current_user.full_name,
        phone_number=current_user.phone_number,
        portal_type=current_user.portal_type,
        is_active=current_user.is_active,
        is_locked=current_user.is_locked,
        must_change_password=current_user.must_change_password,
        roles=roles,
        last_login_at=current_user.last_login_at,
        created_at=current_user.created_at,
    )


@router.post(
    "/change-password",
    status_code=status.HTTP_200_OK,
    summary="Change Own Password",
)
def change_password(
    request: Request,
    payload: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    AuthService.change_password(
        db=db,
        user=current_user,
        current_password=payload.current_password,
        new_password=payload.new_password,
        request=request,
    )
    return {"message": "Password changed successfully."}


@router.post(
    "/admin-reset-password/{user_id}",
    status_code=status.HTTP_200_OK,
    summary="Super Admin Password Reset",
)
def admin_reset_password(
    user_id: str,
    request: Request,
    payload: AdminResetPasswordRequest,
    current_user: User = Depends(require_super_admin),
    db: Session = Depends(get_db),
):
    import uuid
    user_uuid = uuid.UUID(user_id)
    generated_pwd = UserService.admin_reset_password(
        db=db,
        user_id=user_uuid,
        new_password=payload.new_password,
        must_change_password=payload.must_change_password,
        actor=current_user,
        request=request,
    )
    return {
        "message": "Password reset successfully.",
        "temporary_password": generated_pwd if not payload.new_password else None,
    }
