import uuid
from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.exceptions import AppError
from app.models.timetable import Period, Substitution, TimetableEntry
from app.schemas.timetable import (
    PeriodCreate,
    SubstitutionCreate,
    TimetableEntryCreate,
)


class TimetableService:
    # --- Periods ---
    @staticmethod
    def create_period(db: Session, data: PeriodCreate) -> Period:
        existing = db.execute(select(Period).where(Period.period_number == data.period_number)).scalar_one_or_none()
        if existing:
            raise AppError(
                message=f"Period number '{data.period_number}' already configured.",
                status_code=409,
                error_code="PERIOD_EXISTS",
            )
        if data.start_time >= data.end_time:
            raise AppError(message="Start time must be before end time.", status_code=400, error_code="INVALID_TIME_RANGE")

        period = Period(
            id=uuid.uuid4(),
            name=data.name,
            period_number=data.period_number,
            start_time=data.start_time,
            end_time=data.end_time,
            is_break=data.is_break,
        )
        db.add(period)
        db.commit()
        db.refresh(period)
        return period

    @staticmethod
    def list_periods(db: Session) -> List[Period]:
        return list(db.execute(select(Period).order_by(Period.period_number)).scalars().all())

    # --- Timetable Entries with Clash Detection ---
    @staticmethod
    def create_timetable_entry(db: Session, data: TimetableEntryCreate) -> TimetableEntry:
        # 1. Teacher Clash Check
        teacher_clash = db.execute(
            select(TimetableEntry).where(
                TimetableEntry.academic_year_id == data.academic_year_id,
                TimetableEntry.teacher_staff_id == data.teacher_staff_id,
                TimetableEntry.day_of_week == data.day_of_week,
                TimetableEntry.period_id == data.period_id,
            )
        ).scalar_one_or_none()
        if teacher_clash:
            raise AppError(
                message="Teacher scheduling conflict: Teacher is already scheduled for another class in this time slot.",
                status_code=409,
                error_code="TEACHER_TIMETABLE_CLASH",
            )

        # 2. Section Clash Check
        section_clash = db.execute(
            select(TimetableEntry).where(
                TimetableEntry.academic_year_id == data.academic_year_id,
                TimetableEntry.class_id == data.class_id,
                TimetableEntry.section_id == data.section_id,
                TimetableEntry.day_of_week == data.day_of_week,
                TimetableEntry.period_id == data.period_id,
            )
        ).scalar_one_or_none()
        if section_clash:
            raise AppError(
                message="Section scheduling conflict: Class section already has a scheduled period in this slot.",
                status_code=409,
                error_code="SECTION_TIMETABLE_CLASH",
            )

        # 3. Room Clash Check
        if data.room_number:
            room_clash = db.execute(
                select(TimetableEntry).where(
                    TimetableEntry.academic_year_id == data.academic_year_id,
                    TimetableEntry.room_number == data.room_number,
                    TimetableEntry.day_of_week == data.day_of_week,
                    TimetableEntry.period_id == data.period_id,
                )
            ).scalar_one_or_none()
            if room_clash:
                raise AppError(
                    message=f"Room scheduling conflict: Room '{data.room_number}' is already booked in this slot.",
                    status_code=409,
                    error_code="ROOM_TIMETABLE_CLASH",
                )

        entry = TimetableEntry(
            id=uuid.uuid4(),
            academic_year_id=data.academic_year_id,
            class_id=data.class_id,
            section_id=data.section_id,
            subject_id=data.subject_id,
            teacher_staff_id=data.teacher_staff_id,
            period_id=data.period_id,
            day_of_week=data.day_of_week,
            room_number=data.room_number,
        )
        db.add(entry)
        db.commit()
        db.refresh(entry)
        return entry

    @staticmethod
    def list_entries_for_section(
        db: Session,
        class_id: uuid.UUID,
        section_id: uuid.UUID,
        academic_year_id: uuid.UUID,
    ) -> List[TimetableEntry]:
        stmt = (
            select(TimetableEntry)
            .where(
                TimetableEntry.class_id == class_id,
                TimetableEntry.section_id == section_id,
                TimetableEntry.academic_year_id == academic_year_id,
            )
            .order_by(TimetableEntry.day_of_week)
        )
        return list(db.execute(stmt).scalars().all())

    # --- Substitutions ---
    @staticmethod
    def assign_substitution(db: Session, data: SubstitutionCreate) -> Substitution:
        entry = db.execute(
            select(TimetableEntry).where(TimetableEntry.id == data.timetable_entry_id)
        ).scalar_one_or_none()
        if not entry:
            raise AppError(message="Timetable entry not found.", status_code=404, error_code="NOT_FOUND")

        sub = Substitution(
            id=uuid.uuid4(),
            timetable_entry_id=data.timetable_entry_id,
            original_staff_id=entry.teacher_staff_id,
            substitute_staff_id=data.substitute_staff_id,
            substitution_date=data.substitution_date,
            reason=data.reason,
            status="assigned",
        )
        db.add(sub)
        db.commit()
        db.refresh(sub)
        return sub
