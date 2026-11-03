import uuid
from datetime import date, datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field


# Enquiry Schemas
class EnquiryCreate(BaseModel):
    student_name: str = Field(..., min_length=2, max_length=150)
    date_of_birth: Optional[date] = None
    gender: Optional[str] = Field(None, max_length=20)
    grade_applying_for: str = Field(..., min_length=1, max_length=50)
    parent_name: str = Field(..., min_length=2, max_length=150)
    parent_phone: str = Field(..., min_length=5, max_length=30)
    parent_email: Optional[EmailStr] = None
    address: Optional[str] = None
    notes: Optional[str] = None
    hp_website: Optional[str] = None


class EnquiryUpdate(BaseModel):
    status: Optional[str] = Field(None, description="submitted, under_review, converted, rejected")
    assigned_staff_id: Optional[uuid.UUID] = None
    notes: Optional[str] = None


class EnquiryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    enquiry_number: str
    student_name: str
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    grade_applying_for: str
    parent_name: str
    parent_phone: str
    parent_email: Optional[str] = None
    address: Optional[str] = None
    status: str
    notes: Optional[str] = None
    assigned_staff_id: Optional[uuid.UUID] = None
    created_at: datetime


class EnquiryConvertRequest(BaseModel):
    admission_number: str = Field(..., min_length=2, max_length=50)
    class_id: uuid.UUID
    section_id: Optional[uuid.UUID] = None
    academic_year_id: uuid.UUID
    admission_date: date
    gender: str = Field(..., min_length=1, max_length=20)
    date_of_birth: date


# Guardian Schemas
class GuardianCreate(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=150)
    relationship_type: str = Field(..., description="father, mother, guardian")
    phone_number: str = Field(..., min_length=5, max_length=30)
    email: Optional[EmailStr] = None
    occupation: Optional[str] = None
    address: Optional[str] = None
    is_emergency_contact: bool = False
    create_user_account: bool = False


class GuardianResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    full_name: str
    relationship_type: str
    phone_number: str
    email: Optional[str] = None
    occupation: Optional[str] = None
    address: Optional[str] = None
    is_emergency_contact: bool
    user_id: Optional[uuid.UUID] = None
    created_at: datetime


# Student Schemas
class StudentCreate(BaseModel):
    admission_number: str = Field(..., min_length=2, max_length=50)
    roll_number: Optional[str] = Field(None, max_length=30)
    full_name: str = Field(..., min_length=2, max_length=150)
    date_of_birth: date
    gender: str = Field(..., max_length=20)
    class_id: uuid.UUID
    section_id: Optional[uuid.UUID] = None
    academic_year_id: uuid.UUID
    admission_date: date
    phone_number: Optional[str] = None
    email: Optional[EmailStr] = None
    address: Optional[str] = None
    create_user_account: bool = False


class StudentUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=2, max_length=150)
    roll_number: Optional[str] = None
    class_id: Optional[uuid.UUID] = None
    section_id: Optional[uuid.UUID] = None
    academic_year_id: Optional[uuid.UUID] = None
    phone_number: Optional[str] = None
    email: Optional[EmailStr] = None
    address: Optional[str] = None
    photo_path: Optional[str] = None


class StudentStatusChangeRequest(BaseModel):
    new_status: str = Field(..., description="enquiry, applied, admitted, active, transferred, graduated, withdrawn")
    reason: Optional[str] = None


class StudentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    admission_number: str
    roll_number: Optional[str] = None
    full_name: str
    date_of_birth: date
    gender: str
    class_id: uuid.UUID
    section_id: Optional[uuid.UUID] = None
    academic_year_id: uuid.UUID
    admission_date: date
    status: str
    phone_number: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    user_id: Optional[uuid.UUID] = None
    created_at: datetime


class StudentGuardianLinkRequest(BaseModel):
    guardian_id: uuid.UUID
    is_primary: bool = False
    can_pickup: bool = True
