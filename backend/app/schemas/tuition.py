import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


# ---------------- TEACHER SCHEMAS ----------------

class TuitionTeacherBase(BaseModel):
    teacher_name: str
    qualification: str
    experience_years: int = 5
    subjects_taught: List[str] = Field(default_factory=list)
    rating: float = 4.8
    is_active: bool = True


class TuitionTeacherCreate(TuitionTeacherBase):
    pass


class TuitionTeacherResponse(TuitionTeacherBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    tuition_center_id: uuid.UUID


# ---------------- BATCH SCHEMAS ----------------

class TuitionBatchBase(BaseModel):
    subject_name: str
    days_of_week: List[str] = Field(default_factory=lambda: ["Mon", "Wed", "Fri"])
    start_time: str  # "17:00"
    end_time: str    # "18:30"
    fee_per_month: float  # In INR ₹
    batch_size_max: int = 15
    current_enrolled: int = 0
    is_active: bool = True


class TuitionBatchCreate(TuitionBatchBase):
    teacher_id: Optional[uuid.UUID] = None


class TuitionBatchResponse(TuitionBatchBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    tuition_center_id: uuid.UUID
    teacher_id: Optional[uuid.UUID] = None
    teacher: Optional[TuitionTeacherResponse] = None


# ---------------- CENTER SCHEMAS ----------------

class TuitionCenterBase(BaseModel):
    name: str
    description: Optional[str] = None
    address: str
    area: str
    city: str = "Bangalore"
    pincode: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    contact_phone: str
    contact_email: str
    website: Optional[str] = None
    is_active: bool = True
    is_approved: bool = False


class TuitionCenterCreate(BaseModel):
    name: str
    description: Optional[str] = None
    address: str
    area: str
    city: str = "Bangalore"
    pincode: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    contact_phone: str
    contact_email: str
    website: Optional[str] = None
    is_approved: bool = True


class TuitionCenterUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    address: Optional[str] = None
    area: Optional[str] = None
    city: Optional[str] = None
    pincode: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None
    website: Optional[str] = None
    is_active: Optional[bool] = None
    is_approved: Optional[bool] = None


class TuitionCenterResponse(TuitionCenterBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    teachers: List[TuitionTeacherResponse] = Field(default_factory=list)
    batches: List[TuitionBatchResponse] = Field(default_factory=list)


# ---------------- ENQUIRY SCHEMAS ----------------

class TuitionEnquiryCreate(BaseModel):
    student_id: Optional[uuid.UUID] = None
    tuition_center_id: uuid.UUID
    batch_id: Optional[uuid.UUID] = None
    notes: Optional[str] = None


class TuitionEnquiryUpdateStatus(BaseModel):
    status: str  # pending, contacted, enrolled, rejected
    notes: Optional[str] = None


class TuitionEnquiryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    student_id: uuid.UUID
    tuition_center_id: uuid.UUID
    batch_id: Optional[uuid.UUID] = None
    status: str
    notes: Optional[str] = None
    created_at: datetime
    student_name: Optional[str] = None
    tuition_center_name: Optional[str] = None
    batch_subject: Optional[str] = None


# ---------------- RECOMMENDATION SCHEMAS ----------------

class WeakSubjectItem(BaseModel):
    subject_name: str
    percentage: float
    status: str  # "needs_tuition" (<60%), "borderline" (60-75%), "strong" (>75%)
    tag: str     # "Needs Tuition" | "Optional Support" | "Strong Mastery"
    grade: str   # "C", "B", "A+", etc.


class RecommendationCard(BaseModel):
    batch_id: uuid.UUID
    center_id: uuid.UUID
    center_name: str
    center_address: str
    center_area: str
    center_city: str
    center_contact_phone: str
    center_contact_email: str
    is_approved: bool
    subject_name: str
    days_of_week: List[str]
    start_time: str
    end_time: str
    fee_per_month: float
    batch_size_max: int
    current_enrolled: int
    seats_left: int
    teacher_name: str
    teacher_qualification: str
    teacher_experience_years: int
    teacher_rating: float


class TuitionRecommendationResponse(BaseModel):
    student_id: uuid.UUID
    student_name: str
    weak_subjects: List[WeakSubjectItem]
    total_found: int
    recommendations: List[RecommendationCard]

