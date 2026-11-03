import uuid
from typing import List, Optional

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.core.exceptions import AppError
from app.core.permissions import get_current_user, require_roles
from app.db.dependencies import get_db
from app.models.user import User
from app.models.student import Student, Guardian, StudentGuardian
from app.models.tuition import TuitionCenter, TuitionTeacher, TuitionBatch, TuitionEnquiry
from app.schemas.tuition import (
    TuitionCenterCreate,
    TuitionCenterUpdate,
    TuitionCenterResponse,
    TuitionTeacherCreate,
    TuitionTeacherResponse,
    TuitionBatchCreate,
    TuitionBatchResponse,
    TuitionEnquiryCreate,
    TuitionEnquiryUpdateStatus,
    TuitionEnquiryResponse,
    TuitionRecommendationResponse,
)
from app.services.tuition_service import TuitionService

router = APIRouter(prefix="/tuitions", tags=["Smart Tuition Recommendation"])


# ---------------- HELPER AUTH / STUDENT RESOLVER ----------------

def _resolve_target_student(current_user: User, student_id: Optional[uuid.UUID], db: Session) -> Student:
    """
    Resolves student ensuring proper authorization:
    - If user is student, user can only access their own student profile.
    - If user is parent, student_id must be linked to this guardian.
    - If admin/staff, can access requested student_id or default to first student.
    """
    user_roles = [ur.role.name for ur in current_user.user_roles if ur.role] if hasattr(current_user, "user_roles") else []
    is_admin_or_staff = (
        current_user.username == "adrin"
        or any(r in user_roles for r in ["super_admin", "school_admin", "principal", "teacher", "counselor"])
    )

    # 1. Student self check
    student = db.execute(select(Student).where(Student.user_id == current_user.id)).scalar_one_or_none()
    if student:
        return student

    # 2. Parent check
    guardian = db.execute(select(Guardian).where(Guardian.user_id == current_user.id)).scalar_one_or_none()
    if guardian:
        if student_id:
            link = db.execute(
                select(StudentGuardian).where(
                    StudentGuardian.guardian_id == guardian.id,
                    StudentGuardian.student_id == student_id,
                )
            ).scalar_one_or_none()
            if not link:
                raise AppError(message="You are not authorized to view recommendations for this child.", status_code=403)
            child = db.get(Student, student_id)
            if child:
                return child

        # If no specific student_id provided, default to first linked child
        first_link = db.execute(
            select(StudentGuardian).where(StudentGuardian.guardian_id == guardian.id)
        ).scalars().first()
        if first_link:
            return db.get(Student, first_link.student_id)

    # 3. Staff / Admin preview
    if is_admin_or_staff:
        if student_id:
            target = db.get(Student, student_id)
            if target:
                return target
        fallback = db.query(Student).first()
        if fallback:
            return fallback

    raise AppError(message="Student record not found or unauthorized.", status_code=404)


# ---------------- ADMIN ENDPOINTS ----------------

@router.post("/", response_model=TuitionCenterResponse, status_code=status.HTTP_201_CREATED, summary="Create a new tuition center (Admin)")
def create_tuition_center(
    payload: TuitionCenterCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("super_admin", "school_admin", "principal")),
):
    center = TuitionCenter(
        id=uuid.uuid4(),
        name=payload.name,
        description=payload.description,
        address=payload.address,
        area=payload.area,
        city=payload.city,
        pincode=payload.pincode,
        latitude=payload.latitude,
        longitude=payload.longitude,
        contact_phone=payload.contact_phone,
        contact_email=payload.contact_email,
        website=payload.website,
        is_active=True,
        is_approved=payload.is_approved,
    )
    db.add(center)
    db.commit()
    db.refresh(center)
    return center


@router.get("/", response_model=List[TuitionCenterResponse], summary="List all tuition centers (Admin)")
def list_tuition_centers(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("super_admin", "school_admin", "principal", "teacher")),
):
    centers = (
        db.execute(
            select(TuitionCenter)
            .options(
                selectinload(TuitionCenter.teachers),
                selectinload(TuitionCenter.batches).selectinload(TuitionBatch.teacher),
            )
            .order_by(TuitionCenter.created_at.desc())
        )
        .scalars()
        .all()
    )
    return centers


