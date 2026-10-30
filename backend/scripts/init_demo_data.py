import os
import sys
import uuid
from datetime import date, time
from decimal import Decimal
from pathlib import Path

os.environ.setdefault("DISABLE_SQLALCHEMY_CEXT", "1")
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from sqlalchemy import select
from app.db.base import Base
from app.db.session import engine, SessionLocal
from app.core.security import hash_password
from app.models.user import Role, User, UserRole
from app.models.academic import AcademicYear, ClassRoom, Section, Subject, ClassSubject
from app.models.student import Student, Guardian, StudentGuardian
from app.models.staff import Staff, StaffAssignment
from app.models.timetable import Period
from app.models.examination import ExamType, Exam, GradeScale
from app.models.finance import FeeHead, FeeStructure, StudentFee

ROLES = [
    ("super_admin", "System Administrator with full organizational oversight"),
    ("principal", "School Principal"),
    ("school_admin", "School Office Administrator"),
    ("teacher", "Teaching Staff"),
    ("accountant", "Accounts & Finance Staff"),
    ("parent", "Parent / Legal Guardian"),
    ("student", "Enrolled Student"),
]

def init_demo():
    print("Creating all tables in database if not exist...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # 1. Seed Roles
        role_map = {}
        for r_name, r_desc in ROLES:
            role = db.execute(select(Role).where(Role.name == r_name)).scalar_one_or_none()
            if not role:
                role = Role(id=uuid.uuid4(), name=r_name, description=r_desc, is_active=True)
                db.add(role)
                db.flush()
            role_map[r_name] = role
        print("[OK] Roles initialized")

        # 2. Super Admin User
        admin = db.execute(select(User).where(User.username == "superadmin_test")).scalar_one_or_none()
        if not admin:
            admin = User(
                id=uuid.uuid4(),
                username="superadmin_test",
                email="admin@evergrowschools.edu",
                hashed_password=hash_password("123"),
                full_name="Dr. Eleanor Vance (Super Admin)",
                portal_type="staff",
                is_active=True,
            )
            db.add(admin)
            db.flush()
            db.add(UserRole(id=uuid.uuid4(), user_id=admin.id, role_id=role_map["super_admin"].id))
            print("[OK] Super Admin created (user: superadmin_test / pass: 123)")

        # 3. Academic Year
        ay = db.execute(select(AcademicYear).where(AcademicYear.name == "2026-2027 Academic Session")).scalar_one_or_none()
        if not ay:
            ay = AcademicYear(
                id=uuid.uuid4(),
                name="2026-2027 Academic Session",
                start_date=date(2026, 6, 1),
                end_date=date(2027, 4, 30),
                is_active=True,
            )
            db.add(ay)
            db.flush()
            print("[OK] Active Academic Year created (2026-2027)")

        # 4. Classes & Sections
        classes = {}
        for level in range(1, 11):
            name = f"Grade {level}"
            cls = db.execute(select(ClassRoom).where(ClassRoom.name == name)).scalar_one_or_none()
            if not cls:
                cls = ClassRoom(id=uuid.uuid4(), name=name, level=level, is_active=True)
                db.add(cls)
                db.flush()
                # Add Sections A & B
                for sec_name in ["A", "B"]:
                    sec = Section(id=uuid.uuid4(), class_id=cls.id, name=sec_name, capacity=35)
                    db.add(sec)
                db.flush()
            classes[level] = cls
        print("[OK] Classes Grade 1 through 10 & Sections created")

        # 5. Subjects
        sub_list = [
            ("Mathematics", "MATH"),
            ("English Literature", "ENG"),
            ("General Science", "SCI"),
            ("Social Studies", "SOC"),
            ("Computer Science", "CS"),
        ]
        subjects = {}
        for s_name, s_code in sub_list:
            sub = db.execute(select(Subject).where(Subject.code == s_code)).scalar_one_or_none()
            if not sub:
                sub = Subject(id=uuid.uuid4(), name=s_name, code=s_code, is_active=True)
                db.add(sub)
                db.flush()
            subjects[s_code] = sub
        print("[OK] Curriculum subjects initialized")

        # 6. Periods
        p1 = db.execute(select(Period).where(Period.period_number == 1)).scalar_one_or_none()
        if not p1:
            periods = [
                ("Period 1", 1, time(9, 0), time(9, 45)),
                ("Period 2", 2, time(9, 50), time(10, 35)),
                ("Period 3", 3, time(10, 50), time(11, 35)),
                ("Period 4", 4, time(11, 40), time(12, 25)),
            ]
            for p_name, num, st, et in periods:
                p = Period(id=uuid.uuid4(), name=p_name, period_number=num, start_time=st, end_time=et)
                db.add(p)
            db.flush()
            print("[OK] Timetable periods created")

        # 7. Parent User & Linked Student
        parent_user = db.execute(select(User).where(User.username == "parent_doe")).scalar_one_or_none()
        if not parent_user:
            parent_user = User(
                id=uuid.uuid4(),
                username="parent_doe",
                email="doe_parent@example.com",
                hashed_password=hash_password("123"),
                full_name="John Doe (Parent)",
                portal_type="parent",
                is_active=True,
            )
            db.add(parent_user)
            db.flush()
            db.add(UserRole(id=uuid.uuid4(), user_id=parent_user.id, role_id=role_map["parent"].id))

            # Guardian record
            guardian = Guardian(
                id=uuid.uuid4(),
                user_id=parent_user.id,
                full_name="John Doe",
                relationship_type="father",
                phone_number="9876543210",
                email="doe_parent@example.com",
            )
            db.add(guardian)
            db.flush()

            # Enrolled Student
            g5 = classes[5]
            sec_a = db.execute(select(Section).where(Section.class_id == g5.id, Section.name == "A")).scalar_one()
            student = Student(
                id=uuid.uuid4(),
                admission_number="ADM-2026-0001",
                roll_number="01",
                full_name="Alice Doe",
                gender="female",
                date_of_birth=date(2015, 4, 12),
                class_id=g5.id,
                section_id=sec_a.id,
                academic_year_id=ay.id,
                admission_date=date(2026, 6, 15),
                status="active",
            )
            db.add(student)
            db.flush()

            db.add(StudentGuardian(
                id=uuid.uuid4(),
                student_id=student.id,
                guardian_id=guardian.id,
                is_primary=True,
            ))
            print("[OK] Parent & Student created (user: parent_doe / pass: 123)")

        # 8. Fee Head & Structure
        fh = db.execute(select(FeeHead).where(FeeHead.code == "TUIT26")).scalar_one_or_none()
        if not fh:
            fh = FeeHead(
                id=uuid.uuid4(),
                name="Annual Tuition Fee",
                code="TUIT26",
                description="Annual curriculum and laboratory tuition",
            )
            db.add(fh)
            db.flush()
            print("[OK] Fee Heads created")

        # 9. Exam Type & Grade Scales
        et = db.execute(select(ExamType).where(ExamType.name == "Mid-Term Examination")).scalar_one_or_none()
        if not et:
            et = ExamType(id=uuid.uuid4(), name="Mid-Term Examination", weightage=100.0)
            db.add(et)
            db.flush()

            scales = [
                ("A+", 90.0, 100.0, 10.0),
                ("A", 80.0, 89.99, 9.0),
                ("B", 70.0, 79.99, 8.0),
                ("C", 60.0, 69.99, 7.0),
                ("D", 40.0, 59.99, 5.0),
                ("F", 0.0, 39.99, 0.0),
            ]
            for g_name, min_p, max_p, gp in scales:
                gs = GradeScale(id=uuid.uuid4(), name=g_name, min_percentage=min_p, max_percentage=max_p, grade_point=gp)
                db.add(gs)
            db.flush()
            print("[OK] Exam types and Grade Scales initialized")

        db.commit()
        print("\nAll demo records successfully seeded!")
    except Exception as e:
        db.rollback()
        print(f"Error during seeding: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    init_demo()
