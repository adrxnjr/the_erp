import uuid
from datetime import date, datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field


class StaffCreate(BaseModel):
    employee_id: str = Field(..., min_length=2, max_length=50)
    full_name: str = Field(..., min_length=2, max_length=150)
    email: Optional[EmailStr] = None
    phone_number: str = Field(..., min_length=5, max_length=30)
    designation: str = Field(..., min_length=2, max_length=100)
    department: str = Field(..., min_length=2, max_length=100)
    staff_type: str = Field("teaching", description="teaching, non_teaching, driver")
    qualification: Optional[str] = None
    joining_date: date
    create_user_account: bool = False


class StaffUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=2, max_length=150)
    email: Optional[EmailStr] = None
    phone_number: Optional[str] = None
    designation: Optional[str] = None
    department: Optional[str] = None
    staff_type: Optional[str] = None
    qualification: Optional[str] = None
    is_active: Optional[bool] = None


class StaffResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    employee_id: str
    full_name: str
    email: Optional[str] = None
    phone_number: str
    designation: str
    department: str
    staff_type: str
    qualification: Optional[str] = None
    joining_date: date
    is_active: bool
    user_id: Optional[uuid.UUID] = None
    created_at: datetime


class StaffAssignmentCreate(BaseModel):
    staff_id: uuid.UUID
    class_id: uuid.UUID
    section_id: uuid.UUID
    subject_id: uuid.UUID
    academic_year_id: uuid.UUID
    is_primary_teacher: bool = False


class StaffAssignmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    staff_id: uuid.UUID
    class_id: uuid.UUID
    section_id: uuid.UUID
    subject_id: uuid.UUID
    academic_year_id: uuid.UUID
    is_primary_teacher: bool
    is_active: bool
    created_at: datetime
