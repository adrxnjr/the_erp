import uuid
from datetime import date
from app.db.base import Base
from app.models.academic import AcademicYear, ClassRoom, Section, Subject, ClassSubject, Holiday
from app.models.audit import AuditLog
from app.models.user import Role, User, UserRole


def test_base_metadata_contains_foundational_tables():
    """Verify all foundational tables are registered in Base.metadata."""
    table_names = set(Base.metadata.tables.keys())
    expected_tables = {
        "roles",
        "users",
        "user_roles",
        "academic_years",
        "classes",
        "sections",
        "subjects",
        "class_subjects",
        "holidays",
        "audit_logs",
    }
    assert expected_tables.issubset(table_names)


def test_model_instantiation():
    """Verify model instances can be created with required fields."""
    role = Role(name="teacher", description="Teaching staff", is_active=True)
    assert role.name == "teacher"
    assert role.is_active is True

    user = User(
        username="admin",
        hashed_password="hashed_pw_placeholder",
        full_name="System Administrator",
        portal_type="staff",
        is_active=True,
        is_locked=False,
    )
    assert user.username == "admin"
    assert user.is_active is True
    assert user.is_locked is False

    academic_year = AcademicYear(
        name="2026-2027",
        start_date=date(2026, 6, 1),
        end_date=date(2027, 4, 30),
        is_active=True,
    )
    assert academic_year.name == "2026-2027"

    cls = ClassRoom(name="Grade 10", level=10)
    assert cls.name == "Grade 10"

    sub = Subject(name="Mathematics", code="MATH10")
    assert sub.code == "MATH10"
