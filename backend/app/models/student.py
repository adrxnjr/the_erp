import uuid
from datetime import date, datetime
from typing import List, Optional
from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Index, Integer, String, Text, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class Enquiry(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Public student admission enquiry record.
    """
    __tablename__ = "enquiries"

    enquiry_number: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    student_name: Mapped[str] = mapped_column(String(150), nullable=False)
    date_of_birth: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    gender: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    grade_applying_for: Mapped[str] = mapped_column(String(50), nullable=False)
    parent_name: Mapped[str] = mapped_column(String(150), nullable=False)
    parent_phone: Mapped[str] = mapped_column(String(30), nullable=False, index=True)
    parent_email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    address: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(30), default="submitted", nullable=False)  # submitted, under_review, converted, rejected
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    assigned_staff_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )


class Student(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Student master record.
    """
    __tablename__ = "students"

    admission_number: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    roll_number: Mapped[Optional[str]] = mapped_column(String(30), nullable=True)
    full_name: Mapped[str] = mapped_column(String(150), nullable=False, index=True)
    date_of_birth: Mapped[date] = mapped_column(Date, nullable=False)
    gender: Mapped[str] = mapped_column(String(20), nullable=False)
    address: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    photo_path: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    admission_date: Mapped[date] = mapped_column(Date, nullable=False)
    phone_number: Mapped[Optional[str]] = mapped_column(String(30), nullable=True)
    email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    status: Mapped[str] = mapped_column(
        String(30), default="active", nullable=False
    )  # enquiry, applied, admitted, active, transferred, graduated, withdrawn

    # Foreign Keys
    class_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("classes.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    section_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("sections.id", ondelete="SET NULL"), nullable=True, index=True
    )
    academic_year_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("academic_years.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), unique=True, nullable=True
    )

    # Relationships
    class_room = relationship("ClassRoom", backref="students")
    section = relationship("Section", backref="students")
    academic_year = relationship("AcademicYear", backref="students")
    student_guardians: Mapped[List["StudentGuardian"]] = relationship(
        "StudentGuardian", back_populates="student", cascade="all, delete-orphan"
    )
    documents: Mapped[List["StudentDocument"]] = relationship(
        "StudentDocument", back_populates="student", cascade="all, delete-orphan"
    )
    status_history: Mapped[List["StudentStatusHistory"]] = relationship(
        "StudentStatusHistory", back_populates="student", cascade="all, delete-orphan"
    )


class Guardian(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Parent / Guardian contact and legal representation.
    """
    __tablename__ = "guardians"

    full_name: Mapped[str] = mapped_column(String(150), nullable=False, index=True)
    relationship_type: Mapped[str] = mapped_column(String(50), nullable=False)  # father, mother, guardian
    phone_number: Mapped[str] = mapped_column(String(30), nullable=False, index=True)
    email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    occupation: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    address: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_emergency_contact: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), unique=True, nullable=True
    )

    # Relationships
    student_guardians: Mapped[List["StudentGuardian"]] = relationship(
        "StudentGuardian", back_populates="guardian", cascade="all, delete-orphan"
    )


class StudentGuardian(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Junction table linking students to multiple guardians.
    """
    __tablename__ = "student_guardians"
    __table_args__ = (
        UniqueConstraint("student_id", "guardian_id", name="uq_student_guardian_pair"),
    )

    student_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True
    )
    guardian_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("guardians.id", ondelete="CASCADE"), nullable=False, index=True
    )
    is_primary: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    can_pickup: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    student: Mapped["Student"] = relationship("Student", back_populates="student_guardians")
    guardian: Mapped["Guardian"] = relationship("Guardian", back_populates="student_guardians")


class StudentDocument(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Uploaded student documents (birth certificate, transfer certificate, etc.).
    """
    __tablename__ = "student_documents"

    student_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True
    )
    document_name: Mapped[str] = mapped_column(String(150), nullable=False)
    document_type: Mapped[str] = mapped_column(String(50), nullable=False)
    file_path: Mapped[str] = mapped_column(String(255), nullable=False)
    file_size_bytes: Mapped[int] = mapped_column(Integer, nullable=False)
    mime_type: Mapped[str] = mapped_column(String(100), nullable=False)
    uploaded_by_user_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )

    student: Mapped["Student"] = relationship("Student", back_populates="documents")


class StudentStatusHistory(Base, UUIDPrimaryKeyMixin):
    """
    Immutable audit trail for student status transitions.
    """
    __tablename__ = "student_status_history"

    student_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True
    )
    previous_status: Mapped[str] = mapped_column(String(30), nullable=False)
    new_status: Mapped[str] = mapped_column(String(30), nullable=False)
    reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    changed_by_user_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    student: Mapped["Student"] = relationship("Student", back_populates="status_history")
