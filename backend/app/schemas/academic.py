import uuid
from datetime import date, datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


# Academic Year Schemas
class AcademicYearCreate(BaseModel):
    name: str = Field(..., min_length=3, max_length=50, description="e.g. 2026-2027")
    start_date: date
    end_date: date
    is_active: bool = False


class AcademicYearUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=3, max_length=50)
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_active: Optional[bool] = None
    is_closed: Optional[bool] = None


class AcademicYearResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    start_date: date
    end_date: date
    is_active: bool
    is_closed: bool
    created_at: datetime
    updated_at: datetime


# ClassRoom Schemas
class ClassCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    level: int = Field(1, ge=1, le=15)
    description: Optional[str] = None


class ClassUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    level: Optional[int] = Field(None, ge=1, le=15)
    description: Optional[str] = None
    is_active: Optional[bool] = None


class ClassResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    level: int
    description: Optional[str] = None
    is_active: bool
    created_at: datetime


# Section Schemas
class SectionCreate(BaseModel):
    class_id: uuid.UUID
    name: str = Field(..., min_length=1, max_length=50)
    room_number: Optional[str] = Field(None, max_length=50)
    capacity: int = Field(40, ge=1, le=100)


class SectionUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=50)
    room_number: Optional[str] = None
    capacity: Optional[int] = Field(None, ge=1, le=100)
    is_active: Optional[bool] = None


class SectionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    class_id: uuid.UUID
    name: str
    room_number: Optional[str] = None
    capacity: int
    is_active: bool
    created_at: datetime


# Subject Schemas
class SubjectCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    code: str = Field(..., min_length=2, max_length=30)
    description: Optional[str] = None


class SubjectUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    code: Optional[str] = Field(None, min_length=2, max_length=30)
    description: Optional[str] = None
    is_active: Optional[bool] = None


class SubjectResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    code: str
    description: Optional[str] = None
    is_active: bool
    created_at: datetime


# ClassSubject Schemas
class ClassSubjectCreate(BaseModel):
    class_id: uuid.UUID
    subject_id: uuid.UUID
    is_elective: bool = False


class ClassSubjectResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    class_id: uuid.UUID
    subject_id: uuid.UUID
    is_elective: bool
    is_active: bool
    created_at: datetime


# Holiday Schemas
class HolidayCreate(BaseModel):
    academic_year_id: Optional[uuid.UUID] = None
    name: str = Field(..., min_length=2, max_length=150)
    start_date: date
    end_date: date
    description: Optional[str] = None


class HolidayUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=150)
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    description: Optional[str] = None


class HolidayResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    academic_year_id: Optional[uuid.UUID] = None
    name: str
    start_date: date
    end_date: date
    description: Optional[str] = None
    created_at: datetime
