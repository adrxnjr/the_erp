import os
import sys
import uuid
from datetime import date
from decimal import Decimal
from pathlib import Path

os.environ.setdefault("DISABLE_SQLALCHEMY_CEXT", "1")
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from sqlalchemy import select
from app.db.session import SessionLocal
from app.core.security import hash_password
from app.models.user import Role, User, UserRole
from app.models.academic import AcademicYear, ClassRoom, Section
from app.models.student import Student, Guardian, StudentGuardian
from app.models.staff import Staff
from app.models.finance import FeeHead, StudentFee

COMMON_DEMO_PASSWORD = "123"
PASSWORD_HASH = hash_password(COMMON_DEMO_PASSWORD)

# 4 Teachers + Principal + Accountant + Super Admin demo accounts
# Teachers: Phone numbers 6666666666–9999999999
TEACHER_STAFF_DATA = [
    {
        "username": "teacher1",
        "alt_username": "staff3",
        "full_name": "Michael Chang",
        "email": "teacher1@evergrowschools.edu",
        "designation": "Senior Mathematics Teacher",
        "department": "Mathematics",
        "role": "teacher",
        "staff_type": "teaching",
        "employee_id": "EMP-T01",
        "phone": "6666666666",
    },
    {
        "username": "teacher2",
        "alt_username": "staff4",
        "full_name": "Emily Davis",
        "email": "teacher2@evergrowschools.edu",
        "designation": "Science & Biology Teacher",
        "department": "Science",
        "role": "teacher",
        "staff_type": "teaching",
        "employee_id": "EMP-T02",
        "phone": "7777777777",
    },
    {
        "username": "teacher3",
        "alt_username": None,
        "full_name": "David Wilson",
        "email": "teacher3@evergrowschools.edu",
        "designation": "English Literature Teacher",
        "department": "Humanities",
        "role": "teacher",
        "staff_type": "teaching",
        "employee_id": "EMP-T03",
        "phone": "8888888888",
    },
    {
        "username": "teacher4",
        "alt_username": None,
        "full_name": "Clara Higgins",
        "email": "teacher4@evergrowschools.edu",
        "designation": "Social Studies & History Teacher",
        "department": "Social Sciences",
        "role": "teacher",
        "staff_type": "teaching",
        "employee_id": "EMP-T04",
        "phone": "9999999999",
    },
]

# Additional key administrative accounts
ADMIN_STAFF_DATA = [
    {
        "username": "staff",
        "alt_username": "staff_office",
        "full_name": "Office Desk Staff",
        "email": "staff@evergrowschools.edu",
        "designation": "Office Desk Staff",
        "department": "Office Administration",
        "role": "school_admin",
        "staff_type": "teaching",
        "employee_id": "EMP-STAFF",
        "phone": "9811000000",
    },
    {
        "username": "principal",
        "alt_username": "staff1",
        "full_name": "Dr. Robert Taylor",
        "email": "principal@evergrowschools.edu",
        "designation": "Principal",
        "department": "Administration",
        "role": "principal",
        "staff_type": "teaching",
        "employee_id": "EMP-0001",
        "phone": "9811000001",
    },
    {
        "username": "admin",
        "alt_username": "staff2",
        "full_name": "Sarah Jenkins",
        "email": "admin@evergrowschools.edu",
        "designation": "School Administrator",
        "department": "Office Administration",
        "role": "school_admin",
        "staff_type": "non_teaching",
        "employee_id": "EMP-0002",
        "phone": "9811000002",
    },
    {
        "username": "accountant",
        "alt_username": "staff5",
        "full_name": "David Miller",
        "email": "accountant@evergrowschools.edu",
        "designation": "Head Accountant",
        "department": "Accounts & Finance",
        "role": "accountant",
        "staff_type": "non_teaching",
        "employee_id": "EMP-0005",
        "phone": "9811000005",
    },
]