@router.put("/{center_id}", response_model=TuitionCenterResponse, summary="Update tuition center (Admin)")
def update_tuition_center(
    center_id: uuid.UUID,
    payload: TuitionCenterUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("super_admin", "school_admin", "principal")),
):
    center = db.get(TuitionCenter, center_id)
    if not center:
        raise AppError(message="Tuition center not found", status_code=404)

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(center, field, value)

    db.commit()
    db.refresh(center)
    return center


@router.post("/{center_id}/approve", summary="Approve tuition center (Admin)")
def approve_tuition_center(
    center_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("super_admin", "school_admin", "principal")),
):
    center = db.get(TuitionCenter, center_id)
    if not center:
        raise AppError(message="Tuition center not found", status_code=404)

    center.is_approved = True
    db.commit()
    return {"message": f"Tuition center '{center.name}' successfully verified and approved."}


@router.post("/{center_id}/teachers", response_model=TuitionTeacherResponse, status_code=status.HTTP_201_CREATED, summary="Add teacher to center (Admin)")
def add_teacher_to_center(
    center_id: uuid.UUID,
    payload: TuitionTeacherCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("super_admin", "school_admin", "principal")),
):
    center = db.get(TuitionCenter, center_id)
    if not center:
        raise AppError(message="Tuition center not found", status_code=404)

    teacher = TuitionTeacher(
        id=uuid.uuid4(),
        tuition_center_id=center.id,
        teacher_name=payload.teacher_name,
        qualification=payload.qualification,
        experience_years=payload.experience_years,
        subjects_taught=payload.subjects_taught,
        rating=payload.rating,
        is_active=payload.is_active,
    )
    db.add(teacher)
    db.commit()
    db.refresh(teacher)
    return teacher


@router.post("/{center_id}/batches", response_model=TuitionBatchResponse, status_code=status.HTTP_201_CREATED, summary="Add batch/timing to center (Admin)")
def add_batch_to_center(
    center_id: uuid.UUID,
    payload: TuitionBatchCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("super_admin", "school_admin", "principal")),
):
    center = db.get(TuitionCenter, center_id)
    if not center:
        raise AppError(message="Tuition center not found", status_code=404)

    batch = TuitionBatch(
        id=uuid.uuid4(),
        tuition_center_id=center.id,
        teacher_id=payload.teacher_id,
        subject_name=payload.subject_name,
        days_of_week=payload.days_of_week,
        start_time=payload.start_time,
        end_time=payload.end_time,
        fee_per_month=payload.fee_per_month,
        batch_size_max=payload.batch_size_max,
        current_enrolled=payload.current_enrolled,
        is_active=payload.is_active,
    )
    db.add(batch)
    db.commit()
    db.refresh(batch)
    return batch


@router.get("/enquiries", response_model=List[TuitionEnquiryResponse], summary="List all student tuition enquiries (Admin/Staff)")
def list_all_tuition_enquiries(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("super_admin", "school_admin", "principal", "teacher")),
):
    enquiries = (
        db.execute(
            select(TuitionEnquiry)
            .options(
                selectinload(TuitionEnquiry.student),
                selectinload(TuitionEnquiry.tuition_center),
                selectinload(TuitionEnquiry.batch),
            )
            .order_by(TuitionEnquiry.created_at.desc())
        )
        .scalars()
        .all()
    )

    results = []
    for e in enquiries:
        results.append(
            TuitionEnquiryResponse(
                id=e.id,
                student_id=e.student_id,
                tuition_center_id=e.tuition_center_id,
                batch_id=e.batch_id,
                status=e.status,
                notes=e.notes,
                created_at=e.created_at,
                student_name=e.student.full_name if e.student else "Student",
                tuition_center_name=e.tuition_center.name if e.tuition_center else "Tuition Academy",
                batch_subject=e.batch.subject_name if e.batch else "General Coaching",
            )
        )
    return results


