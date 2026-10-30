import uuid
from datetime import date, datetime, time
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class PeriodCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=50)
    period_number: int = Field(..., ge=1, le=20)
    start_time: time
    end_time: time
    is_break: bool = False


class PeriodResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    period_number: int
    start_time: time
    end_time: time
    is_break: bool
    created_at: datetime


class TimetableEntryCreate(BaseModel):
    academic_year_id: uuid.UUID
    class_id: uuid.UUID
    section_id: uuid.UUID
    subject_id: uuid.UUID
    teacher_staff_id: uuid.UUID
    period_id: uuid.UUID
    day_of_week: int = Field(..., ge=0, le=6, description="0=Monday, 6=Sunday")
    room_number: Optional[str] = Field(None, max_length=50)


class TimetableEntryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    academic_year_id: uuid.UUID
    class_id: uuid.UUID
    section_id: uuid.UUID
    subject_id: uuid.UUID
    teacher_staff_id: uuid.UUID
    period_id: uuid.UUID
    day_of_week: int
    room_number: Optional[str] = None
    created_at: datetime


class SubstitutionCreate(BaseModel):
    timetable_entry_id: uuid.UUID
    substitute_staff_id: uuid.UUID
    substitution_date: date
    reason: Optional[str] = None


class SubstitutionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    timetable_entry_id: uuid.UUID
    original_staff_id: uuid.UUID
    substitute_staff_id: uuid.UUID
    substitution_date: date
    reason: Optional[str] = None
    status: str
    created_at: datetime
