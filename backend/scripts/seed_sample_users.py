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

from sqlalchemy import select, delete
from app.db.base import Base
from app.db.session import engine, SessionLocal
from app.core.security import hash_password
from app.models.user import Role, User, UserRole
from app.models.academic import AcademicYear, ClassRoom, Section, Subject
from app.models.student import Student, Guardian, StudentGuardian
from app.models.staff import Staff, StaffAssignment
from app.models.finance import FeeHead, StudentFee

PASSWORD_HASH = hash_password("123")

STAFF_DATA = [
    {
        "username": "staff1",
        "full_name": "Dr. Robert Taylor",
        "email": "staff1@evergrowschools.edu",
        "designation": "Principal",
        "department": "Administration",
        "role": "principal",
        "staff_type": "teaching",
        "employee_id": "EMP-0001",
        "phone": "9811000001",
    },
    {
        "username": "staff2",
        "full_name": "Sarah Jenkins",
        "email": "staff2@evergrowschools.edu",
        "designation": "School Administrator",
        "department": "Office Administration",
        "role": "school_admin",
        "staff_type": "non_teaching",
        "employee_id": "EMP-0002",
        "phone": "9811000002",
    },
    {
        "username": "staff3",
        "full_name": "Michael Chang",
        "email": "staff3@evergrowschools.edu",
        "designation": "Senior Mathematics Teacher",
        "department": "Mathematics",
        "role": "teacher",
        "staff_type": "teaching",
        "employee_id": "EMP-0003",
        "phone": "9811000003",
    },
    {
        "username": "staff4",
        "full_name": "Emily Davis",
        "email": "staff4@evergrowschools.edu",
        "designation": "Science & Biology Teacher",
        "department": "Science",
        "role": "teacher",
        "staff_type": "teaching",
        "employee_id": "EMP-0004",
        "phone": "9811000004",
    },
    {
        "username": "staff5",
        "full_name": "David Miller",
        "email": "staff5@evergrowschools.edu",
        "designation": "Head Accountant",
        "department": "Accounts & Finance",
        "role": "accountant",
        "staff_type": "non_teaching",
        "employee_id": "EMP-0005",
        "phone": "9811000005",
    },
]

STUDENT_DATA = [
    {"username": "student1", "full_name": "Liam Smith", "gender": "male", "grade": 1, "sec": "A", "dob": date(2019, 3, 14), "adm": "ADM-2026-0001", "roll": "01"},
    {"username": "student2", "full_name": "Emma Smith", "gender": "female", "grade": 1, "sec": "B", "dob": date(2019, 7, 22), "adm": "ADM-2026-0002", "roll": "02"},
    {"username": "student3", "full_name": "Noah Williams", "gender": "male", "grade": 2, "sec": "A", "dob": date(2018, 5, 10), "adm": "ADM-2026-0003", "roll": "01"},
    {"username": "student4", "full_name": "Olivia Williams", "gender": "female", "grade": 2, "sec": "B", "dob": date(2018, 11, 4), "adm": "ADM-2026-0004", "roll": "02"},
    {"username": "student5", "full_name": "James Jones", "gender": "male", "grade": 3, "sec": "A", "dob": date(2017, 2, 19), "adm": "ADM-2026-0005", "roll": "01"},
    {"username": "student6", "full_name": "Sophia Jones", "gender": "female", "grade": 3, "sec": "B", "dob": date(2017, 9, 30), "adm": "ADM-2026-0006", "roll": "02"},
    {"username": "student7", "full_name": "Lucas Miller", "gender": "male", "grade": 4, "sec": "A", "dob": date(2016, 4, 15), "adm": "ADM-2026-0007", "roll": "01"},
    {"username": "student8", "full_name": "Ava Miller", "gender": "female", "grade": 4, "sec": "B", "dob": date(2016, 8, 25), "adm": "ADM-2026-0008", "roll": "02"},
    {"username": "student9", "full_name": "Ethan Rodriguez", "gender": "male", "grade": 5, "sec": "A", "dob": date(2015, 6, 18), "adm": "ADM-2026-0009", "roll": "01"},
    {"username": "student10", "full_name": "Mia Rodriguez", "gender": "female", "grade": 5, "sec": "B", "dob": date(2015, 12, 5), "adm": "ADM-2026-0010", "roll": "02"},
]

