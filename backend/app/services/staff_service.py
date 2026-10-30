import uuid
from typing import List, Optional, Tuple
from fastapi import Request
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.core.exceptions import AppError
from app.core.security import hash_password
from app.models.staff import Staff, StaffAssignment
from app.models.user import Role, User, UserRole
from app.schemas.staff import StaffAssignmentCreate, StaffCreate, StaffUpdate
from app.services.audit_service import record_audit


class StaffService:
    @staticmethod
    def create_staff(
        db: Session,
        data: StaffCreate,
        actor: User,
        request: Optional[Request] = None,
    ) -> Staff:
        # Check employee ID uniqueness
        existing = db.execute(select(Staff).where(Staff.employee_id == data.employee_id)).scalar_one_or_none()
        if existing:
            raise AppError(
                message=f"Employee ID '{data.employee_id}' is already assigned.",
                status_code=409,
                error_code="EMPLOYEE_ID_EXISTS",
            )

        user_id = None
        if data.create_user_account:
            role_name = "teacher" if data.staff_type == "teaching" else "non_teaching"
            staff_role = db.execute(select(Role).where(Role.name == role_name)).scalar_one_or_none()
            if staff_role:
                username = f"stf_{data.employee_id.lower().replace('-', '_')}"
                staff_user = User(
                    id=uuid.uuid4(),
                    username=username,
                    email=str(data.email) if data.email else None,
                    hashed_password=hash_password(f"Staff@{data.employee_id}"),
                    full_name=data.full_name,
                    phone_number=data.phone_number,
                    portal_type="staff",
                    is_active=True,
                    must_change_password=True,
                )
                db.add(staff_user)
                db.flush()
                ur = UserRole(id=uuid.uuid4(), user_id=staff_user.id, role_id=staff_role.id)
                db.add(ur)
                user_id = staff_user.id

        staff = Staff(
            id=uuid.uuid4(),
            employee_id=data.employee_id,
            full_name=data.full_name,
            email=str(data.email) if data.email else None,
            phone_number=data.phone_number,
            designation=data.designation,
            department=data.department,
            staff_type=data.staff_type,
            qualification=data.qualification,
            joining_date=data.joining_date,
            is_active=True,
            user_id=user_id,
        )
        db.add(staff)
        db.flush()

        record_audit(
            db=db,
            action="STAFF_CREATED",
            entity_name="staff",
            record_id=str(staff.id),
            actor_user_id=actor.id,
            new_values={"employee_id": staff.employee_id, "full_name": staff.full_name},
            request=request,
        )
        db.commit()
        db.refresh(staff)
        return staff

    @staticmethod
    def list_staff(
        db: Session,
        page: int = 1,
        page_size: int = 20,
        search: Optional[str] = None,
        staff_type: Optional[str] = None,
        is_active: Optional[bool] = None,
    ) -> Tuple[List[Staff], int]:
        query = select(Staff)

        if search:
            term = f"%{search.strip()}%"
            query = query.where(
                or_(
                    Staff.full_name.ilike(term),
                    Staff.employee_id.ilike(term),
                    Staff.department.ilike(term),
                )
            )

        if staff_type:
            query = query.where(Staff.staff_type == staff_type)
        if is_active is not None:
            query = query.where(Staff.is_active == is_active)

        count_query = select(func.count()).select_from(query.subquery())
        total = db.execute(count_query).scalar() or 0

        query = query.order_by(Staff.full_name).offset((page - 1) * page_size).limit(page_size)
        staff_list = list(db.execute(query).scalars().all())
        return staff_list, total

    @staticmethod
    def assign_staff(
        db: Session,
        data: StaffAssignmentCreate,
        actor: User,
        request: Optional[Request] = None,
    ) -> StaffAssignment:
        staff = db.execute(select(Staff).where(Staff.id == data.staff_id)).scalar_one_or_none()
        if not staff:
            raise AppError(message="Staff record not found.", status_code=404, error_code="STAFF_NOT_FOUND")

        # Business Rule: Do not allow an inactive staff member to receive new assignments.
        if not staff.is_active:
            raise AppError(
                message="Cannot assign inactive staff member to a class or subject.",
                status_code=400,
                error_code="INACTIVE_STAFF_ASSIGNMENT",
            )

        # Check duplicate assignment
        existing = db.execute(
            select(StaffAssignment).where(
                StaffAssignment.staff_id == data.staff_id,
                StaffAssignment.class_id == data.class_id,
                StaffAssignment.section_id == data.section_id,
                StaffAssignment.subject_id == data.subject_id,
                StaffAssignment.academic_year_id == data.academic_year_id,
            )
        ).scalar_one_or_none()
        if existing:
            raise AppError(
                message="This teacher is already assigned to this class, section, and subject for the academic year.",
                status_code=409,
                error_code="ASSIGNMENT_EXISTS",
            )

        assignment = StaffAssignment(
            id=uuid.uuid4(),
            staff_id=data.staff_id,
            class_id=data.class_id,
            section_id=data.section_id,
            subject_id=data.subject_id,
            academic_year_id=data.academic_year_id,
            is_primary_teacher=data.is_primary_teacher,
            is_active=True,
        )
        db.add(assignment)

        record_audit(
            db=db,
            action="STAFF_ASSIGNED",
            entity_name="staff_assignments",
            record_id=str(assignment.id),
            actor_user_id=actor.id,
            new_values={"staff_id": str(staff.id), "class_id": str(data.class_id)},
            request=request,
        )
        db.commit()
        db.refresh(assignment)
        return assignment
