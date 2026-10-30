import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.permissions import get_current_user, require_school_admin
from app.db.dependencies import get_db
from app.models.academic import ClassRoom, Section, Subject
from app.models.staff import Staff, StaffAssignment
from app.models.user import User
from app.schemas.academic import (
    AcademicYearCreate,
    AcademicYearResponse,
    AcademicYearUpdate,
    ClassCreate,
    ClassResponse,
    ClassSubjectCreate,
    ClassSubjectResponse,
    HolidayCreate,
    HolidayResponse,
    SectionCreate,
    SectionResponse,
    SubjectCreate,
    SubjectResponse,
)
from app.services.academic_service import AcademicService

router = APIRouter(prefix="/academic", tags=["Academic & School Setup"])


@router.get("/staff/my-classes", summary="Get classes and sections handled by the authenticated staff member")
def get_my_handled_classes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    user_roles = [ur.role.name for ur in current_user.user_roles if ur.role]
    is_admin = any(r in ("super_admin", "school_admin", "principal") for r in user_roles)
    is_teacher = any(r == "teacher" for r in user_roles)

    staff = db.execute(select(Staff).where(Staff.user_id == current_user.id)).scalar_one_or_none()
    assignments = []
    if staff:
        assigns = db.execute(
            select(StaffAssignment).where(
                StaffAssignment.staff_id == staff.id,
                StaffAssignment.is_active == True,
            )
        ).scalars().all()

        for a in assigns:
            cls = db.execute(select(ClassRoom).where(ClassRoom.id == a.class_id)).scalar_one_or_none()
            sec = db.execute(select(Section).where(Section.id == a.section_id)).scalar_one_or_none()
            sub = db.execute(select(Subject).where(Subject.id == a.subject_id)).scalar_one_or_none()
            assignments.append({
                "class_id": str(a.class_id),
                "class_name": cls.name if cls else "Class",
                "section_id": str(a.section_id),
                "section_name": sec.name if sec else "A",
                "subject_id": str(a.subject_id) if a.subject_id else None,
                "subject_name": sub.name if sub else "General",
                "is_primary_teacher": a.is_primary_teacher,
            })

    # If teacher has no explicit assignments in DB yet, assign them to Grade 10 / Section A as demo default
    if is_teacher and not assignments:
        default_cls = db.execute(select(ClassRoom).order_by(ClassRoom.name)).scalars().first()
        if default_cls:
            default_sec = db.execute(select(Section).where(Section.class_id == default_cls.id)).scalars().first()
            if default_sec:
                assignments.append({
                    "class_id": str(default_cls.id),
                    "class_name": default_cls.name,
                    "section_id": str(default_sec.id),
                    "section_name": default_sec.name,
                    "subject_id": None,
                    "subject_name": "Class Mentor",
                    "is_primary_teacher": True,
                })

    return {
        "is_admin": is_admin,
        "is_teacher": is_teacher,
        "can_edit_attendance": is_teacher and not is_admin,
        "handled_classes": assignments,
    }


# --- Academic Years ---
@router.get("/years", response_model=List[AcademicYearResponse], summary="List Academic Years")
def list_academic_years(db: Session = Depends(get_db)):
    return AcademicService.list_academic_years(db)


@router.post(
    "/years",
    response_model=AcademicYearResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Academic Year",
)
def create_academic_year(
    payload: AcademicYearCreate,
    current_user: User = Depends(require_school_admin),
    db: Session = Depends(get_db),
):
    return AcademicService.create_academic_year(db, payload)


@router.post(
    "/years/{year_id}/activate",
    response_model=AcademicYearResponse,
    summary="Activate Single Academic Year",
)
def activate_academic_year(
    year_id: uuid.UUID,
    current_user: User = Depends(require_school_admin),
    db: Session = Depends(get_db),
):
    return AcademicService.activate_academic_year(db, year_id)


@router.patch("/years/{year_id}", response_model=AcademicYearResponse, summary="Update Academic Year")
def update_academic_year(
    year_id: uuid.UUID,
    payload: AcademicYearUpdate,
    current_user: User = Depends(require_school_admin),
    db: Session = Depends(get_db),
):
    return AcademicService.update_academic_year(db, year_id, payload)


# --- Classes ---
@router.get("/classes", response_model=List[ClassResponse], summary="List Classes")
def list_classes(db: Session = Depends(get_db)):
    return AcademicService.list_classes(db)


@router.post(
    "/classes",
    response_model=ClassResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Class",
)
def create_class(
    payload: ClassCreate,
    current_user: User = Depends(require_school_admin),
    db: Session = Depends(get_db),
):
    return AcademicService.create_class(db, payload)


# --- Sections ---
@router.get("/sections", response_model=List[SectionResponse], summary="List Sections")
def list_sections(class_id: Optional[uuid.UUID] = Query(None), db: Session = Depends(get_db)):
    return AcademicService.list_sections(db, class_id=class_id)


@router.post(
    "/sections",
    response_model=SectionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Section under Class",
)
def create_section(
    payload: SectionCreate,
    current_user: User = Depends(require_school_admin),
    db: Session = Depends(get_db),
):
    return AcademicService.create_section(db, payload)


# --- Subjects ---
@router.get("/subjects", response_model=List[SubjectResponse], summary="List Subjects")
def list_subjects(db: Session = Depends(get_db)):
    return AcademicService.list_subjects(db)


@router.post(
    "/subjects",
    response_model=SubjectResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Subject",
)
def create_subject(
    payload: SubjectCreate,
    current_user: User = Depends(require_school_admin),
    db: Session = Depends(get_db),
):
    return AcademicService.create_subject(db, payload)


# --- Class-Subject Mapping ---
@router.post(
    "/class-subjects",
    response_model=ClassSubjectResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Map Subject to Class",
)
def map_class_subject(
    payload: ClassSubjectCreate,
    current_user: User = Depends(require_school_admin),
    db: Session = Depends(get_db),
):
    return AcademicService.map_class_subject(db, payload)


# --- Holidays ---
@router.get("/holidays", response_model=List[HolidayResponse], summary="List Holidays")
def list_holidays(academic_year_id: Optional[uuid.UUID] = Query(None), db: Session = Depends(get_db)):
    return AcademicService.list_holidays(db, academic_year_id=academic_year_id)


@router.post(
    "/holidays",
    response_model=HolidayResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Holiday",
)
def create_holiday(
    payload: HolidayCreate,
    current_user: User = Depends(require_school_admin),
    db: Session = Depends(get_db),
):
    return AcademicService.create_holiday(db, payload)
