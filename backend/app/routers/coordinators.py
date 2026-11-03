import uuid
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, EmailStr
from sqlalchemy import desc, func, or_, select
from sqlalchemy.orm import Session

from app.core.exceptions import AppError
from app.core.permissions import get_current_user, require_roles
from app.db.dependencies import get_db
from app.models.coordinator import CoordinatorProfile
from app.models.staff import Staff
from app.models.user import Role, User, UserRole

router = APIRouter(prefix="/coordinators", tags=["Coordinators Management"])

# Permissions: Coordinator lead, Super admin, School admin, Principal can access and manage
require_coordinator_access = require_roles("super_admin", "school_admin", "principal", "coordinator")


class CoordinatorCreateSchema(BaseModel):
    full_name: str
    employee_id: str
    email: EmailStr
    phone_number: str
    designation: str = "Academic Coordinator"
    coordinator_type: str = "ACADEMIC"
    wing: str = "Senior Wing"
    allocated_grades: List[str] = []
    supervised_subjects: List[str] = []
    office_room: Optional[str] = "Academic Wing Rm 102"
    duty_responsibilities: Optional[str] = None
    is_lead: bool = False
    is_active: bool = True


class CoordinatorUpdateSchema(BaseModel):
    full_name: Optional[str] = None
    employee_id: Optional[str] = None
    email: Optional[EmailStr] = None
    phone_number: Optional[str] = None
    designation: Optional[str] = None
    coordinator_type: Optional[str] = None
    wing: Optional[str] = None
    allocated_grades: Optional[List[str]] = None
    supervised_subjects: Optional[List[str]] = None
    office_room: Optional[str] = None
    duty_responsibilities: Optional[str] = None
    is_lead: Optional[bool] = None
    is_active: Optional[bool] = None


@router.get("/stats", summary="Summary statistics of school coordinators")
def get_coordinator_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_coordinator_access),
):
    total = db.execute(select(func.count(CoordinatorProfile.id))).scalar() or 0
    active = db.execute(select(func.count(CoordinatorProfile.id)).where(CoordinatorProfile.is_active == True)).scalar() or 0
    leads = db.execute(select(func.count(CoordinatorProfile.id)).where(CoordinatorProfile.is_lead == True)).scalar() or 0
    
    # Get distinct wings count
    wings = db.execute(select(func.count(func.distinct(CoordinatorProfile.wing)))).scalar() or 0

    return {
        "total_coordinators": total,
        "active_coordinators": active,
        "lead_coordinators": leads,
        "wings_managed": wings,
    }


@router.get("", summary="List all coordinators with optional search and filters")
def list_coordinators(
    search: Optional[str] = Query(None, description="Search by name, employee_id, email, or designation"),
    wing: Optional[str] = Query(None, description="Filter by wing"),
    coordinator_type: Optional[str] = Query(None, description="Filter by type: ACADEMIC, WING, EXAMINATION, ACTIVITY"),
    is_active: Optional[bool] = Query(None, description="Filter active status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_coordinator_access),
):
    stmt = select(CoordinatorProfile).order_by(desc(CoordinatorProfile.is_lead), CoordinatorProfile.full_name)

    if search:
        search_filter = f"%{search.strip()}%"
        stmt = stmt.where(
            or_(
                CoordinatorProfile.full_name.ilike(search_filter),
                CoordinatorProfile.employee_id.ilike(search_filter),
                CoordinatorProfile.email.ilike(search_filter),
                CoordinatorProfile.designation.ilike(search_filter),
                CoordinatorProfile.wing.ilike(search_filter),
            )
        )

    if wing and wing.lower() != "all":
        stmt = stmt.where(CoordinatorProfile.wing.ilike(f"%{wing.strip()}%"))

    if coordinator_type and coordinator_type.lower() != "all":
        stmt = stmt.where(CoordinatorProfile.coordinator_type == coordinator_type.upper())

    if is_active is not None:
        stmt = stmt.where(CoordinatorProfile.is_active == is_active)

    results = db.execute(stmt).scalars().all()
    return [c.to_dict() for c in results]


@router.get("/{coordinator_id}", summary="Get coordinator profile details")
def get_coordinator(
    coordinator_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_coordinator_access),
):
    coord = db.get(CoordinatorProfile, coordinator_id)
    if not coord:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Coordinator profile not found")
    return coord.to_dict()


@router.post("", status_code=status.HTTP_201_CREATED, summary="Create a new coordinator profile")
def create_coordinator(
    payload: CoordinatorCreateSchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_coordinator_access),
):
    # Check if employee_id already assigned
    existing = db.execute(
        select(CoordinatorProfile).where(CoordinatorProfile.employee_id == payload.employee_id.strip())
    ).scalar_one_or_none()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Coordinator with Employee ID '{payload.employee_id}' already exists."
        )

    # Optional lookup to match existing staff or user
    matched_staff = db.execute(
        select(Staff).where(Staff.employee_id == payload.employee_id.strip())
    ).scalar_one_or_none()
    staff_id = matched_staff.id if matched_staff else None
    user_id = matched_staff.user_id if matched_staff else None

    new_coord = CoordinatorProfile(
        id=uuid.uuid4(),
        staff_id=staff_id,
        user_id=user_id,
        full_name=payload.full_name.strip(),
        employee_id=payload.employee_id.strip(),
        email=str(payload.email).strip().lower(),
        phone_number=payload.phone_number.strip(),
        designation=payload.designation.strip(),
        coordinator_type=payload.coordinator_type.strip().upper(),
        wing=payload.wing.strip(),
        allocated_grades=payload.allocated_grades,
        supervised_subjects=payload.supervised_subjects,
        office_room=payload.office_room.strip() if payload.office_room else None,
        duty_responsibilities=payload.duty_responsibilities,
        is_lead=payload.is_lead,
        is_active=payload.is_active,
    )

    db.add(new_coord)
    db.commit()
    db.refresh(new_coord)
    return new_coord.to_dict()


@router.put("/{coordinator_id}", summary="Update an existing coordinator")
def update_coordinator(
    coordinator_id: uuid.UUID,
    payload: CoordinatorUpdateSchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_coordinator_access),
):
    coord = db.get(CoordinatorProfile, coordinator_id)
    if not coord:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Coordinator profile not found")

    update_data = payload.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        if field == "coordinator_type" and val:
            setattr(coord, field, val.upper())
        elif field == "email" and val:
            setattr(coord, field, str(val).strip().lower())
        else:
            setattr(coord, field, val)

    db.commit()
    db.refresh(coord)
    return coord.to_dict()


@router.delete("/{coordinator_id}", summary="Delete or deactivate coordinator")
def delete_coordinator(
    coordinator_id: uuid.UUID,
    hard_delete: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_coordinator_access),
):
    coord = db.get(CoordinatorProfile, coordinator_id)
    if not coord:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Coordinator profile not found")

    if hard_delete:
        db.delete(coord)
    else:
        coord.is_active = False

    db.commit()
    return {"message": "Coordinator profile successfully updated/removed"}
