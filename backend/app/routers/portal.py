import uuid
from typing import Any, Dict, List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.permissions import get_current_user, require_portal
from app.db.dependencies import get_db
from app.models.user import User
from app.services.portal_service import PortalService

router = APIRouter(prefix="/portal", tags=["Parent & Student Portals"])


@router.get("/parent/children")
def list_parent_children(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_portal("parent")),
):
    return PortalService.get_parent_children(db, current_user)


@router.get("/student/profile")
def get_student_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_portal("student")),
):
    return PortalService.get_student_profile(db, current_user)


@router.get("/student/{student_id}/attendance")
def get_attendance(
    student_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return PortalService.get_student_attendance(db, current_user, student_id)


@router.get("/student/{student_id}/timetable")
def get_timetable(
    student_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return PortalService.get_student_timetable(db, current_user, student_id)


@router.get("/student/{student_id}/results")
def get_exam_results(
    student_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return PortalService.get_student_results(db, current_user, student_id)


@router.get("/student/{student_id}/fees")
def get_fees(
    student_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return PortalService.get_student_fees(db, current_user, student_id)
