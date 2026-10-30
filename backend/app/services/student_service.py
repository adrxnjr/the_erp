import uuid
from datetime import datetime, timezone
from typing import List, Optional, Tuple
from fastapi import Request, status
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session, selectinload

from app.core.exceptions import AppError
from app.core.security import hash_password
from app.models.academic import AcademicYear, ClassRoom, Section
from app.models.student import (
    Enquiry,
    Guardian,
    Student,
    StudentGuardian,
    StudentStatusHistory,
)
from app.models.user import Role, User, UserRole
from app.schemas.student import (
    EnquiryConvertRequest,
    EnquiryCreate,
    EnquiryUpdate,
    GuardianCreate,
    StudentCreate,
    StudentGuardianLinkRequest,
    StudentStatusChangeRequest,
    StudentUpdate,
)
from app.services.audit_service import record_audit

VALID_STATUSES = {"enquiry", "applied", "admitted", "active", "transferred", "graduated", "withdrawn"}


class StudentService:
    # --- Enquiries ---
    @staticmethod
    def create_enquiry(db: Session, data: EnquiryCreate) -> Enquiry:
        count = db.execute(select(func.count(Enquiry.id))).scalar() or 0
        enquiry_number = f"ENQ-{datetime.now(timezone.utc).year}-{count + 1:04d}"

        enquiry = Enquiry(
            id=uuid.uuid4(),
            enquiry_number=enquiry_number,
            student_name=data.student_name,
            date_of_birth=data.date_of_birth,
            gender=data.gender,
            grade_applying_for=data.grade_applying_for,
            parent_name=data.parent_name,
            parent_phone=data.parent_phone,
            parent_email=str(data.parent_email) if data.parent_email else None,
            address=data.address,
            status="submitted",
            notes=data.notes,
        )
        db.add(enquiry)
        db.commit()
        db.refresh(enquiry)
        return enquiry

    @staticmethod
    def list_enquiries(db: Session, status_filter: Optional[str] = None) -> List[Enquiry]:
        stmt = select(Enquiry).order_by(Enquiry.created_at.desc())
        if status_filter:
            stmt = stmt.where(Enquiry.status == status_filter)
        return list(db.execute(stmt).scalars().all())

    @staticmethod
    def convert_enquiry_to_student(
        db: Session,
        enquiry_id: uuid.UUID,
        data: EnquiryConvertRequest,
        actor: User,
        request: Optional[Request] = None,
    ) -> Student:
        enquiry = db.execute(select(Enquiry).where(Enquiry.id == enquiry_id)).scalar_one_or_none()
        if not enquiry:
            raise AppError(message="Enquiry record not found.", status_code=404, error_code="NOT_FOUND")

        if enquiry.status == "converted":
            raise AppError(message="Enquiry has already been converted into a student.", status_code=409, error_code="ALREADY_CONVERTED")

        # Verify admission number unique
        existing_student = db.execute(select(Student).where(Student.admission_number == data.admission_number)).scalar_one_or_none()
        if existing_student:
            raise AppError(message=f"Admission number '{data.admission_number}' already exists.", status_code=409, error_code="ADMISSION_NUMBER_EXISTS")

        student = Student(
            id=uuid.uuid4(),
            admission_number=data.admission_number,
            full_name=enquiry.student_name,
            date_of_birth=data.date_of_birth,
            gender=data.gender,
            class_id=data.class_id,
            section_id=data.section_id,
            academic_year_id=data.academic_year_id,
            admission_date=data.admission_date,
            address=enquiry.address,
            phone_number=enquiry.parent_phone,
            email=enquiry.parent_email,
            status="admitted",
        )
        db.add(student)
        db.flush()

        # Update enquiry status
        enquiry.status = "converted"

        # Record status history
        history = StudentStatusHistory(
            id=uuid.uuid4(),
            student_id=student.id,
            previous_status="enquiry",
            new_status="admitted",
            reason="Converted from enquiry record",
            changed_by_user_id=actor.id,
        )
        db.add(history)

        record_audit(
            db=db,
            action="ENQUIRY_CONVERTED_TO_STUDENT",
            entity_name="students",
            record_id=str(student.id),
            actor_user_id=actor.id,
            new_values={"enquiry_id": str(enquiry.id), "admission_number": student.admission_number},
            request=request,
        )
        db.commit()
        db.refresh(student)
        return student

    # --- Students ---
    @staticmethod
    def create_student(
        db: Session,
        data: StudentCreate,
        actor: User,
        request: Optional[Request] = None,
    ) -> Student:
        existing = db.execute(select(Student).where(Student.admission_number == data.admission_number)).scalar_one_or_none()
        if existing:
            raise AppError(message=f"Admission number '{data.admission_number}' is already registered.", status_code=409, error_code="ADMISSION_NUMBER_EXISTS")

        # Validate class & academic year
        cls = db.execute(select(ClassRoom).where(ClassRoom.id == data.class_id)).scalar_one_or_none()
        if not cls:
            raise AppError(message="Specified class does not exist.", status_code=404, error_code="CLASS_NOT_FOUND")

        year = db.execute(select(AcademicYear).where(AcademicYear.id == data.academic_year_id)).scalar_one_or_none()
        if not year:
            raise AppError(message="Specified academic year does not exist.", status_code=404, error_code="YEAR_NOT_FOUND")

        user_id = None
        if data.create_user_account:
            username = f"std_{data.admission_number.lower().replace('-', '_')}"
            student_role = db.execute(select(Role).where(Role.name == "student")).scalar_one_or_none()
            if student_role:
                student_user = User(
                    id=uuid.uuid4(),
                    username=username,
                    email=str(data.email) if data.email else None,
                    hashed_password=hash_password(f"Student@{data.admission_number}"),
                    full_name=data.full_name,
                    phone_number=data.phone_number,
                    portal_type="parent_student",
                    is_active=True,
                    must_change_password=True,
                )
                db.add(student_user)
                db.flush()
                ur = UserRole(id=uuid.uuid4(), user_id=student_user.id, role_id=student_role.id)
                db.add(ur)
                user_id = student_user.id

        student = Student(
            id=uuid.uuid4(),
            admission_number=data.admission_number,
            roll_number=data.roll_number,
            full_name=data.full_name,
            date_of_birth=data.date_of_birth,
            gender=data.gender,
            class_id=data.class_id,
            section_id=data.section_id,
            academic_year_id=data.academic_year_id,
            admission_date=data.admission_date,
            address=data.address,
            phone_number=data.phone_number,
            email=str(data.email) if data.email else None,
            status="active",
            user_id=user_id,
        )
        db.add(student)
        db.flush()

        history = StudentStatusHistory(
            id=uuid.uuid4(),
            student_id=student.id,
            previous_status="none",
            new_status="active",
            reason="Initial student admission enrollment",
            changed_by_user_id=actor.id,
        )
        db.add(history)

        record_audit(
            db=db,
            action="STUDENT_ENROLLED",
            entity_name="students",
            record_id=str(student.id),
            actor_user_id=actor.id,
            new_values={"admission_number": student.admission_number, "full_name": student.full_name},
            request=request,
        )
        db.commit()
        db.refresh(student)
        return student

    @staticmethod
    def list_students(
        db: Session,
        page: int = 1,
        page_size: int = 20,
        search: Optional[str] = None,
        class_id: Optional[uuid.UUID] = None,
        section_id: Optional[uuid.UUID] = None,
        status_filter: Optional[str] = None,
    ) -> Tuple[List[Student], int]:
        query = select(Student)

        if search:
            term = f"%{search.strip()}%"
            query = query.where(
                or_(
                    Student.full_name.ilike(term),
                    Student.admission_number.ilike(term),
                    Student.roll_number.ilike(term),
                )
            )

        if class_id:
            query = query.where(Student.class_id == class_id)
        if section_id:
            query = query.where(Student.section_id == section_id)
        if status_filter:
            query = query.where(Student.status == status_filter)

        count_query = select(func.count()).select_from(query.subquery())
        total = db.execute(count_query).scalar() or 0

        query = query.order_by(Student.admission_number).offset((page - 1) * page_size).limit(page_size)
        students = list(db.execute(query).scalars().all())
        return students, total

    @staticmethod
    def change_student_status(
        db: Session,
        student_id: uuid.UUID,
        data: StudentStatusChangeRequest,
        actor: User,
        request: Optional[Request] = None,
    ) -> Student:
        if data.new_status not in VALID_STATUSES:
            raise AppError(message=f"Invalid status '{data.new_status}'.", status_code=400, error_code="INVALID_STATUS")

        student = db.execute(select(Student).where(Student.id == student_id)).scalar_one_or_none()
        if not student:
            raise AppError(message="Student not found.", status_code=404, error_code="NOT_FOUND")

        prev = student.status
        student.status = data.new_status

        history = StudentStatusHistory(
            id=uuid.uuid4(),
            student_id=student.id,
            previous_status=prev,
            new_status=data.new_status,
            reason=data.reason,
            changed_by_user_id=actor.id,
        )
        db.add(history)

        record_audit(
            db=db,
            action="STUDENT_STATUS_CHANGED",
            entity_name="students",
            record_id=str(student.id),
            actor_user_id=actor.id,
            old_values={"status": prev},
            new_values={"status": data.new_status, "reason": data.reason},
            request=request,
        )
        db.commit()
        db.refresh(student)
        return student

    # --- Guardians ---
    @staticmethod
    def create_guardian(
        db: Session,
        data: GuardianCreate,
        actor: User,
        request: Optional[Request] = None,
    ) -> Guardian:
        user_id = None
        if data.create_user_account:
            parent_role = db.execute(select(Role).where(Role.name == "parent")).scalar_one_or_none()
            if parent_role:
                username = f"prt_{data.phone_number[-6:]}_{uuid.uuid4().hex[:4]}"
                parent_user = User(
                    id=uuid.uuid4(),
                    username=username,
                    email=str(data.email) if data.email else None,
                    hashed_password=hash_password(f"Parent@{data.phone_number[-4:]}"),
                    full_name=data.full_name,
                    phone_number=data.phone_number,
                    portal_type="parent_student",
                    is_active=True,
                    must_change_password=True,
                )
                db.add(parent_user)
                db.flush()
                ur = UserRole(id=uuid.uuid4(), user_id=parent_user.id, role_id=parent_role.id)
                db.add(ur)
                user_id = parent_user.id

        guardian = Guardian(
            id=uuid.uuid4(),
            full_name=data.full_name,
            relationship_type=data.relationship_type,
            phone_number=data.phone_number,
            email=str(data.email) if data.email else None,
            occupation=data.occupation,
            address=data.address,
            is_emergency_contact=data.is_emergency_contact,
            user_id=user_id,
        )
        db.add(guardian)
        db.commit()
        db.refresh(guardian)
        return guardian

    @staticmethod
    def link_guardian(db: Session, student_id: uuid.UUID, data: StudentGuardianLinkRequest) -> StudentGuardian:
        existing = db.execute(
            select(StudentGuardian).where(
                StudentGuardian.student_id == student_id,
                StudentGuardian.guardian_id == data.guardian_id,
            )
        ).scalar_one_or_none()
        if existing:
            raise AppError(message="Guardian already linked to this student.", status_code=409, error_code="ALREADY_LINKED")

        link = StudentGuardian(
            id=uuid.uuid4(),
            student_id=student_id,
            guardian_id=data.guardian_id,
            is_primary=data.is_primary,
            can_pickup=data.can_pickup,
        )
        db.add(link)
        db.commit()
        db.refresh(link)
        return link