# 10 Students: Registration numbers 1 to 10
STUDENT_DATA = [
    {"reg": "1", "adm": "ADM-2026-0001", "roll": "01", "username": "student1", "full_name": "Liam Smith", "gender": "male", "grade": 1, "sec": "A", "dob": date(2019, 3, 14), "parent_phone": "1111111111"},
    {"reg": "2", "adm": "ADM-2026-0002", "roll": "02", "username": "student2", "full_name": "Emma Smith", "gender": "female", "grade": 1, "sec": "B", "dob": date(2019, 7, 22), "parent_phone": "1111111111"},
    {"reg": "3", "adm": "ADM-2026-0003", "roll": "01", "username": "student3", "full_name": "Noah Williams", "gender": "male", "grade": 2, "sec": "A", "dob": date(2018, 5, 10), "parent_phone": "2222222222"},
    {"reg": "4", "adm": "ADM-2026-0004", "roll": "02", "username": "student4", "full_name": "Olivia Williams", "gender": "female", "grade": 2, "sec": "B", "dob": date(2018, 11, 4), "parent_phone": "2222222222"},
    {"reg": "5", "adm": "ADM-2026-0005", "roll": "01", "username": "student5", "full_name": "James Jones", "gender": "male", "grade": 3, "sec": "A", "dob": date(2017, 2, 19), "parent_phone": "3333333333"},
    {"reg": "6", "adm": "ADM-2026-0006", "roll": "02", "username": "student6", "full_name": "Sophia Jones", "gender": "female", "grade": 3, "sec": "B", "dob": date(2017, 9, 30), "parent_phone": "3333333333"},
    {"reg": "7", "adm": "ADM-2026-0007", "roll": "01", "username": "student7", "full_name": "Lucas Miller", "gender": "male", "grade": 4, "sec": "A", "dob": date(2016, 4, 15), "parent_phone": "4444444444"},
    {"reg": "8", "adm": "ADM-2026-0008", "roll": "02", "username": "student8", "full_name": "Ava Miller", "gender": "female", "grade": 4, "sec": "B", "dob": date(2016, 8, 25), "parent_phone": "4444444444"},
    {"reg": "9", "adm": "ADM-2026-0009", "roll": "01", "username": "student9", "full_name": "Ethan Rodriguez", "gender": "male", "grade": 5, "sec": "A", "dob": date(2015, 6, 18), "parent_phone": "5555555555"},
    {"reg": "10", "adm": "ADM-2026-0010", "roll": "02", "username": "student10", "full_name": "Mia Rodriguez", "gender": "female", "grade": 5, "sec": "B", "dob": date(2015, 12, 5), "parent_phone": "5555555555"},
]

# 5 Parents: Phone numbers 1111111111–5555555555
PARENT_DATA = [
    {"username": "parent1", "full_name": "William Smith", "phone": "1111111111", "email": "parent1@evergrowschools.edu", "children": ["student1", "student2"]},
    {"username": "parent2", "full_name": "George Williams", "phone": "2222222222", "email": "parent2@evergrowschools.edu", "children": ["student3", "student4"]},
    {"username": "parent3", "full_name": "Daniel Jones", "phone": "3333333333", "email": "parent3@evergrowschools.edu", "children": ["student5", "student6"]},
    {"username": "parent4", "full_name": "Christopher Miller", "phone": "4444444444", "email": "parent4@evergrowschools.edu", "children": ["student7", "student8"]},
    {"username": "parent5", "full_name": "Joseph Rodriguez", "phone": "5555555555", "email": "parent5@evergrowschools.edu", "children": ["student9", "student10"]},
]


