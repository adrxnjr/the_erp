import uuid
from typing import List, Optional
from sqlalchemy import select, update
from sqlalchemy.orm import Session

from app.core.exceptions import AppError
from app.models.academic import (
    AcademicYear,
    ClassRoom,
    ClassSubject,
    Holiday,
    Section,
    Subject,
)
from app.schemas.academic import (
    AcademicYearCreate,
    AcademicYearUpdate,
    ClassCreate,
    ClassSubjectCreate,
    ClassUpdate,
    HolidayCreate,
    HolidayUpdate,
    SectionCreate,
    SectionUpdate,
    SubjectCreate,
    SubjectUpdate,
)


class AcademicService:
    # --- Academic Years ---
    @staticmethod
    def list_academic_years(db: Session) -> List[AcademicYear]:
        stmt = select(AcademicYear).order_by(AcademicYear.start_date.desc())
        return list(db.execute(stmt).scalars().all())

    @staticmethod
    def create_academic_year(db: Session, data: AcademicYearCreate) -> AcademicYear:
        # Check duplicate name
        existing = db.execute(select(AcademicYear).where(AcademicYear.name == data.name)).scalar_one_or_none()
        if existing:
            raise AppError(
                message=f"Academic year '{data.name}' already exists.",
                status_code=409,
                error_code="ACADEMIC_YEAR_EXISTS",
            )

        if data.start_date >= data.end_date:
            raise AppError(
                message="Start date must be before end date.",
                status_code=400,
                error_code="INVALID_DATE_RANGE",
            )

        # If activating this new year, deactivate others to maintain invariant
        if data.is_active:
            db.execute(update(AcademicYear).values(is_active=False))

        year = AcademicYear(
            id=uuid.uuid4(),
            name=data.name,
            start_date=data.start_date,
            end_date=data.end_date,
            is_active=data.is_active,
            is_closed=False,
        )
        db.add(year)
        db.commit()
        db.refresh(year)
        return year

    @staticmethod
    def activate_academic_year(db: Session, year_id: uuid.UUID) -> AcademicYear:
        year = db.execute(select(AcademicYear).where(AcademicYear.id == year_id)).scalar_one_or_none()
        if not year:
            raise AppError(message="Academic year not found.", status_code=404, error_code="NOT_FOUND")

        # Deactivate all others
        db.execute(update(AcademicYear).values(is_active=False))
        year.is_active = True
        year.is_closed = False
        db.commit()
        db.refresh(year)
        return year

    @staticmethod
    def update_academic_year(db: Session, year_id: uuid.UUID, data: AcademicYearUpdate) -> AcademicYear:
        year = db.execute(select(AcademicYear).where(AcademicYear.id == year_id)).scalar_one_or_none()
        if not year:
            raise AppError(message="Academic year not found.", status_code=404, error_code="NOT_FOUND")

        if data.name is not None:
            year.name = data.name
        if data.start_date is not None:
            year.start_date = data.start_date
        if data.end_date is not None:
            year.end_date = data.end_date
        if data.is_active is True:
            db.execute(update(AcademicYear).where(AcademicYear.id != year_id).values(is_active=False))
            year.is_active = True
        elif data.is_active is False:
            year.is_active = False
        if data.is_closed is not None:
            year.is_closed = data.is_closed

        db.commit()
        db.refresh(year)
        return year

    # --- Classes ---
    @staticmethod
    def list_classes(db: Session) -> List[ClassRoom]:
        return list(db.execute(select(ClassRoom).order_by(ClassRoom.level, ClassRoom.name)).scalars().all())

    @staticmethod
    def create_class(db: Session, data: ClassCreate) -> ClassRoom:
        existing = db.execute(select(ClassRoom).where(ClassRoom.name == data.name)).scalar_one_or_none()
        if existing:
            raise AppError(message=f"Class '{data.name}' already exists.", status_code=409, error_code="CLASS_EXISTS")

        class_room = ClassRoom(
            id=uuid.uuid4(),
            name=data.name,
            level=data.level,
            description=data.description,
            is_active=True,
        )
        db.add(class_room)
        db.commit()
        db.refresh(class_room)
        return class_room

    # --- Sections ---
    @staticmethod
    def list_sections(db: Session, class_id: Optional[uuid.UUID] = None) -> List[Section]:
        stmt = select(Section)
        if class_id:
            stmt = stmt.where(Section.class_id == class_id)
        return list(db.execute(stmt.order_by(Section.name)).scalars().all())

    @staticmethod
    def create_section(db: Session, data: SectionCreate) -> Section:
        # Verify parent class exists
        parent_class = db.execute(select(ClassRoom).where(ClassRoom.id == data.class_id)).scalar_one_or_none()
        if not parent_class:
            raise AppError(message="Parent class not found.", status_code=404, error_code="CLASS_NOT_FOUND")

        # Prevent duplicate section in same class
        existing = db.execute(
            select(Section).where(Section.class_id == data.class_id, Section.name == data.name)
        ).scalar_one_or_none()
        if existing:
            raise AppError(
                message=f"Section '{data.name}' already exists in class '{parent_class.name}'.",
                status_code=409,
                error_code="SECTION_EXISTS",
            )

        section = Section(
            id=uuid.uuid4(),
            class_id=data.class_id,
            name=data.name,
            room_number=data.room_number,
            capacity=data.capacity,
            is_active=True,
        )
        db.add(section)
        db.commit()
        db.refresh(section)
        return section

    # --- Subjects ---
    @staticmethod
    def list_subjects(db: Session) -> List[Subject]:
        return list(db.execute(select(Subject).order_by(Subject.name)).scalars().all())

    @staticmethod
    def create_subject(db: Session, data: SubjectCreate) -> Subject:
        existing = db.execute(select(Subject).where(Subject.code == data.code)).scalar_one_or_none()
        if existing:
            raise AppError(
                message=f"Subject with code '{data.code}' already exists.",
                status_code=409,
                error_code="SUBJECT_CODE_EXISTS",
            )

        subject = Subject(
            id=uuid.uuid4(),
            name=data.name,
            code=data.code,
            description=data.description,
            is_active=True,
        )
        db.add(subject)
        db.commit()
        db.refresh(subject)
        return subject

    # --- Class-Subject Mapping ---
    @staticmethod
    def map_class_subject(db: Session, data: ClassSubjectCreate) -> ClassSubject:
        existing = db.execute(
            select(ClassSubject).where(
                ClassSubject.class_id == data.class_id,
                ClassSubject.subject_id == data.subject_id,
            )
        ).scalar_one_or_none()
        if existing:
            raise AppError(
                message="This subject is already mapped to the specified class.",
                status_code=409,
                error_code="CLASS_SUBJECT_MAPPING_EXISTS",
            )

        mapping = ClassSubject(
            id=uuid.uuid4(),
            class_id=data.class_id,
            subject_id=data.subject_id,
            is_elective=data.is_elective,
            is_active=True,
        )
        db.add(mapping)
        db.commit()
        db.refresh(mapping)
        return mapping

    # --- Holidays ---
    @staticmethod
    def list_holidays(db: Session, academic_year_id: Optional[uuid.UUID] = None) -> List[Holiday]:
        stmt = select(Holiday)
        if academic_year_id:
            stmt = stmt.where(Holiday.academic_year_id == academic_year_id)
        return list(db.execute(stmt.order_by(Holiday.start_date)).scalars().all())

    @staticmethod
    def create_holiday(db: Session, data: HolidayCreate) -> Holiday:
        if data.start_date > data.end_date:
            raise AppError(message="Start date cannot be after end date.", status_code=400, error_code="INVALID_DATES")

        holiday = Holiday(
            id=uuid.uuid4(),
            academic_year_id=data.academic_year_id,
            name=data.name,
            start_date=data.start_date,
            end_date=data.end_date,
            description=data.description,
        )
        db.add(holiday)
        db.commit()
        db.refresh(holiday)
        return holiday
