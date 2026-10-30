import uuid
from datetime import date, datetime, time
from typing import List, Optional
from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Index, Integer, String, Text, Time, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class StudentAttendance(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Daily student attendance record.
    Enforces one record per student per date per session.
    """
    __tablename__ = "student_attendance"
    __table_args__ = (
        UniqueConstraint("student_id", "attendance_date", "session", name="uq_student_date_session"),
        Index("ix_student_attendance_class_date", "class_id", "attendance_date"),
    )

    student_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True
    )
    class_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("classes.id", ondelete="CASCADE"), nullable=False, index=True
    )
    section_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("sections.id", ondelete="CASCADE"), nullable=False, index=True
    )
    academic_year_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("academic_years.id", ondelete="CASCADE"), nullable=False, index=True
    )
    attendance_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    session: Mapped[str] = mapped_column(String(20), default="full_day", nullable=False)  # full_day, morning, afternoon
    status: Mapped[str] = mapped_column(String(20), nullable=False)  # present, absent, late, half_day, on_leave
    remarks: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    marked_by_user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False
    )
    is_locked: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)


class StaffAttendance(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Staff daily check-in / check-out records.
    """
    __tablename__ = "staff_attendance"
    __table_args__ = (
        UniqueConstraint("staff_id", "attendance_date", name="uq_staff_attendance_date"),
    )

    staff_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("staff.id", ondelete="CASCADE"), nullable=False, index=True
    )
    attendance_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    check_in_time: Mapped[Optional[time]] = mapped_column(Time, nullable=True)
    check_out_time: Mapped[Optional[time]] = mapped_column(Time, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="present", nullable=False)  # present, absent, half_day, on_leave, late
    remarks: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)


class LeaveRequest(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Staff and student leave requests.
    """
    __tablename__ = "leave_requests"

    requester_user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    applicant_type: Mapped[str] = mapped_column(String(20), nullable=False)  # staff, student
    student_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("students.id", ondelete="CASCADE"), nullable=True, index=True
    )
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date] = mapped_column(Date, nullable=False)
    leave_type: Mapped[str] = mapped_column(String(50), nullable=False)  # sick, casual, emergency
    reason: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="pending", nullable=False)  # pending, approved, rejected, cancelled
    reviewed_by_user_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    review_remarks: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    reviewed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)


class AttendanceCorrectionRequest(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Requests to alter locked attendance records.
    Requires principal or school_admin approval.
    """
    __tablename__ = "attendance_correction_requests"

    attendance_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("student_attendance.id", ondelete="CASCADE"), nullable=False, index=True
    )
    requested_by_user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False
    )
    current_status: Mapped[str] = mapped_column(String(20), nullable=False)
    requested_status: Mapped[str] = mapped_column(String(20), nullable=False)
    reason: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="pending", nullable=False)  # pending, approved, rejected
    reviewed_by_user_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    reviewed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)


class AttendanceChangeHistory(Base, UUIDPrimaryKeyMixin):
    """
    Immutable change audit trail for attendance alterations.
    """
    __tablename__ = "attendance_change_history"

    attendance_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("student_attendance.id", ondelete="CASCADE"), nullable=False, index=True
    )
    previous_status: Mapped[str] = mapped_column(String(20), nullable=False)
    new_status: Mapped[str] = mapped_column(String(20), nullable=False)
    changed_by_user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False
    )
    reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
