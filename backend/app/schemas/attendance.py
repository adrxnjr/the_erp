import uuid
from datetime import date, datetime, time
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


class StudentAttendanceItem(BaseModel):
    student_id: uuid.UUID
    status: str = Field(..., description="present, absent, late, half_day, on_leave")
    remarks: Optional[str] = None


class BulkStudentAttendanceCreate(BaseModel):
    class_id: uuid.UUID
    section_id: uuid.UUID
    academic_year_id: uuid.UUID
    attendance_date: date
    session: str = Field("full_day", description="full_day, morning, afternoon")
    items: List[StudentAttendanceItem] = Field(..., min_length=1)


class StudentAttendanceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    student_id: uuid.UUID
    class_id: uuid.UUID
    section_id: uuid.UUID
    academic_year_id: uuid.UUID
    attendance_date: date
    session: str
    status: str
    remarks: Optional[str] = None
    is_locked: bool
    created_at: datetime


class AttendanceCorrectionCreate(BaseModel):
    attendance_id: uuid.UUID
    requested_status: str = Field(..., description="present, absent, late, half_day, on_leave")
    reason: str = Field(..., min_length=5)


class AttendanceCorrectionReview(BaseModel):
    approved: bool
    review_remarks: Optional[str] = None


class LeaveRequestCreate(BaseModel):
    applicant_type: str = Field(..., description="staff, student")
    student_id: Optional[uuid.UUID] = None
    start_date: date
    end_date: date
    leave_type: str = Field(..., description="sick, casual, emergency")
    reason: str = Field(..., min_length=5)


class LeaveRequestReview(BaseModel):
    approved: bool
    review_remarks: Optional[str] = None


class AttendanceStatsResponse(BaseModel):
    total_days: int
    present_days: int
    absent_days: int
    late_days: int
    attendance_percentage: float
