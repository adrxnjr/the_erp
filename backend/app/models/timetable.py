import uuid
from datetime import date, time
from typing import Optional
from sqlalchemy import Boolean, Date, ForeignKey, Index, Integer, String, Time, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class Period(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Daily bell schedule time slot.
    """
    __tablename__ = "periods"
    __table_args__ = (
        UniqueConstraint("period_number", name="uq_period_number"),
    )

    name: Mapped[str] = mapped_column(String(50), nullable=False)  # e.g. "Period 1", "Lunch Break"
    period_number: Mapped[int] = mapped_column(Integer, nullable=False)
    start_time: Mapped[time] = mapped_column(Time, nullable=False)
    end_time: Mapped[time] = mapped_column(Time, nullable=False)
    is_break: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)


class TimetableEntry(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Classroom timetable scheduling record with database-level conflict prevention.
    """
    __tablename__ = "timetable_entries"
    __table_args__ = (
        # 1. No teacher clash: same teacher cannot be scheduled in 2 places simultaneously
        UniqueConstraint(
            "academic_year_id", "teacher_staff_id", "day_of_week", "period_id",
            name="uq_timetable_teacher_slot",
        ),
        # 2. No section clash: same class section cannot have 2 classes at once
        UniqueConstraint(
            "academic_year_id", "class_id", "section_id", "day_of_week", "period_id",
            name="uq_timetable_section_slot",
        ),
    )

    academic_year_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("academic_years.id", ondelete="CASCADE"), nullable=False, index=True
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
    teacher_staff_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("staff.id", ondelete="CASCADE"), nullable=False, index=True
    )
    period_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("periods.id", ondelete="CASCADE"), nullable=False, index=True
    )
    day_of_week: Mapped[int] = mapped_column(Integer, nullable=False)  # 0=Monday ... 6=Sunday
    room_number: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)


class Substitution(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Substitute teacher assignment for a specific timetable entry and date.
    """
    __tablename__ = "substitutions"
    __table_args__ = (
        UniqueConstraint("timetable_entry_id", "substitution_date", name="uq_entry_substitution_date"),
    )

    timetable_entry_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("timetable_entries.id", ondelete="CASCADE"), nullable=False, index=True
    )
    original_staff_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("staff.id", ondelete="CASCADE"), nullable=False
    )
    substitute_staff_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("staff.id", ondelete="CASCADE"), nullable=False, index=True
    )
    substitution_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    reason: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="assigned", nullable=False)  # assigned, completed, cancelled
