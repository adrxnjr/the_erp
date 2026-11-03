import uuid
from datetime import date, datetime, time
from typing import List, Optional
from sqlalchemy import Boolean, Date, DateTime, Float, ForeignKey, Index, Integer, Numeric, String, Text, Time, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class ExamType(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Categorization of exams (e.g. Unit Test, Quarterly, Half-Yearly, Annual).
    """
    __tablename__ = "exam_types"

    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    weightage: Mapped[float] = mapped_column(Float, default=100.0, nullable=False)


class Exam(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    An examination session within an academic year.
    """
    __tablename__ = "exams"
    __table_args__ = (
        Index("ix_exams_academic_year", "academic_year_id"),
    )

    academic_year_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("academic_years.id", ondelete="CASCADE"), nullable=False
    )
    exam_type_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("exam_types.id", ondelete="RESTRICT"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date] = mapped_column(Date, nullable=False)
    is_published: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    academic_year = relationship("AcademicYear", backref="exams")
    exam_type = relationship("ExamType", backref="exams")
    exam_subjects = relationship("ExamSubject", back_populates="exam", cascade="all, delete-orphan")


class ExamSubject(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Subject-wise paper configuration for an exam in a specific class.
    """
    __tablename__ = "exam_subjects"
    __table_args__ = (
        UniqueConstraint("exam_id", "class_id", "subject_id", name="uq_exam_class_subject"),
    )

    exam_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("exams.id", ondelete="CASCADE"), nullable=False, index=True
    )
    class_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("classes.id", ondelete="CASCADE"), nullable=False, index=True
    )
    subject_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False, index=True
    )
    max_marks: Mapped[float] = mapped_column(Float, default=100.0, nullable=False)
    pass_marks: Mapped[float] = mapped_column(Float, default=35.0, nullable=False)
    exam_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    start_time: Mapped[Optional[time]] = mapped_column(Time, nullable=True)
    end_time: Mapped[Optional[time]] = mapped_column(Time, nullable=True)

    exam = relationship("Exam", back_populates="exam_subjects")
    marks = relationship("Mark", back_populates="exam_subject", cascade="all, delete-orphan")


class GradeScale(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Letter grading brackets and GPA conversion points.
    """
    __tablename__ = "grade_scales"

    name: Mapped[str] = mapped_column(String(10), unique=True, nullable=False)  # A+, A, B, etc.
    min_percentage: Mapped[float] = mapped_column(Float, nullable=False)
    max_percentage: Mapped[float] = mapped_column(Float, nullable=False)
    grade_point: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)


class Mark(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Student mark entry for a specific exam subject.
    """
    __tablename__ = "marks"
    __table_args__ = (
        UniqueConstraint("exam_subject_id", "student_id", name="uq_exam_subject_student"),
        Index("ix_marks_student", "student_id"),
    )

    exam_subject_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("exam_subjects.id", ondelete="CASCADE"), nullable=False, index=True
    )
    student_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True
    )
    marks_obtained: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    is_absent: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="draft", nullable=False)  # draft, submitted, reviewed, approved
    remarks: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    entered_by_user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False
    )

    exam_subject = relationship("ExamSubject", back_populates="marks")


class ExamResult(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Consolidated exam result record per student.
    """
    __tablename__ = "exam_results"
    __table_args__ = (
        UniqueConstraint("exam_id", "student_id", name="uq_exam_student_result"),
        Index("ix_exam_results_student", "student_id"),
    )

    exam_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("exams.id", ondelete="CASCADE"), nullable=False, index=True
    )
    student_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True
    )
    total_marks_obtained: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    total_max_marks: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    percentage: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    grade: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    rank: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="draft", nullable=False)  # draft, submitted, reviewed, approved, published
    parent_approved: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    parent_approved_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    parent_approved_by_name: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    parent_feedback: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)


class MarkCorrectionRequest(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Workflow for audit-tracked mark adjustments post-submission.
    """
    __tablename__ = "mark_correction_requests"

    mark_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("marks.id", ondelete="CASCADE"), nullable=False, index=True
    )
    requested_marks: Mapped[float] = mapped_column(Float, nullable=False)
    reason: Mapped[str] = mapped_column(Text, nullable=False)
    requested_by_user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False
    )
    status: Mapped[str] = mapped_column(String(20), default="pending", nullable=False)  # pending, approved, rejected
    reviewed_by_user_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), nullable=True
    )
