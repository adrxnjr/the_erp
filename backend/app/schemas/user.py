import uuid
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=100)
    email: Optional[EmailStr] = None
    password: str = Field(..., min_length=8, max_length=128)
    full_name: str = Field(..., min_length=2, max_length=150)
    phone_number: Optional[str] = Field(None, max_length=30)
    portal_type: str = Field(..., description="'staff' or 'parent_student'")
    role_ids: List[uuid.UUID] = Field(..., min_length=1)


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = Field(None, min_length=2, max_length=150)
    phone_number: Optional[str] = None
    is_active: Optional[bool] = None
    is_locked: Optional[bool] = None
    role_ids: Optional[List[uuid.UUID]] = None


class RoleCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=50)
    description: Optional[str] = Field(None, max_length=255)