def sync_demo_accounts():
    """
    Seeds and updates all demo accounts with common password '123'
    and ensures login identifiers (Reg 1-10, Phones 1111111111-5555555555, Phones 6666666666-9999999999).
    """
    print("=" * 70)
    print("EVERGROW SCHOOLS ERP: DEMO ACCOUNTS SEED & PASSWORD SYNC")
    print("Common Demo Password: 123 (Argon2 / bcrypt securely hashed)")
    print("=" * 70)

    db = SessionLocal()
    try:
        # 1. Load Roles
        roles = {r.name: r for r in db.execute(select(Role)).scalars().all()}
        for r_name in ["super_admin", "school_admin", "principal", "teacher", "accountant", "parent", "student"]:
            if r_name not in roles:
                role = Role(id=uuid.uuid4(), name=r_name, description=f"{r_name} role", is_active=True)
                db.add(role)
                db.flush()
                roles[r_name] = role

        # 2. Academic Year
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

        # 3. Class & Section Cache
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

        # 4. Super Admin and Admin Accounts Password Update
        print("\n[+] Updating Admin and Super Admin accounts to password '123'...")
        admin_usernames = ["adrin", "superadmin_test"]
        for u_name in admin_usernames:
            user = db.execute(select(User).where(User.username == u_name)).scalar_one_or_none()
            if user:
                user.hashed_password = PASSWORD_HASH
                user.is_locked = False
                user.failed_login_attempts = 0
                user.is_active = True
                print(f"  * {user.username} (Super Admin): password set to 123, account unlocked")

        # 5. Seed / Update 4 Teacher Accounts (Phone numbers: 6666666666 - 9999999999)
        print("\n[+] Seeding & Updating 4 Teacher Accounts (Phones 6666666666 - 9999999999)...")
        for t_info in TEACHER_STAFF_DATA:
            user = db.execute(select(User).where(User.username == t_info["username"])).scalar_one_or_none()
            if not user and t_info["alt_username"]:
                user = db.execute(select(User).where(User.username == t_info["alt_username"])).scalar_one_or_none()

            if not user:
                user = User(
                    id=uuid.uuid4(),
                    username=t_info["username"],
                    email=t_info["email"],
                    hashed_password=PASSWORD_HASH,
                    full_name=t_info["full_name"],
                    phone_number=t_info["phone"],
                    portal_type="staff",
                    is_active=True,
                    is_locked=False,
                )
                db.add(user)
                db.flush()
                db.add(UserRole(id=uuid.uuid4(), user_id=user.id, role_id=roles["teacher"].id))
            else:
                user.hashed_password = PASSWORD_HASH
                user.phone_number = t_info["phone"]
                user.is_locked = False
                user.failed_login_attempts = 0
                user.is_active = True
                # Ensure teacher role attached
                has_role = any(ur.role.name == "teacher" for ur in user.user_roles if ur.role)
                if not has_role:
                    db.add(UserRole(id=uuid.uuid4(), user_id=user.id, role_id=roles["teacher"].id))

            staff = db.execute(select(Staff).where(Staff.user_id == user.id)).scalar_one_or_none()
            if not staff:
                staff = Staff(
                    id=uuid.uuid4(),
                    employee_id=t_info["employee_id"],
                    full_name=t_info["full_name"],
                    email=t_info["email"],
                    phone_number=t_info["phone"],
                    designation=t_info["designation"],
                    department=t_info["department"],
                    staff_type=t_info["staff_type"],
                    joining_date=date(2024, 6, 1),
                    is_active=True,
                    user_id=user.id,
                )
                db.add(staff)
            else:
                staff.phone_number = t_info["phone"]
                staff.designation = t_info["designation"]
                staff.is_active = True
            db.flush()
            print(f"  * Teacher: username='{user.username}' | phone='{user.phone_number}' | name='{user.full_name}' | password='123'")

        # 6. Seed / Update Admin & Principal Accounts
        print("\n[+] Seeding & Updating Admin / Principal Accounts...")
        for a_info in ADMIN_STAFF_DATA:
            user = db.execute(select(User).where(User.username == a_info["username"])).scalar_one_or_none()
            if not user and a_info["alt_username"]:
                user = db.execute(select(User).where(User.username == a_info["alt_username"])).scalar_one_or_none()

            if not user:
                user = User(
                    id=uuid.uuid4(),
                    username=a_info["username"],
                    email=a_info["email"],
                    hashed_password=PASSWORD_HASH,
                    full_name=a_info["full_name"],
                    phone_number=a_info["phone"],
                    portal_type="staff",
                    is_active=True,
                    is_locked=False,
                )
                db.add(user)
                db.flush()
                db.add(UserRole(id=uuid.uuid4(), user_id=user.id, role_id=roles[a_info["role"]].id))
            else:
                user.hashed_password = PASSWORD_HASH
                user.phone_number = a_info["phone"]
                user.is_locked = False
                user.failed_login_attempts = 0
                user.is_active = True

            staff = db.execute(select(Staff).where(Staff.user_id == user.id)).scalar_one_or_none()
            if not staff:
                staff = Staff(
                    id=uuid.uuid4(),
                    employee_id=a_info["employee_id"],
                    full_name=a_info["full_name"],
                    email=a_info["email"],
                    phone_number=a_info["phone"],
                    designation=a_info["designation"],
                    department=a_info["department"],
                    staff_type=a_info["staff_type"],
                    joining_date=date(2024, 6, 1),
                    is_active=True,
                    user_id=user.id,
                )
                db.add(staff)
            else:
                staff.phone_number = a_info["phone"]
                staff.is_active = True
            db.flush()
            print(f"  * Staff: username='{user.username}' | phone='{user.phone_number}' | role='{a_info['role']}' | password='123'")

        # 7. Seed / Update 10 Students (Registration Numbers 1–10)
        print("\n[+] Seeding & Updating 10 Students (Reg 1–10)...")
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
                    phone_number=st_info["parent_phone"],
                    portal_type="student",
                    is_active=True,
                    is_locked=False,
                )
                db.add(user)
                db.flush()
                db.add(UserRole(id=uuid.uuid4(), user_id=user.id, role_id=roles["student"].id))
            else:
                user.hashed_password = PASSWORD_HASH
                user.is_locked = False
                user.failed_login_attempts = 0
                user.is_active = True
                user.portal_type = "student"
                user.phone_number = st_info["parent_phone"]

            cls = classes[st_info["grade"]]
            sec = sections[(st_info["grade"], st_info["sec"])]

            student = db.execute(select(Student).where(Student.admission_number == st_info["adm"])).scalar_one_or_none()
            if not student:
                # Also check if any student has this user_id
                student = db.execute(select(Student).where(Student.user_id == user.id)).scalar_one_or_none()

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
                    phone_number=st_info["parent_phone"],
                    status="active",
                    user_id=user.id,
                )
                db.add(student)
                db.flush()
            else:
                student.user_id = user.id
                student.admission_number = st_info["adm"]
                student.roll_number = st_info["roll"]
                student.phone_number = st_info["parent_phone"]
                student.status = "active"

            student_obj_map[st_info["username"]] = student
            print(f"  * Student: Reg='{st_info['reg']}' / Adm='{st_info['adm']}' | username='{st_info['username']}' | name='{st_info['full_name']}' | password='123'")

        # 8. Seed / Update 5 Parents (Phone numbers 1111111111–5555555555)
        print("\n[+] Seeding & Updating 5 Parents (Phones 1111111111–5555555555)...")
        for p_info in PARENT_DATA:
            user = db.execute(select(User).where(User.username == p_info["username"])).scalar_one_or_none()
            if not user:
                user = User(
                    id=uuid.uuid4(),
                    username=p_info["username"],
                    email=p_info["email"],
                    hashed_password=PASSWORD_HASH,
                    full_name=f"{p_info['full_name']} (Parent)",
                    phone_number=p_info["phone"],
                    portal_type="parent",
                    is_active=True,
                    is_locked=False,
                )
                db.add(user)
                db.flush()
                db.add(UserRole(id=uuid.uuid4(), user_id=user.id, role_id=roles["parent"].id))
            else:
                user.hashed_password = PASSWORD_HASH
                user.phone_number = p_info["phone"]
                user.is_locked = False
                user.failed_login_attempts = 0
                user.is_active = True
                user.portal_type = "parent"

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
            else:
                guardian.phone_number = p_info["phone"]
                guardian.full_name = p_info["full_name"]

            # Link guardian to children
            for child_username in p_info["children"]:
                child_student = student_obj_map.get(child_username)
                if child_student:
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

            print(f"  * Parent: username='{p_info['username']}' | phone='{p_info['phone']}' | name='{p_info['full_name']}' | password='123'")

        db.commit()
        print("\n" + "=" * 70)
        print("SUCCESS: All demo accounts synchronized!")
        print("Login password for all demo accounts: 123")
        print("=" * 70)

    except Exception as e:
        db.rollback()
        print(f"Error during synchronization: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    sync_demo_accounts()
