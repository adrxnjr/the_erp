import uuid
from typing import List, Optional, Any, Dict
from datetime import date
from sqlalchemy import Boolean, Date, ForeignKey, Index, Integer, String, Text, UniqueConstraint, text, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class AcademicYear(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Academic year configuration (e.g. 2026-2027).
    Enforces that exactly one academic year can be active at any time via a partial unique index.
    """
    __tablename__ = "academic_years"
    __table_args__ = (
        Index(
            "uq_academic_years_single_active",
            "is_active",
            unique=True,
            postgresql_where=text("is_active = true"),
        ),
    )

    name: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date] = mapped_column(Date, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_closed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Relationships
    holidays: Mapped[List["Holiday"]] = relationship(
        "Holiday", back_populates="academic_year"
    )

    def __repr__(self) -> str:
        return f"<AcademicYear {self.name} (active={self.is_active})>"


class ClassRoom(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Class / Grade level definition (e.g., Grade 1, Grade 10).
    """
    __tablename__ = "classes"

    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    level: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Relationships
    sections: Mapped[List["Section"]] = relationship(
        "Section", back_populates="class_room", cascade="all, delete-orphan"
    )
    class_subjects: Mapped[List["ClassSubject"]] = relationship(
        "ClassSubject", back_populates="class_room", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<ClassRoom {self.name}>"


class Section(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Class section division (e.g., Section A, Section B).
    """
    __tablename__ = "sections"
    __table_args__ = (
        UniqueConstraint("class_id", "name", name="uq_sections_class_id_name"),
    )

    class_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("classes.id", ondelete="CASCADE"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(50), nullable=False)
    room_number: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    capacity: Mapped[int] = mapped_column(Integer, default=40, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Relationships
    class_room: Mapped["ClassRoom"] = relationship("ClassRoom", back_populates="sections")

    def __repr__(self) -> str:
        return f"<Section {self.name} (Class {self.class_id})>"


class Subject(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Academic subject offering (e.g., Mathematics, English Literature).
    """
    __tablename__ = "subjects"

    name: Mapped[str] = mapped_column(String(100), nullable=False)
    code: Mapped[str] = mapped_column(String(30), unique=True, index=True, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Relationships
    class_subjects: Mapped[List["ClassSubject"]] = relationship(
        "ClassSubject", back_populates="subject", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Subject {self.code} - {self.name}>"


class ClassSubject(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Mapping between classes and their curriculum subjects.
    """
    __tablename__ = "class_subjects"
    __table_args__ = (
        UniqueConstraint("class_id", "subject_id", name="uq_class_subjects_class_id_subject_id"),
    )

    class_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("classes.id", ondelete="CASCADE"), nullable=False, index=True
    )
    subject_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False, index=True
    )
    is_elective: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Relationships
    class_room: Mapped["ClassRoom"] = relationship("ClassRoom", back_populates="class_subjects")
    subject: Mapped["Subject"] = relationship("Subject", back_populates="class_subjects")

    def __repr__(self) -> str:
        return f"<ClassSubject class={self.class_id} subject={self.subject_id}>"


class Holiday(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    School calendar holiday definition.
    """
    __tablename__ = "holidays"

    academic_year_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("academic_years.id", ondelete="SET NULL"), nullable=True, index=True
    )
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date] = mapped_column(Date, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    # Relationships
    academic_year: Mapped[Optional["AcademicYear"]] = relationship(
        "AcademicYear", back_populates="holidays"
    )

    def __repr__(self) -> str:
        return f"<Holiday {self.name} ({self.start_date} to {self.end_date})>"


class Syllabus(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Curriculum syllabus and course learning units governed exclusively by Wing Coordinators.
    """
    __tablename__ = "syllabi"

    subject_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("subjects.id", ondelete="CASCADE"), nullable=True, index=True
    )
    subject_name: Mapped[str] = mapped_column(String(100), nullable=False)
    subject_code: Mapped[str] = mapped_column(String(30), nullable=False)
    wing_name: Mapped[str] = mapped_column(String(100), nullable=False)  # Primary Wing (Grades 1-5), Middle School Wing (Grades 6-9), Senior Secondary Wing (Grades 10-12)
    grade_range: Mapped[str] = mapped_column(String(100), default="Grades 1-5", nullable=False)
    academic_year: Mapped[str] = mapped_column(String(50), default="2026-2027", nullable=False)
    total_units: Mapped[int] = mapped_column(Integer, default=6, nullable=False)
    total_hours: Mapped[int] = mapped_column(Integer, default=120, nullable=False)
    overview: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    units: Mapped[Optional[Any]] = mapped_column(JSON, default=list, nullable=True)
    textbooks: Mapped[Optional[Any]] = mapped_column(JSON, default=list, nullable=True)
    learning_outcomes: Mapped[Optional[Any]] = mapped_column(JSON, default=list, nullable=True)
    coordinator_name: Mapped[str] = mapped_column(String(150), default="Academic Coordinator", nullable=False)
    coordinator_user_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    status: Mapped[str] = mapped_column(String(50), default="Approved & Published", nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": str(self.id),
            "subject_id": str(self.subject_id) if self.subject_id else None,
            "subject_name": self.subject_name,
            "subject_code": self.subject_code,
            "wing_name": self.wing_name,
            "grade_range": self.grade_range,
            "academic_year": self.academic_year,
            "total_units": self.total_units,
            "total_hours": self.total_hours,
            "overview": self.overview or "",
            "units": self.units or [],
            "textbooks": self.textbooks or [],
            "learning_outcomes": self.learning_outcomes or [],
            "coordinator_name": self.coordinator_name,
            "coordinator_user_id": str(self.coordinator_user_id) if self.coordinator_user_id else None,
            "status": self.status,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

