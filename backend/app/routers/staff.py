from typing import Optional
from fastapi import APIRouter, Depends, Query, Request, status
from sqlalchemy.orm import Session

from app.core.permissions import require_school_admin, require_staff
from app.db.dependencies import get_db
from app.models.user import User
from app.schemas.staff import (
    StaffAssignmentCreate,
    StaffAssignmentResponse,
    StaffCreate,
    StaffResponse,
)
from app.services.staff_service import StaffService

router = APIRouter(prefix="/staff", tags=["Staff Management"])


@router.get(
    "",
    response_model=dict,
    summary="List and Search Staff Members",
)
def list_staff(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    staff_type: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    current_user: User = Depends(require_staff),
    db: Session = Depends(get_db),
):
    staff_list, total = StaffService.list_staff(
        db=db,
        page=page,
        page_size=page_size,
        search=search,
        staff_type=staff_type,
        is_active=is_active,
    )
    return {
        "items": [StaffResponse.model_validate(s) for s in staff_list],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size if total > 0 else 0,
    }


@router.post(
    "",
    response_model=StaffResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Staff Employee",
)
def create_staff(
    payload: StaffCreate,
    request: Request,
    current_user: User = Depends(require_school_admin),
    db: Session = Depends(get_db),
):
    return StaffService.create_staff(
        db=db,
        data=payload,
        actor=current_user,
        request=request,
    )


@router.post(
    "/assignments",
    response_model=StaffAssignmentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Assign Teacher to Class, Section, and Subject",
    description="Enforces that inactive staff members cannot receive new teaching assignments.",
)
def assign_staff(
    payload: StaffAssignmentCreate,
    request: Request,
    current_user: User = Depends(require_school_admin),
    db: Session = Depends(get_db),
):
    return StaffService.assign_staff(
        db=db,
        data=payload,
        actor=current_user,
        request=request,
    )
