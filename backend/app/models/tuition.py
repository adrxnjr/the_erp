import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional
from sqlalchemy import (
    Boolean,
    DateTime,
    Float,
    ForeignKey,
    Index,
    Integer,
    Numeric,
    String,
    Text,
    JSON,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class TuitionCenter(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Certified local tutoring academy or coaching institute.
    """
    __tablename__ = "tuition_centers"

    name: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    address: Mapped[str] = mapped_column(String(255), nullable=False)
    area: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    city: Mapped[str] = mapped_column(String(100), default="Bangalore", nullable=False)
    pincode: Mapped[str] = mapped_column(String(20), nullable=False)
    latitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    longitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    contact_phone: Mapped[str] = mapped_column(String(50), nullable=False)
    contact_email: Mapped[str] = mapped_column(String(100), nullable=False)
    website: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_approved: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Relationships
    teachers: Mapped[List["TuitionTeacher"]] = relationship(
        "TuitionTeacher", back_populates="tuition_center", cascade="all, delete-orphan"
    )
    batches: Mapped[List["TuitionBatch"]] = relationship(
        "TuitionBatch", back_populates="tuition_center", cascade="all, delete-orphan"
    )
    enquiries: Mapped[List["TuitionEnquiry"]] = relationship(
        "TuitionEnquiry", back_populates="tuition_center", cascade="all, delete-orphan"
    )


class TuitionTeacher(Base, UUIDPrimaryKeyMixin):
    """
    Subject matter instructor affiliated with a tuition center.
    """
    __tablename__ = "tuition_teachers"

    tuition_center_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("tuition_centers.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    teacher_name: Mapped[str] = mapped_column(String(150), nullable=False)
    qualification: Mapped[str] = mapped_column(String(150), nullable=False)
    experience_years: Mapped[int] = mapped_column(Integer, default=5, nullable=False)
    subjects_taught: Mapped[Any] = mapped_column(JSON, nullable=False, default=list)  # e.g. ["Mathematics", "Physics"]
    rating: Mapped[float] = mapped_column(Float, default=4.8, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Relationships
    tuition_center: Mapped["TuitionCenter"] = relationship("TuitionCenter", back_populates="teachers")
    batches: Mapped[List["TuitionBatch"]] = relationship("TuitionBatch", back_populates="teacher")


class TuitionBatch(Base, UUIDPrimaryKeyMixin):
    """
    Class batch schedule and monthly fee for a given subject.
    """
    __tablename__ = "tuition_batches"

    tuition_center_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("tuition_centers.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    teacher_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("tuition_teachers.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    subject_name: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    days_of_week: Mapped[Any] = mapped_column(JSON, nullable=False, default=list)  # e.g. ["Mon", "Wed", "Fri"]
    start_time: Mapped[str] = mapped_column(String(10), nullable=False)  # e.g. "17:00"
    end_time: Mapped[str] = mapped_column(String(10), nullable=False)    # e.g. "18:30"
    fee_per_month: Mapped[float] = mapped_column(Float, nullable=False)  # In Indian Rupees (₹)
    batch_size_max: Mapped[int] = mapped_column(Integer, default=15, nullable=False)
    current_enrolled: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Relationships
    tuition_center: Mapped["TuitionCenter"] = relationship("TuitionCenter", back_populates="batches")
    teacher: Mapped[Optional["TuitionTeacher"]] = relationship("TuitionTeacher", back_populates="batches")
    enquiries: Mapped[List["TuitionEnquiry"]] = relationship("TuitionEnquiry", back_populates="batch")


class TuitionEnquiry(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Student or parent consultation enquiry for a tuition batch.
    """
    __tablename__ = "tuition_enquiries"

    student_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("students.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    tuition_center_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("tuition_centers.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    batch_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("tuition_batches.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    status: Mapped[str] = mapped_column(String(30), default="pending", nullable=False)  # pending, contacted, enrolled, rejected
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relationships
    student: Mapped["app.models.student.Student"] = relationship("Student")
    tuition_center: Mapped["TuitionCenter"] = relationship("TuitionCenter", back_populates="enquiries")
    batch: Mapped[Optional["TuitionBatch"]] = relationship("TuitionBatch", back_populates="enquiries")