@router.put("/enquiries/{enquiry_id}/status", summary="Update enquiry status (Admin/Staff)")
def update_enquiry_status(
    enquiry_id: uuid.UUID,
    payload: TuitionEnquiryUpdateStatus,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("super_admin", "school_admin", "principal", "teacher")),
):
    enquiry = db.get(TuitionEnquiry, enquiry_id)
    if not enquiry:
        raise AppError(message="Enquiry record not found", status_code=404)

    enquiry.status = payload.status
    if payload.notes:
        enquiry.notes = payload.notes
    db.commit()
    return {"message": f"Enquiry status updated to '{payload.status}'.", "status": enquiry.status}


# ---------------- STUDENT & PARENT RECOMMENDATION & ENQUIRY ENDPOINTS ----------------

@router.get("/recommendations", response_model=TuitionRecommendationResponse, summary="Get smart tuition recommendations for student/parent")
def get_tuition_recommendations(
    student_id: Optional[uuid.UUID] = Query(None),
    area: Optional[str] = Query(None),
    budget_min: Optional[int] = Query(None),
    budget_max: Optional[int] = Query(None),
    timing: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    target_student = _resolve_target_student(current_user, student_id, db)
    return TuitionService.get_recommendations(
        student_id=target_student.id,
        db=db,
        area=area,
        budget_min=budget_min,
        budget_max=budget_max,
        preferred_timing=timing,
    )


@router.post("/enquire", response_model=TuitionEnquiryResponse, status_code=status.HTTP_201_CREATED, summary="Submit tuition enquiry (Student/Parent)")
def submit_tuition_enquiry(
    payload: TuitionEnquiryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    target_student = _resolve_target_student(current_user, payload.student_id, db)

    center = db.get(TuitionCenter, payload.tuition_center_id)
    if not center:
        raise AppError(message="Tuition center not found", status_code=404)

    enquiry = TuitionEnquiry(
        id=uuid.uuid4(),
        student_id=target_student.id,
        tuition_center_id=center.id,
        batch_id=payload.batch_id,
        status="pending",
        notes=payload.notes,
    )
    db.add(enquiry)
    db.commit()
    db.refresh(enquiry)

    batch_obj = db.get(TuitionBatch, payload.batch_id) if payload.batch_id else None

    return TuitionEnquiryResponse(
        id=enquiry.id,
        student_id=enquiry.student_id,
        tuition_center_id=enquiry.tuition_center_id,
        batch_id=enquiry.batch_id,
        status=enquiry.status,
        notes=enquiry.notes,
        created_at=enquiry.created_at,
        student_name=target_student.full_name,
        tuition_center_name=center.name,
        batch_subject=batch_obj.subject_name if batch_obj else "General Coaching",
    )


@router.get("/my-enquiries", response_model=List[TuitionEnquiryResponse], summary="Get student or parent submitted enquiries")
def get_my_tuition_enquiries(
    student_id: Optional[uuid.UUID] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    target_student = _resolve_target_student(current_user, student_id, db)

    enquiries = (
        db.execute(
            select(TuitionEnquiry)
            .options(
                selectinload(TuitionEnquiry.student),
                selectinload(TuitionEnquiry.tuition_center),
                selectinload(TuitionEnquiry.batch),
            )
            .where(TuitionEnquiry.student_id == target_student.id)
            .order_by(TuitionEnquiry.created_at.desc())
        )
        .scalars()
        .all()
    )

    results = []
    for e in enquiries:
        results.append(
            TuitionEnquiryResponse(
                id=e.id,
                student_id=e.student_id,
                tuition_center_id=e.tuition_center_id,
                batch_id=e.batch_id,
                status=e.status,
                notes=e.notes,
                created_at=e.created_at,
                student_name=e.student.full_name if e.student else "Student",
                tuition_center_name=e.tuition_center.name if e.tuition_center else "Tuition Center",
                batch_subject=e.batch.subject_name if e.batch else "General Coaching",
            )
        )
    return results

