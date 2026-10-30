import uuid
from datetime import date, datetime, timezone
from typing import List, Optional
from fastapi import Request, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.exceptions import AppError
from app.models.attendance import (
    AttendanceChangeHistory,
    AttendanceCorrectionRequest,
    LeaveRequest,
    StaffAttendance,
    StudentAttendance,
)
from app.models.user import User
from app.schemas.attendance import (
    AttendanceCorrectionCreate,
    AttendanceCorrectionReview,
    AttendanceStatsResponse,
    BulkStudentAttendanceCreate,
    LeaveRequestCreate,
    LeaveRequestReview,
)
from app.services.audit_service import record_audit

VALID_ATTENDANCE_STATUSES = {"present", "absent", "late", "half_day", "on_leave"}


class AttendanceService:
    @staticmethod
    def mark_bulk_student_attendance(
        db: Session,
        data: BulkStudentAttendanceCreate,
        actor: User,
        request: Optional[Request] = None,
    ) -> List[StudentAttendance]:
        """
        Marks attendance in bulk for a class section on a specified date.
        If records exist, updates them; otherwise creates them.
        Prevents direct modification if the attendance is locked.
        """
        results = []
        for item in data.items:
            if item.status not in VALID_ATTENDANCE_STATUSES:
                raise AppError(
                    message=f"Invalid attendance status '{item.status}'.",
                    status_code=400,
                    error_code="INVALID_STATUS",
                )

            # Check existing record
            stmt = select(StudentAttendance).where(
                StudentAttendance.student_id == item.student_id,
                StudentAttendance.attendance_date == data.attendance_date,
                StudentAttendance.session == data.session,
            )
            existing = db.execute(stmt).scalar_one_or_none()

            if existing:
                if existing.is_locked:
                    raise AppError(
                        message=f"Attendance for date '{data.attendance_date}' is locked. Submit a correction request.",
                        status_code=403,
                        error_code="ATTENDANCE_LOCKED",
                    )
                existing.status = item.status
                existing.remarks = item.remarks
                existing.marked_by_user_id = actor.id
                results.append(existing)
            else:
                record = StudentAttendance(
                    id=uuid.uuid4(),
                    student_id=item.student_id,
                    class_id=data.class_id,
                    section_id=data.section_id,
                    academic_year_id=data.academic_year_id,
                    attendance_date=data.attendance_date,
                    session=data.session,
                    status=item.status,
                    remarks=item.remarks,
                    marked_by_user_id=actor.id,
                    is_locked=False,
                )
                db.add(record)
                results.append(record)

        record_audit(
            db=db,
            action="STUDENT_ATTENDANCE_MARKED",
            entity_name="student_attendance",
            actor_user_id=actor.id,
            new_values={
                "class_id": str(data.class_id),
                "section_id": str(data.section_id),
                "attendance_date": data.attendance_date.isoformat(),
                "count": len(data.items),
            },
            request=request,
        )
        db.commit()
        for r in results:
            db.refresh(r)
        return results

    @staticmethod
    def request_attendance_correction(
        db: Session,
        data: AttendanceCorrectionCreate,
        actor: User,
        request: Optional[Request] = None,
    ) -> AttendanceCorrectionRequest:
        attendance = db.execute(
            select(StudentAttendance).where(StudentAttendance.id == data.attendance_id)
        ).scalar_one_or_none()
        if not attendance:
            raise AppError(message="Attendance record not found.", status_code=404, error_code="NOT_FOUND")

        corr_req = AttendanceCorrectionRequest(
            id=uuid.uuid4(),
            attendance_id=data.attendance_id,
            requested_by_user_id=actor.id,
            current_status=attendance.status,
            requested_status=data.requested_status,
            reason=data.reason,
            status="pending",
        )
        db.add(corr_req)
        db.commit()
        db.refresh(corr_req)
        return corr_req

    @staticmethod
    def review_attendance_correction(
        db: Session,
        request_id: uuid.UUID,
        data: AttendanceCorrectionReview,
        actor: User,
        request: Optional[Request] = None,
    ) -> AttendanceCorrectionRequest:
        corr_req = db.execute(
            select(AttendanceCorrectionRequest).where(AttendanceCorrectionRequest.id == request_id)
        ).scalar_one_or_none()
        if not corr_req:
            raise AppError(message="Correction request not found.", status_code=404, error_code="NOT_FOUND")

        if data.approved:
            corr_req.status = "approved"
            attendance = db.execute(
                select(StudentAttendance).where(StudentAttendance.id == corr_req.attendance_id)
            ).scalar_one()

            # Record change history
            history = AttendanceChangeHistory(
                id=uuid.uuid4(),
                attendance_id=attendance.id,
                previous_status=attendance.status,
                new_status=corr_req.requested_status,
                changed_by_user_id=actor.id,
                reason=f"Approved correction: {corr_req.reason}",
            )
            db.add(history)
            attendance.status = corr_req.requested_status
        else:
            corr_req.status = "rejected"

        corr_req.reviewed_by_user_id = actor.id
        corr_req.reviewed_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(corr_req)
        return corr_req

    @staticmethod
    def calculate_student_attendance_stats(db: Session, student_id: uuid.UUID) -> AttendanceStatsResponse:
        records = db.execute(
            select(StudentAttendance).where(StudentAttendance.student_id == student_id)
        ).scalars().all()

        total = len(records)
        present = sum(1 for r in records if r.status == "present")
        absent = sum(1 for r in records if r.status == "absent")
        late = sum(1 for r in records if r.status == "late")
        half_day = sum(1 for r in records if r.status == "half_day")

        effective_present = present + (0.5 * late) + (0.5 * half_day)
        percentage = round((effective_present / total) * 100.0, 2) if total > 0 else 0.0

        return AttendanceStatsResponse(
            total_days=total,
            present_days=present,
            absent_days=absent,
            late_days=late,
            attendance_percentage=percentage,
        )
