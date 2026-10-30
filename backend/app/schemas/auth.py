import uuid
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field, EmailStr


class LoginRequest(BaseModel):
    portal_type: str = Field(..., description="'staff' or 'parent_student'")
    username: str = Field(..., min_length=1, max_length=100)
    password: str = Field(..., min_length=1, max_length=128)


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user_id: uuid.UUID
    username: str
    full_name: str
    portal_type: str
    roles: List[str]
    must_change_password: bool = False


class RefreshTokenRequest(BaseModel):
    refresh_token: str = Field(..., min_length=10)


class ChangePasswordRequest(BaseModel):
    current_password: str = Field(..., min_length=4)
    new_password: str = Field(..., min_length=8, max_length=128)


class AdminResetPasswordRequest(BaseModel):
    new_password: Optional[str] = Field(None, min_length=8, max_length=128)
    must_change_password: bool = True


class RoleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    description: Optional[str] = None
    is_active: bool


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    username: str
    email: Optional[str] = None
    full_name: str
    phone_number: Optional[str] = None
    portal_type: str
    is_active: bool
    is_locked: bool
    must_change_password: bool
    roles: List[str] = []
    last_login_at: Optional[datetime] = None
    created_at: datetime
