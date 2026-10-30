import uuid
from typing import List
from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.orm import Session

from app.core.permissions import require_school_admin, require_staff
from app.db.dependencies import get_db
from app.models.user import User
from app.schemas.attendance import (
    AttendanceCorrectionCreate,
    AttendanceCorrectionReview,
    AttendanceStatsResponse,
    BulkStudentAttendanceCreate,
    StudentAttendanceResponse,
)
from app.services.attendance_service import AttendanceService

router = APIRouter(prefix="/attendance", tags=["Attendance Management"])


@router.post(
    "/student/bulk",
    response_model=List[StudentAttendanceResponse],
    status_code=status.HTTP_200_OK,
    summary="Mark Daily Student Attendance in Bulk",
    description="Submits daily attendance for a class section. Verifies lock status before updating.",
)
def mark_bulk_student_attendance(
    payload: BulkStudentAttendanceCreate,
    request: Request,
    current_user: User = Depends(require_staff),
    db: Session = Depends(get_db),
):
    records = AttendanceService.mark_bulk_student_attendance(
        db=db,
        data=payload,
        actor=current_user,
        request=request,
    )
    return [StudentAttendanceResponse.model_validate(r) for r in records]


@router.post(
    "/student/corrections",
    status_code=status.HTTP_201_CREATED,
    summary="Submit Attendance Correction Request",
)
def request_correction(
    payload: AttendanceCorrectionCreate,
    request: Request,
    current_user: User = Depends(require_staff),
    db: Session = Depends(get_db),
):
    AttendanceService.request_attendance_correction(
        db=db,
        data=payload,
        actor=current_user,
        request=request,
    )
    return {"message": "Attendance correction request submitted for administrative review."}


@router.post(
    "/student/corrections/{request_id}/review",
    status_code=status.HTTP_200_OK,
    summary="Review Attendance Correction Request (Principal / Admin)",
)
def review_correction(
    request_id: uuid.UUID,
    payload: AttendanceCorrectionReview,
    request: Request,
    current_user: User = Depends(require_school_admin),
    db: Session = Depends(get_db),
):
    AttendanceService.review_attendance_correction(
        db=db,
        request_id=request_id,
        data=payload,
        actor=current_user,
        request=request,
    )
    return {"message": f"Correction request {'approved' if payload.approved else 'rejected'}."}


@router.get(
    "/student/{student_id}/stats",
    response_model=AttendanceStatsResponse,
    summary="Calculate Student Attendance Percentage",
)
def get_student_attendance_stats(
    student_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    return AttendanceService.calculate_student_attendance_stats(db=db, student_id=student_id)
