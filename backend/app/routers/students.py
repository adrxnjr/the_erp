import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, Request, status
from sqlalchemy.orm import Session

from app.core.permissions import get_current_user, require_school_admin, require_staff
from app.core.rate_limit import limiter
from app.db.dependencies import get_db
from app.models.user import User
from app.schemas.student import (
    EnquiryConvertRequest,
    EnquiryCreate,
    EnquiryResponse,
    GuardianCreate,
    GuardianResponse,
    StudentCreate,
    StudentGuardianLinkRequest,
    StudentResponse,
    StudentStatusChangeRequest,
    StudentUpdate,
)
from app.services.student_service import StudentService

router = APIRouter(prefix="/students", tags=["Student Admissions & Management"])


# --- Public Enquiry Endpoint ---
@router.post(
    "/enquiries",
    response_model=EnquiryResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit Admission Enquiry (Public)",
    description="Public form submission requiring no authentication. Protected by rate limiting and honeypot anti-spam.",
)
@limiter.limit("5/hour")
def submit_enquiry(
    request: Request,
    payload: EnquiryCreate,
    db: Session = Depends(get_db),
):
    # Invisible honeypot check: if filled, quietly drop spam submission
    if payload.hp_website and payload.hp_website.strip():
        return EnquiryResponse(
            id=uuid.uuid4(),
            enquiry_number=f"ENQ-{datetime.now().year}-9999",
            student_name=payload.student_name,
            grade_applying_for=payload.grade_applying_for,
            parent_name=payload.parent_name,
            parent_phone=payload.parent_phone,
            parent_email=payload.parent_email,
            status="submitted",
            created_at=datetime.now(timezone.utc),
        )
    return StudentService.create_enquiry(db=db, data=payload)


@router.get(
    "/enquiries",
    response_model=List[EnquiryResponse],
    summary="List Admission Enquiries (Staff)",
)
def list_enquiries(
    status_filter: Optional[str] = Query(None),
    current_user: User = Depends(require_staff),
    db: Session = Depends(get_db),
):
    return StudentService.list_enquiries(db=db, status_filter=status_filter)


@router.post(
    "/enquiries/{enquiry_id}/convert",
    response_model=StudentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Convert Enquiry to Admitted Student",
)
def convert_enquiry(
    enquiry_id: uuid.UUID,
    payload: EnquiryConvertRequest,
    request: Request,
    current_user: User = Depends(require_school_admin),
    db: Session = Depends(get_db),
):
    return StudentService.convert_enquiry_to_student(
        db=db,
        enquiry_id=enquiry_id,
        data=payload,
        actor=current_user,
        request=request,
    )


# --- Student Management ---
@router.get(
    "",
    response_model=dict,
    summary="List and Search Students",
)
def list_students(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    class_id: Optional[uuid.UUID] = Query(None),
    section_id: Optional[uuid.UUID] = Query(None),
    status_filter: Optional[str] = Query(None),
    current_user: User = Depends(require_staff),
    db: Session = Depends(get_db),
):
    students, total = StudentService.list_students(
        db=db,
        page=page,
        page_size=page_size,
        search=search,
        class_id=class_id,
        section_id=section_id,
        status_filter=status_filter,
    )
    return {
        "items": [StudentResponse.model_validate(s) for s in students],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size if total > 0 else 0,
    }


@router.post(
    "",
    response_model=StudentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Direct Student Admission",
)
def create_student(
    payload: StudentCreate,
    request: Request,
    current_user: User = Depends(require_school_admin),
    db: Session = Depends(get_db),
):
    return StudentService.create_student(
        db=db,
        data=payload,
        actor=current_user,
        request=request,
    )


@router.post(
    "/{student_id}/status",
    response_model=StudentResponse,
    summary="Transition Student Status (Audited)",
)
def change_status(
    student_id: uuid.UUID,
    payload: StudentStatusChangeRequest,
    request: Request,
    current_user: User = Depends(require_school_admin),
    db: Session = Depends(get_db),
):
    return StudentService.change_student_status(
        db=db,
        student_id=student_id,
        data=payload,
        actor=current_user,
        request=request,
    )


# --- Guardian Management ---
@router.post(
    "/guardians",
    response_model=GuardianResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register Guardian",
)
def create_guardian(
    payload: GuardianCreate,
    request: Request,
    current_user: User = Depends(require_school_admin),
    db: Session = Depends(get_db),
):
    return StudentService.create_guardian(
        db=db,
        data=payload,
        actor=current_user,
        request=request,
    )


@router.post(
    "/{student_id}/guardians",
    status_code=status.HTTP_201_CREATED,
    summary="Link Guardian to Student",
)
def link_guardian(
    student_id: uuid.UUID,
    payload: StudentGuardianLinkRequest,
    current_user: User = Depends(require_school_admin),
    db: Session = Depends(get_db),
):
    StudentService.link_guardian(db=db, student_id=student_id, data=payload)
    return {"message": "Guardian successfully linked to student."}