PARENT_DATA = [
    {"username": "parent1", "full_name": "William Smith", "phone": "9822000001", "email": "parent1@evergrowschools.edu", "children": ["student1", "student2"]},
    {"username": "parent2", "full_name": "George Williams", "phone": "9822000002", "email": "parent2@evergrowschools.edu", "children": ["student3", "student4"]},
    {"username": "parent3", "full_name": "Daniel Jones", "phone": "9822000003", "email": "parent3@evergrowschools.edu", "children": ["student5", "student6"]},
    {"username": "parent4", "full_name": "Christopher Miller", "phone": "9822000004", "email": "parent4@evergrowschools.edu", "children": ["student7", "student8"]},
    {"username": "parent5", "full_name": "Joseph Rodriguez", "phone": "9822000005", "email": "parent5@evergrowschools.edu", "children": ["student9", "student10"]},
]

def seed_sample_users():
    print("Starting sample user seeding (5 Staff, 10 Students, 5 Parents)...")
    db = SessionLocal()
    try:
        # Load Roles
        roles = {r.name: r for r in db.execute(select(Role)).scalars().all()}
        ay = db.execute(select(AcademicYear).where(AcademicYear.is_active == True)).scalar_one_or_none()
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

        # Fee Head
        fee_head = db.execute(select(FeeHead)).scalars().first()
        if not fee_head:
            fee_head = FeeHead(
                id=uuid.uuid4(),
                name="Tuition Fee",
                code="TUIT26",
                description="Annual curriculum tuition",
            )
            db.add(fee_head)
            db.flush()

        # Classes cache
        classes = {}
        sections = {}
        for level in range(1, 11):
            name = f"Grade {level}"
            cls = db.execute(select(ClassRoom).where(ClassRoom.name == name)).scalar_one_or_none()
            if not cls:
                cls = ClassRoom(id=uuid.uuid4(), name=name, level=level, is_active=True)
                db.add(cls)
                db.flush()
                for sec_name in ["A", "B"]:
                    sec = Section(id=uuid.uuid4(), class_id=cls.id, name=sec_name, capacity=35)
                    db.add(sec)
                db.flush()
            classes[level] = cls
            sec_a = db.execute(select(Section).where(Section.class_id == cls.id, Section.name == "A")).scalar_one_or_none()
            sec_b = db.execute(select(Section).where(Section.class_id == cls.id, Section.name == "B")).scalar_one_or_none()
            sections[(level, "A")] = sec_a
            sections[(level, "B")] = sec_b

        # 1. SEED 5 STAFF MEMBERS
        print("\n--- Seeding 5 Staff Members (staff1 to staff5) ---")
        for s_info in STAFF_DATA:
            user = db.execute(select(User).where(User.username == s_info["username"])).scalar_one_or_none()
            if not user:
                user = User(
                    id=uuid.uuid4(),
                    username=s_info["username"],
                    email=s_info["email"],
                    hashed_password=PASSWORD_HASH,
                    full_name=s_info["full_name"],
                    portal_type="staff",
                    is_active=True,
                )
                db.add(user)
                db.flush()
                db.add(UserRole(id=uuid.uuid4(), user_id=user.id, role_id=roles[s_info["role"]].id))

            staff = db.execute(select(Staff).where(Staff.employee_id == s_info["employee_id"])).scalar_one_or_none()
            if not staff:
                staff = Staff(
                    id=uuid.uuid4(),
                    employee_id=s_info["employee_id"],
                    full_name=s_info["full_name"],
                    email=s_info["email"],
                    phone_number=s_info["phone"],
                    designation=s_info["designation"],
                    department=s_info["department"],
                    staff_type=s_info["staff_type"],
                    joining_date=date(2024, 6, 1),
                    is_active=True,
                    user_id=user.id,
                )
                db.add(staff)
                db.flush()
            print(f"[OK] Staff created: {s_info['username']} ({s_info['full_name']} - {s_info['designation']})")

        # 2. SEED 10 STUDENTS
        print("\n--- Seeding 10 Students (student1 to student10) ---")
        student_obj_map = {}
        for st_info in STUDENT_DATA:
            user = db.execute(select(User).where(User.username == st_info["username"])).scalar_one_or_none()
            if not user:
                user = User(
                    id=uuid.uuid4(),
                    username=st_info["username"],
                    email=f"{st_info['username']}@evergrowschools.edu",
                    hashed_password=PASSWORD_HASH,
                    full_name=st_info["full_name"],
                    portal_type="student",
                    is_active=True,
                )
                db.add(user)
                db.flush()
                db.add(UserRole(id=uuid.uuid4(), user_id=user.id, role_id=roles["student"].id))

            cls = classes[st_info["grade"]]
            sec = sections[(st_info["grade"], st_info["sec"])]

            student = db.execute(select(Student).where(Student.admission_number == st_info["adm"])).scalar_one_or_none()
            if not student:
                student = Student(
                    id=uuid.uuid4(),
                    admission_number=st_info["adm"],
                    roll_number=st_info["roll"],
                    full_name=st_info["full_name"],
                    gender=st_info["gender"],
                    date_of_birth=st_info["dob"],
                    class_id=cls.id,
                    section_id=sec.id,
                    academic_year_id=ay.id,
                    admission_date=date(2026, 6, 15),
                    status="active",
                    user_id=user.id,
                )
                db.add(student)
                db.flush()

                # Seed student fee ledger
                student_fee = StudentFee(
                    id=uuid.uuid4(),
                    student_id=student.id,
                    academic_year_id=ay.id,
                    total_amount=Decimal("1200.00"),
                    discounted_amount=Decimal("0.00"),
                    paid_amount=Decimal("0.00"),
                    status="unpaid",
                )
                db.add(student_fee)
                db.flush()

            student_obj_map[st_info["username"]] = student
            print(f"[OK] Student created: {st_info['username']} ({st_info['full_name']} - Grade {st_info['grade']} Sec {st_info['sec']})")

        # 3. SEED 5 PARENTS
        print("\n--- Seeding 5 Parents (parent1 to parent5) ---")
        for p_info in PARENT_DATA:
            user = db.execute(select(User).where(User.username == p_info["username"])).scalar_one_or_none()
            if not user:
                user = User(
                    id=uuid.uuid4(),
                    username=p_info["username"],
                    email=p_info["email"],
                    hashed_password=PASSWORD_HASH,
                    full_name=f"{p_info['full_name']} (Parent)",
                    portal_type="parent",
                    is_active=True,
                )
                db.add(user)
                db.flush()
                db.add(UserRole(id=uuid.uuid4(), user_id=user.id, role_id=roles["parent"].id))

            guardian = db.execute(select(Guardian).where(Guardian.user_id == user.id)).scalar_one_or_none()
            if not guardian:
                guardian = Guardian(
                    id=uuid.uuid4(),
                    user_id=user.id,
                    full_name=p_info["full_name"],
                    relationship_type="father",
                    phone_number=p_info["phone"],
                    email=p_info["email"],
                )
                db.add(guardian)
                db.flush()

            # Link guardian to their 2 assigned children
            for child_username in p_info["children"]:
                child_student = student_obj_map[child_username]
                existing_link = db.execute(
                    select(StudentGuardian).where(
                        StudentGuardian.student_id == child_student.id,
                        StudentGuardian.guardian_id == guardian.id,
                    )
                ).scalar_one_or_none()

                if not existing_link:
                    db.add(
                        StudentGuardian(
                            id=uuid.uuid4(),
                            student_id=child_student.id,
                            guardian_id=guardian.id,
                            is_primary=True,
                        )
                    )
                    db.flush()
            print(f"[OK] Parent created: {p_info['username']} ({p_info['full_name']}) -> linked to {', '.join(p_info['children'])}")

        db.commit()
        print("\nAll 5 Staff, 10 Students, and 5 Parents have been successfully seeded!")
        print("Default password for all sample accounts: 123")

    except Exception as e:
        db.rollback()
        print(f"Error during seeding: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_sample_users()
