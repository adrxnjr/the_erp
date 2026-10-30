import uuid
from typing import List
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.permissions import require_school_admin
from app.db.dependencies import get_db
from app.models.user import User
from app.schemas.timetable import (
    PeriodCreate,
    PeriodResponse,
    SubstitutionCreate,
    SubstitutionResponse,
    TimetableEntryCreate,
    TimetableEntryResponse,
)
from app.services.timetable_service import TimetableService

router = APIRouter(prefix="/timetable", tags=["Timetable & Scheduling"])


@router.get("/periods", response_model=List[PeriodResponse], summary="List Bell Schedule Periods")
def list_periods(db: Session = Depends(get_db)):
    return TimetableService.list_periods(db=db)


@router.post(
    "/periods",
    response_model=PeriodResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Period",
)
def create_period(
    payload: PeriodCreate,
    current_user: User = Depends(require_school_admin),
    db: Session = Depends(get_db),
):
    return TimetableService.create_period(db=db, data=payload)


@router.post(
    "/entries",
    response_model=TimetableEntryResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Schedule Class Timetable Entry",
    description="Prevents teacher clashes, class section clashes, and room scheduling conflicts.",
)
def create_timetable_entry(
    payload: TimetableEntryCreate,
    current_user: User = Depends(require_school_admin),
    db: Session = Depends(get_db),
):
    return TimetableService.create_timetable_entry(db=db, data=payload)


@router.get(
    "/entries",
    response_model=List[TimetableEntryResponse],
    summary="List Section Timetable Entries",
)
def list_section_timetable(
    class_id: uuid.UUID = Query(...),
    section_id: uuid.UUID = Query(...),
    academic_year_id: uuid.UUID = Query(...),
    db: Session = Depends(get_db),
):
    return TimetableService.list_entries_for_section(
        db=db,
        class_id=class_id,
        section_id=section_id,
        academic_year_id=academic_year_id,
    )


@router.post(
    "/substitutions",
    response_model=SubstitutionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Assign Substitute Teacher",
)
def assign_substitution(
    payload: SubstitutionCreate,
    current_user: User = Depends(require_school_admin),
    db: Session = Depends(get_db),
):
    return TimetableService.assign_substitution(db=db, data=payload)
