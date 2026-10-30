import uuid
from datetime import date, datetime, time
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


class ExamTypeBase(BaseModel):
    name: str = Field(..., max_length=100)
    description: Optional[str] = None
    weightage: float = 100.0


class ExamTypeCreate(ExamTypeBase):
    pass


class ExamTypeResponse(ExamTypeBase):
    id: uuid.UUID
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class ExamBase(BaseModel):
    academic_year_id: uuid.UUID
    exam_type_id: uuid.UUID
    name: str = Field(..., max_length=150)
    start_date: date
    end_date: date


class ExamCreate(ExamBase):
    pass


class ExamResponse(ExamBase):
    id: uuid.UUID
    is_published: bool
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class ExamSubjectCreate(BaseModel):
    class_id: uuid.UUID
    subject_id: uuid.UUID
    max_marks: float = 100.0
    pass_marks: float = 35.0
    exam_date: Optional[date] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None


class ExamSubjectResponse(BaseModel):
    id: uuid.UUID
    exam_id: uuid.UUID
    class_id: uuid.UUID
    subject_id: uuid.UUID
    max_marks: float
    pass_marks: float
    exam_date: Optional[date] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    model_config = ConfigDict(from_attributes=True)


class MarkEntryItem(BaseModel):
    student_id: uuid.UUID
    marks_obtained: float = Field(..., ge=0.0)
    is_absent: bool = False
    remarks: Optional[str] = None


class BulkMarkEntryRequest(BaseModel):
    exam_subject_id: uuid.UUID
    status: str = Field(default="draft", description="draft, submitted")
    items: List[MarkEntryItem]


class MarkResponse(BaseModel):
    id: uuid.UUID
    exam_subject_id: uuid.UUID
    student_id: uuid.UUID
    marks_obtained: float
    is_absent: bool
    status: str
    remarks: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)


class GradeScaleCreate(BaseModel):
    name: str
    min_percentage: float
    max_percentage: float
    grade_point: float
    description: Optional[str] = None


class GradeScaleResponse(GradeScaleCreate):
    id: uuid.UUID
    model_config = ConfigDict(from_attributes=True)


class ExamResultResponse(BaseModel):
    id: uuid.UUID
    exam_id: uuid.UUID
    student_id: uuid.UUID
    total_marks_obtained: float
    total_max_marks: float
    percentage: float
    grade: Optional[str] = None
    rank: Optional[int] = None
    status: str
    model_config = ConfigDict(from_attributes=True)


class MarkCorrectionCreate(BaseModel):
    mark_id: uuid.UUID
    requested_marks: float
    reason: str


class MarkCorrectionReview(BaseModel):
    approved: bool
    remarks: Optional[str] = None
