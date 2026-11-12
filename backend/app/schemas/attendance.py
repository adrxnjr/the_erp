import uuid
from datetime import date, datetime, time
from typing import Any, Dict, List, Optional
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


# --- NEW ATTENDANCE MODULE SCHEMAS (CLASS TEACHER & STUDENT PORTAL) ---

class StudentAttendanceRecordItem(BaseModel):
    student_id: str
    roll_no: Optional[str] = ""
    name: str
    status: str = Field("Present", description="Present, Absent, OD")


class TeacherAttendanceQueryResponse(BaseModel):
    class_name: str
    section: str
    subject: str
    date: date
    is_class_teacher: bool
    can_mark: bool
    is_existing: bool
    teacher_name: Optional[str] = None
    students: List[StudentAttendanceRecordItem]


class SaveAttendancePayload(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    class_name: str = Field(..., alias="class")
    section: str
    subject: str
    date: date
    students: List[StudentAttendanceRecordItem]


class TeacherClassTeacherAssignment(BaseModel):
    class_name: str
    section: str


class TeacherAttendanceOptionsResponse(BaseModel):
    classes: List[str]
    sections: Dict[str, List[str]]
    subjects: List[str]
    teacher_name: str
    is_class_teacher_for: List[TeacherClassTeacherAssignment]


class StudentAttendanceHistoryItem(BaseModel):
    id: str
    date: date
    subject: str
    class_name: str
    section: str
    status: str
    marked_by: Optional[str] = None


class StudentMyAttendanceResponse(BaseModel):
    student_name: str
    admission_number: str
    roll_number: str
    class_name: str
    section: str
    today_status: str  # Present, Absent, OD, or Not Marked
    total_present: int
    total_absent: int
    total_od: int
    total_days: int
    overall_percentage: float
    records: List[StudentAttendanceHistoryItem]
