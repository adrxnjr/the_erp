import uuid
from datetime import date
from typing import List, Optional
from sqlalchemy import Boolean, Date, ForeignKey, Index, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class Staff(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    School staff employee master record (Teaching, Administrative, Support).
    """
    __tablename__ = "staff"

    employee_id: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    full_name: Mapped[str] = mapped_column(String(150), nullable=False, index=True)
    email: Mapped[Optional[str]] = mapped_column(String(255), unique=True, index=True, nullable=True)
    phone_number: Mapped[str] = mapped_column(String(30), nullable=False)
    designation: Mapped[str] = mapped_column(String(100), nullable=False)
    department: Mapped[str] = mapped_column(String(100), nullable=False)
    staff_type: Mapped[str] = mapped_column(String(50), default="teaching", nullable=False)  # teaching, non_teaching, driver
    qualification: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    joining_date: Mapped[date] = mapped_column(Date, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), unique=True, nullable=True
    )

    # Relationships
    assignments: Mapped[List["StaffAssignment"]] = relationship(
        "StaffAssignment", back_populates="staff", cascade="all, delete-orphan"
    )


class StaffAssignment(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Teacher classroom, section, and curriculum subject allocations.
    """
    __tablename__ = "staff_assignments"
    __table_args__ = (
        UniqueConstraint(
            "staff_id", "class_id", "section_id", "subject_id", "academic_year_id",
            name="uq_staff_class_section_subject_year",
        ),
    )

    staff_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("staff.id", ondelete="CASCADE"), nullable=False, index=True
    )
    class_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("classes.id", ondelete="CASCADE"), nullable=False, index=True
    )
    section_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("sections.id", ondelete="CASCADE"), nullable=False, index=True
    )
    subject_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False, index=True
    )
    academic_year_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("academic_years.id", ondelete="CASCADE"), nullable=False, index=True
    )
    is_primary_teacher: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    staff: Mapped["Staff"] = relationship("Staff", back_populates="assignments")
