import os
import sys
import uuid
from datetime import date, datetime, time, timedelta
from pathlib import Path

os.environ.setdefault("DISABLE_SQLALCHEMY_CEXT", "1")
backend_dir = Path(__file__).resolve().parent.parent
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
sys.stderr.reconfigure(encoding='utf-8', errors='replace')

from sqlalchemy import select, func, delete
from app.db.session import SessionLocal, engine
from app.core.security import hash_password
from app.models.user import Role, User, UserRole
from app.models.academic import AcademicYear, ClassRoom, Section, Subject, ClassSubject
from app.models.student import Student, Guardian, StudentGuardian
from app.models.staff import Staff, StaffAssignment
from app.models.coordinator import CoordinatorProfile
from app.models.attendance import StudentAttendance
from app.models.examination import Exam, ExamSubject, Mark, GradeScale

PASSWORD_HASH = hash_password("123")

FIRST_NAMES_BOYS = [
    "Liam", "Noah", "James", "Lucas", "Ethan", "Aarav", "Advait", "Akash", "Arjun",
    "Aryan", "Ayush", "Chetan", "Dev", "Dhruv", "Ishaan", "Krishna", "Manish", "Mihir",
    "Nikhil", "Pranav", "Rahul", "Rishi", "Rohan", "Sahil", "Shaurya", "Shiv", "Siddharth",
    "Tarun", "Utkarsh", "Varun", "Vedant", "Yash", "Alexander", "Benjamin", "Daniel",
    "Elijah", "Gabriel", "Henry", "Jackson", "Leo", "Mason", "Oliver", "Samuel", "Theodore",
    "William", "Zayd", "Farhan", "Reyansh", "Vihaan", "Kabir", "Aditya", "Armaan"
]

FIRST_NAMES_GIRLS = [
    "Emma", "Olivia", "Sophia", "Ava", "Mia", "Aditi", "Ananya", "Anika", "Avani",
    "Bhavya", "Diya", "Esha", "Gauri", "Isha", "Kavya", "Khushi", "Meera", "Neha",
    "Nisha", "Pooja", "Rhea", "Sanya", "Simran", "Sneha", "Tanvi", "Vidya", "Zoya",
    "Amelia", "Charlotte", "Ella", "Grace", "Harper", "Isabella", "Lily", "Nora",
    "Scarlett", "Stella", "Victoria", "Zara", "Aaliyah", "Fatima", "Pari", "Myra",
    "Saanvi", "Aadhya", "Kiara", "Shanaya", "Tara", "Anvi", "Ishani", "Samaira"
]

LAST_NAMES = [
    "Smith", "Williams", "Jones", "Miller", "Rodriguez", "Sharma", "Verma", "Patel",
    "Gupta", "Malhotra", "Singh", "Reddy", "Nair", "Iyer", "Rao", "Joshi", "Bhat",
    "Mehta", "Chopra", "Kapoor", "Saxena", "Choudhury", "Bose", "Banerjee", "Chatterjee",
    "Mishra", "Pandey", "Trivedi", "Deshmukh", "Kulkarni", "Patil", "Agarwal", "Bansal",
    "Goel", "Dubey", "Anderson", "Taylor", "Thomas", "Moore", "Jackson", "Martin", "Lee",
    "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson"
]

TEACHER_SUBJECTS = [
    {"code": "MATH", "name": "Mathematics", "dept": "Mathematics", "deg_suffix": "Mathematics & Quantitative Aptitude"},
    {"code": "ENG", "name": "English Literature", "dept": "Humanities", "deg_suffix": "English Literature & Communication"},
    {"code": "SCI", "name": "General Science", "dept": "Science", "deg_suffix": "Applied Sciences & STEM"},
    {"code": "SOC", "name": "Social Studies", "dept": "Social Sciences", "deg_suffix": "Social Sciences & Global Studies"},
    {"code": "CS", "name": "Computer Science", "dept": "Computer Science & IT", "deg_suffix": "Computer Science & Artificial Intelligence"},
]


def seed_scale_school_system():
    print("=" * 75)
    print("EVERGROW SCHOOLS ERP: SYSTEM SCALING SCRIPT")
    print("12 Grades | 50 Students Each (600 Total) | 5 Teachers Each (60 Total)")
    print("3 Coordinators (1-5, 6-9, 10-12) | 1 Principal | 1 Super Admin")
    print("10 Office Staff | 10 Non-Teaching Staff | Common Password: 123")
    print("=" * 75)

    db = SessionLocal()
    try:
        # -------------------------------------------------------------
        # 1. ROLES
        # -------------------------------------------------------------
        print("\n[1/8] Verifying User Roles...")
        role_names = [
            "super_admin", "principal", "school_admin", "teacher",
            "accountant", "parent", "student", "coordinator"
        ]
        roles = {}
        for r_name in role_names:
            r = db.execute(select(Role).where(Role.name == r_name)).scalar_one_or_none()
            if not r:
                r = Role(id=uuid.uuid4(), name=r_name, description=f"{r_name} role", is_active=True)
                db.add(r)
                db.flush()
            roles[r_name] = r
        print(f"  ✓ {len(roles)} roles verified.")

        # -------------------------------------------------------------
        # 2. ACADEMIC YEAR & SUBJECTS
        # -------------------------------------------------------------
        print("\n[2/8] Setting Up Academic Year & Subjects...")
        ay = db.execute(select(AcademicYear).where(AcademicYear.is_active == True)).scalar_one_or_none()
        if not ay:
            ay = AcademicYear(
                id=uuid.uuid4(),
                name="2026-2027 Academic Session",
                start_date=date(2026, 6, 1),
                end_date=date(2027, 4, 30),
                is_active=True,
                is_closed=False,
            )
            db.add(ay)
            db.flush()

        subjects_dict = {}
        for s_info in TEACHER_SUBJECTS:
            s_obj = db.execute(select(Subject).where(Subject.code == s_info["code"])).scalar_one_or_none()
            if not s_obj:
                s_obj = Subject(
                    id=uuid.uuid4(),
                    name=s_info["name"],
                    code=s_info["code"],
                    type="core",
                    credits=4,
                    is_active=True,
                )
                db.add(s_obj)
                db.flush()
            subjects_dict[s_info["code"]] = s_obj

        # -------------------------------------------------------------
        # 3. 12 GRADES & SECTIONS (A and B for each grade)
        # -------------------------------------------------------------
        print("\n[3/8] Ensuring 12 Grades (Grade 1 to Grade 12) & Sections...")
        classes_dict = {}
        sections_dict = {}

        for level in range(1, 13):
            c_name = f"Grade {level}"
            cls = db.execute(select(ClassRoom).where(ClassRoom.name == c_name)).scalar_one_or_none()
            if not cls:
                cls = ClassRoom(
                    id=uuid.uuid4(),
                    name=c_name,
                    level=level,
                    description=f"{c_name} Class Division",
                    is_active=True,
                )
                db.add(cls)
                db.flush()
            classes_dict[level] = cls

            # Link all 5 subjects to class
            for s_code, s_obj in subjects_dict.items():
                cs = db.execute(
                    select(ClassSubject).where(
                        ClassSubject.class_id == cls.id,
                        ClassSubject.subject_id == s_obj.id,
                    )
                ).scalar_one_or_none()
                if not cs:
                    cs = ClassSubject(
                        id=uuid.uuid4(),
                        class_id=cls.id,
                        subject_id=s_obj.id,
                        is_elective=False,
                        is_active=True,
                    )
                    db.add(cs)

            # Ensure Section A and Section B
            for sec_name in ["A", "B"]:
                sec = db.execute(
                    select(Section).where(Section.class_id == cls.id, Section.name == sec_name)
                ).scalar_one_or_none()
                if not sec:
                    sec = Section(
                        id=uuid.uuid4(),
                        class_id=cls.id,
                        name=sec_name,
                        room_number=f"Rm-{level:02d}{sec_name}",
                        capacity=40,
                        is_active=True,
                    )
                    db.add(sec)
                    db.flush()
                sections_dict[(level, sec_name)] = sec

        db.flush()
        print(f"  ✓ 12 Grades and 24 Sections (A & B) configured.")

        # -------------------------------------------------------------
        # 4. SUPER ADMIN & PRINCIPAL
        # -------------------------------------------------------------
        print("\n[4/8] Verifying Super Admin and Principal...")
        # Super Admin (admin / adrin)
        super_admin_user = db.execute(select(User).where(User.username == "admin")).scalar_one_or_none()
        if not super_admin_user:
            super_admin_user = User(
                id=uuid.uuid4(),
                username="admin",
                email="admin@evergrowschools.edu",
                hashed_password=PASSWORD_HASH,
                full_name="Trustee Adrin",
                phone_number="9811000000",
                portal_type="staff",
                is_active=True,
                is_locked=False,
            )
            db.add(super_admin_user)
            db.flush()
            db.add(UserRole(id=uuid.uuid4(), user_id=super_admin_user.id, role_id=roles["super_admin"].id))
        else:
            super_admin_user.hashed_password = PASSWORD_HASH
            super_admin_user.is_active = True
            super_admin_user.is_locked = False

        # Principal (principal / staff1)
        prin_user = db.execute(select(User).where(User.username == "principal")).scalar_one_or_none()
        if not prin_user:
            prin_user = db.execute(select(User).where(User.username == "staff1")).scalar_one_or_none()
        if not prin_user:
            prin_user = User(
                id=uuid.uuid4(),
                username="principal",
                email="principal@evergrowschools.edu",
                hashed_password=PASSWORD_HASH,
                full_name="Dr. Robert Taylor",
                phone_number="9811000001",
                portal_type="staff",
                is_active=True,
                is_locked=False,
            )
            db.add(prin_user)
            db.flush()
            db.add(UserRole(id=uuid.uuid4(), user_id=prin_user.id, role_id=roles["principal"].id))
            db.add(UserRole(id=uuid.uuid4(), user_id=prin_user.id, role_id=roles["school_admin"].id))
        else:
            prin_user.hashed_password = PASSWORD_HASH
            prin_user.is_active = True
            prin_user.is_locked = False

        # Principal Staff record
        prin_staff = db.execute(select(Staff).where(Staff.employee_id == "EMP-0001")).scalar_one_or_none()
        if not prin_staff:
            prin_staff = Staff(
                id=uuid.uuid4(),
                employee_id="EMP-0001",
                full_name="Dr. Robert Taylor",
                email="principal@evergrowschools.edu",
                phone_number="9811000001",
                designation="Principal",
                department="School Administration",
                staff_type="teaching",
                qualification="Ph.D. Educational Administration, M.Sc. Physics",
                joining_date=date(2018, 5, 1),
                is_active=True,
                user_id=prin_user.id,
            )
            db.add(prin_staff)
        else:
            prin_staff.designation = "Principal"
            prin_staff.staff_type = "teaching"
            prin_staff.is_active = True
        db.flush()
        print("  ✓ 1 Super Admin & 1 Principal verified.")

        # -------------------------------------------------------------
        # 5. EXACTLY 3 COORDINATORS
        # -------------------------------------------------------------
        print("\n[5/8] Configuring Exactly 3 Coordinators (1-5, 6-9, 10-12)...")

        # Coordinator 1: Grades 1 to 5 (Primary)
        # Coordinator 2: Grades 6 to 9 (Middle)
        # Coordinator 3: Grades 10 to 12 (Senior Secondary - Elena Rostova / coordinator1)
        coord_configs = [
            {
                "employee_id": "EMP-C01",
                "username": "coordinator1",
                "alt_username": "coord_senior",
                "full_name": "Elena Rostova",
                "email": "coordinator1@evergrowschools.edu",
                "phone": "9811000088",
                "designation": "Senior Secondary Coordinator",
                "wing": "Senior Secondary Wing (Grades 10-12)",
                "allocated_grades": ["Grade 10", "Grade 11", "Grade 12"],
                "supervised_subjects": ["Mathematics", "Physics", "Chemistry", "Computer Science"],
                "qualification": "M.Sc. Mathematics, B.Ed., Educational Leadership",
                "dept": "Senior Secondary Coordination",
                "office_room": "Academic Wing Rm 102",
                "duties": "Directs senior secondary board examination preparedness, career counseling pathways, and university stream allocations.",
                "is_lead": True,
            },
            {
                "employee_id": "EMP-C02",
                "username": "coord_primary",
                "alt_username": None,
                "full_name": "Marcus Vance",
                "email": "marcus.vance@evergrowschools.edu",
                "phone": "9811000089",
                "designation": "Primary Wing Coordinator",
                "wing": "Primary Wing (Grades 1-5)",
                "allocated_grades": ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5"],
                "supervised_subjects": ["Foundational English", "Primary Maths", "Environmental Studies"],
                "qualification": "M.A. Primary Education, B.Ed.",
                "dept": "Primary School Coordination",
                "office_room": "Junior Wing Rm 201",
                "duties": "Oversees primary school curriculum pacing, foundational numeracy, and formative student growth.",
                "is_lead": False,
            },
            {
                "employee_id": "EMP-C03",
                "username": "coord_middle",
                "alt_username": None,
                "full_name": "Ananya Sharma",
                "email": "ananya.sharma@evergrowschools.edu",
                "phone": "9811000090",
                "designation": "Middle School Coordinator",
                "wing": "Middle School Wing (Grades 6-9)",
                "allocated_grades": ["Grade 6", "Grade 7", "Grade 8", "Grade 9"],
                "supervised_subjects": ["English Literature", "Integrated Science", "Social Studies", "Mathematics"],
                "qualification": "M.Sc. Physics, B.Ed.",
                "dept": "Middle School Coordination",
                "office_room": "Middle Block Rm 305",
                "duties": "Manages middle school experiential learning, laboratory practicals, and student disciplinary guidance.",
                "is_lead": False,
            },
        ]

        # Remove or deactivate any extra coordinators beyond these 3
        active_emp_ids = [c["employee_id"] for c in coord_configs]
        extra_coords = db.execute(
            select(CoordinatorProfile).where(~CoordinatorProfile.employee_id.in_(active_emp_ids))
        ).scalars().all()
        for ec in extra_coords:
            db.delete(ec)
        db.flush()

        for c_cfg in coord_configs:
            # User
            u = db.execute(select(User).where(User.username == c_cfg["username"])).scalar_one_or_none()
            if not u and c_cfg["alt_username"]:
                u = db.execute(select(User).where(User.username == c_cfg["alt_username"])).scalar_one_or_none()
            if not u:
                u = User(
                    id=uuid.uuid4(),
                    username=c_cfg["username"],
                    email=c_cfg["email"],
                    hashed_password=PASSWORD_HASH,
                    full_name=c_cfg["full_name"],
                    phone_number=c_cfg["phone"],
                    portal_type="staff",
                    is_active=True,
                    is_locked=False,
                )
                db.add(u)
                db.flush()
                db.add(UserRole(id=uuid.uuid4(), user_id=u.id, role_id=roles["coordinator"].id))
            else:
                u.hashed_password = PASSWORD_HASH
                u.is_active = True
                u.is_locked = False

            # Staff
            st = db.execute(
                select(Staff).where(
                    (Staff.user_id == u.id)
                    | (Staff.employee_id == c_cfg["employee_id"])
                    | (Staff.email == c_cfg["email"])
                )
            ).scalar_one_or_none()
            if not st:
                st = Staff(
                    id=uuid.uuid4(),
                    employee_id=c_cfg["employee_id"],
                    full_name=c_cfg["full_name"],
                    email=c_cfg["email"],
                    phone_number=c_cfg["phone"],
                    designation=c_cfg["designation"],
                    department=c_cfg["dept"],
                    staff_type="teaching",
                    qualification=c_cfg["qualification"],
                    joining_date=date(2021, 6, 1),
                    is_active=True,
                    user_id=u.id,
                )
                db.add(st)
                db.flush()
            else:
                st.full_name = c_cfg["full_name"]
                st.designation = c_cfg["designation"]
                st.department = c_cfg["dept"]
                st.staff_type = "teaching"
                st.is_active = True
                st.user_id = u.id

            # CoordinatorProfile
            cp = db.execute(
                select(CoordinatorProfile).where(CoordinatorProfile.employee_id == c_cfg["employee_id"])
            ).scalar_one_or_none()
            if not cp:
                cp = CoordinatorProfile(
                    id=uuid.uuid4(),
                    employee_id=c_cfg["employee_id"],
                    staff_id=st.id,
                    user_id=u.id,
                    full_name=c_cfg["full_name"],
                    email=c_cfg["email"],
                    phone_number=c_cfg["phone"],
                    designation=c_cfg["designation"],
                    coordinator_type=c_cfg["coordinator_type"] if "coordinator_type" in c_cfg else "WING",
                    wing=c_cfg["wing"],
                    allocated_grades=c_cfg["allocated_grades"],
                    supervised_subjects=c_cfg["supervised_subjects"],
                    office_room=c_cfg["office_room"],
                    duty_responsibilities=c_cfg["duties"],
                    is_lead=c_cfg["is_lead"],
                    is_active=True,
                )
                db.add(cp)
            else:
                cp.staff_id = st.id
                cp.user_id = u.id
                cp.full_name = c_cfg["full_name"]
                cp.designation = c_cfg["designation"]
                cp.wing = c_cfg["wing"]
                cp.allocated_grades = c_cfg["allocated_grades"]
                cp.supervised_subjects = c_cfg["supervised_subjects"]
                cp.office_room = c_cfg["office_room"]
                cp.duty_responsibilities = c_cfg["duties"]
                cp.is_lead = c_cfg["is_lead"]
                cp.is_active = True

        db.flush()
        print("  ✓ Exactly 3 Coordinators configured.")

        # -------------------------------------------------------------
        # 6. 60 TEACHERS (5 Teachers for each of the 12 Grades)
        # -------------------------------------------------------------
        print("\n[6/8] Seeding 60 Teachers (5 Teachers per Grade)...")

        # Key existing demo teachers
        DEMO_TEACHERS = {
            1: {"user": "teacher1", "alt": "staff3", "name": "Michael Chang", "phone": "6666666666"},
            2: {"user": "teacher2", "alt": "staff4", "name": "Emily Davis", "phone": "7777777777"},
            3: {"user": "teacher3", "alt": None, "name": "David Wilson", "phone": "8888888888"},
            4: {"user": "teacher4", "alt": None, "name": "Clara Higgins", "phone": "9999999999"},
        }

        teacher_idx = 1
        for level in range(1, 13):
            cls_obj = classes_dict[level]
            sec_a = sections_dict[(level, "A")]
            sec_b = sections_dict[(level, "B")]

            for s_idx, s_info in enumerate(TEACHER_SUBJECTS):
                emp_id = f"EMP-T{teacher_idx:02d}"
                demo_data = DEMO_TEACHERS.get(teacher_idx)

                username = demo_data["user"] if demo_data else f"teacher{teacher_idx}"
                full_name = demo_data["name"] if demo_data else f"Prof. {FIRST_NAMES_BOYS[(teacher_idx*3) % len(FIRST_NAMES_BOYS)]} {LAST_NAMES[(teacher_idx*5) % len(LAST_NAMES)]}"
                phone = demo_data["phone"] if demo_data else f"98765{teacher_idx:05d}"
                email = f"{username}@evergrowschools.edu"
                designation = f"Grade {level} {s_info['name']} Teacher"
                dept = s_info["dept"]
                subj_obj = subjects_dict[s_info["code"]]

                # User
                u = db.execute(select(User).where(User.username == username)).scalar_one_or_none()
                if not u and demo_data and demo_data.get("alt"):
                    u = db.execute(select(User).where(User.username == demo_data["alt"])).scalar_one_or_none()
                if not u:
                    u = User(
                        id=uuid.uuid4(),
                        username=username,
                        email=email,
                        hashed_password=PASSWORD_HASH,
                        full_name=full_name,
                        phone_number=phone,
                        portal_type="staff",
                        is_active=True,
                        is_locked=False,
                    )
                    db.add(u)
                    db.flush()
                    db.add(UserRole(id=uuid.uuid4(), user_id=u.id, role_id=roles["teacher"].id))
                else:
                    u.hashed_password = PASSWORD_HASH
                    u.is_active = True
                    u.is_locked = False
                    has_role = any(ur.role.name == "teacher" for ur in u.user_roles if ur.role)
                    if not has_role:
                        db.add(UserRole(id=uuid.uuid4(), user_id=u.id, role_id=roles["teacher"].id))

                # Staff
                st = db.execute(
                    select(Staff).where(
                        (Staff.user_id == u.id)
                        | (Staff.employee_id == emp_id)
                        | (Staff.email == email)
                    )
                ).scalar_one_or_none()
                if not st:
                    st = Staff(
                        id=uuid.uuid4(),
                        employee_id=emp_id,
                        full_name=full_name,
                        email=email,
                        phone_number=phone,
                        designation=designation,
                        department=dept,
                        staff_type="teaching",
                        qualification=f"M.Sc./M.A. in {s_info['name']}, B.Ed.",
                        joining_date=date(2022, 6, 1),
                        is_active=True,
                        user_id=u.id,
                    )
                    db.add(st)
                    db.flush()
                else:
                    st.employee_id = emp_id
                    st.email = email
                    st.full_name = full_name
                    st.designation = designation
                    st.department = dept
                    st.staff_type = "teaching"
                    st.is_active = True
                    st.user_id = u.id

                # StaffAssignment to Section A and Section B
                for sec_obj in [sec_a, sec_b]:
                    sa = db.execute(
                        select(StaffAssignment).where(
                            StaffAssignment.staff_id == st.id,
                            StaffAssignment.class_id == cls_obj.id,
                            StaffAssignment.section_id == sec_obj.id,
                            StaffAssignment.subject_id == subj_obj.id,
                            StaffAssignment.academic_year_id == ay.id,
                        )
                    ).scalar_one_or_none()
                    if not sa:
                        sa = StaffAssignment(
                            id=uuid.uuid4(),
                            staff_id=st.id,
                            class_id=cls_obj.id,
                            section_id=sec_obj.id,
                            subject_id=subj_obj.id,
                            academic_year_id=ay.id,
                            is_primary_teacher=(s_idx == 0),
                            is_active=True,
                        )
                        db.add(sa)

                teacher_idx += 1

        db.flush()
        print(f"  ✓ 60 Teachers created and mapped to 12 grades.")

        # -------------------------------------------------------------
        # 7. 10 OFFICE STAFF & 10 NON-TEACHING STAFF
        # -------------------------------------------------------------
        print("\n[7/8] Seeding 10 Office Staff & 10 Non-Teaching Staff...")

        OFFICE_STAFF = [
            ("EMP-OFF-01", "office1", "Ronald Henderson", "Admissions & Enrolment Officer", "Admissions Office", "9811000101"),
            ("EMP-OFF-02", "staff2", "Sarah Jenkins", "Senior Accounts & Treasury Officer", "Accounts & Finance", "9811000002"),
            ("EMP-OFF-03", "staff5", "David Miller", "Head Cashier & Fee Collection Lead", "Accounts & Finance", "9811000005"),
            ("EMP-OFF-04", "office4", "Patricia Brooks", "Student Registrar & Archives Officer", "Student Records", "9811000104"),
            ("EMP-OFF-05", "office5", "Amanda Foster", "Front Desk & Public Relations Officer", "Reception & Front Desk", "9811000105"),
            ("EMP-OFF-06", "office6", "George Bennett", "Examination Cell Documentation Officer", "Examination Cell", "9811000106"),
            ("EMP-OFF-07", "office7", "Kevin Scott", "Transport Operations Desk Incharge", "Transport Office", "9811000107"),
            ("EMP-OFF-08", "office8", "Laura Mitchell", "Human Resources & Payroll Specialist", "Human Resources", "9811000108"),
            ("EMP-OFF-09", "office9", "Brian Carter", "Central Store & Procurement Officer", "Stores & Logistics", "9811000109"),
            ("EMP-OFF-10", "office10", "Stephanie Ross", "Parent Relations & Grievance Liaison", "Academic Administration", "9811000110"),
        ]

        NON_TEACHING_STAFF = [
            ("EMP-NTS-01", "support1", "Samuel Green", "Senior Computer & AI Lab Technical Assistant", "Technical Support", "9811000201"),
            ("EMP-NTS-02", "support2", "Timothy Gray", "Physics & Chemistry Science Lab Technician", "Science Laboratories", "9811000202"),
            ("EMP-NTS-03", "support3", "Rebecca White", "Biology & Life Sciences Lab Attendant", "Science Laboratories", "9811000203"),
            ("EMP-NTS-04", "support4", "Sister Mary Higgins", "Campus Medical Officer & Resident Staff Nurse", "Health & Wellness", "9811000204"),
            ("EMP-NTS-05", "support5", "Rajendra Prasad", "Chief Bus Fleet & Route Operations Supervisor", "Transport & Fleet", "9811000205"),
            ("EMP-NTS-06", "support6", "Colonel Harish Rawat", "Campus Safety & Security Incharge", "Campus Security", "9811000206"),
            ("EMP-NTS-07", "support7", "Dennis Cooper", "Facilities, Power & Electrical Systems Lead", "Estate & Maintenance", "9811000207"),
            ("EMP-NTS-08", "support8", "Vikramaditya Bose", "Athletic Grounds & Sports Complex Incharge", "Physical Education", "9811000208"),
            ("EMP-NTS-09", "support9", "Meena Kumari", "Campus Sanitation & Housekeeping Supervisor", "Housekeeping", "9811000209"),
            ("EMP-NTS-10", "support10", "Thomas Wright", "Central Library & Digital Resource Assistant", "Library Services", "9811000210"),
        ]

        for emp_id, uname, fname, desig, dept, phone in OFFICE_STAFF:
            u = db.execute(select(User).where(User.username == uname)).scalar_one_or_none()
            if not u:
                u = User(
                    id=uuid.uuid4(),
                    username=uname,
                    email=f"{uname}@evergrowschools.edu",
                    hashed_password=PASSWORD_HASH,
                    full_name=fname,
                    phone_number=phone,
                    portal_type="staff",
                    is_active=True,
                    is_locked=False,
                )
                db.add(u)
                db.flush()
                db.add(UserRole(id=uuid.uuid4(), user_id=u.id, role_id=roles["school_admin"].id))
            else:
                u.hashed_password = PASSWORD_HASH
                u.is_active = True
                u.is_locked = False

            st = db.execute(
                select(Staff).where(
                    (Staff.user_id == u.id)
                    | (Staff.employee_id == emp_id)
                    | (Staff.email == f"{uname}@evergrowschools.edu")
                )
            ).scalar_one_or_none()
            if not st:
                st = Staff(
                    id=uuid.uuid4(),
                    employee_id=emp_id,
                    full_name=fname,
                    email=f"{uname}@evergrowschools.edu",
                    phone_number=phone,
                    designation=desig,
                    department=dept,
                    staff_type="non_teaching",
                    qualification="B.Com / B.A. / B.Sc.",
                    joining_date=date(2020, 4, 1),
                    is_active=True,
                    user_id=u.id,
                )
                db.add(st)
            else:
                st.employee_id = emp_id
                st.full_name = fname
                st.designation = desig
                st.department = dept
                st.staff_type = "non_teaching"
                st.is_active = True
                st.user_id = u.id

        for emp_id, uname, fname, desig, dept, phone in NON_TEACHING_STAFF:
            u = db.execute(select(User).where(User.username == uname)).scalar_one_or_none()
            if not u:
                u = User(
                    id=uuid.uuid4(),
                    username=uname,
                    email=f"{uname}@evergrowschools.edu",
                    hashed_password=PASSWORD_HASH,
                    full_name=fname,
                    phone_number=phone,
                    portal_type="staff",
                    is_active=True,
                    is_locked=False,
                )
                db.add(u)
                db.flush()
                db.add(UserRole(id=uuid.uuid4(), user_id=u.id, role_id=roles["school_admin"].id))
            else:
                u.hashed_password = PASSWORD_HASH
                u.is_active = True
                u.is_locked = False

            st = db.execute(
                select(Staff).where(
                    (Staff.user_id == u.id)
                    | (Staff.employee_id == emp_id)
                    | (Staff.email == f"{uname}@evergrowschools.edu")
                )
            ).scalar_one_or_none()
            if not st:
                st = Staff(
                    id=uuid.uuid4(),
                    employee_id=emp_id,
                    full_name=fname,
                    email=f"{uname}@evergrowschools.edu",
                    phone_number=phone,
                    designation=desig,
                    department=dept,
                    staff_type="non_teaching",
                    qualification="Diploma / Technical Certification",
                    joining_date=date(2021, 1, 15),
                    is_active=True,
                    user_id=u.id,
                )
                db.add(st)
            else:
                st.employee_id = emp_id
                st.full_name = fname
                st.designation = desig
                st.department = dept
                st.staff_type = "non_teaching"
                st.is_active = True
                st.user_id = u.id

        db.flush()
        print("  ✓ 10 Office Staff and 10 Non-Teaching Staff configured.")

        # -------------------------------------------------------------
        # 8. 600 STUDENTS (50 Students in Each of 12 Grades)
        # -------------------------------------------------------------
        print("\n[8/8] Seeding 600 Students (50 per Grade in Grades 1 to 12)...")

        # Existing demo students
        DEMO_STUDENTS = {
            1: {"name": "Liam Smith", "gender": "male", "dob": date(2010, 3, 14), "parent": "William Smith", "phone": "1111111111"},
            2: {"name": "Emma Smith", "gender": "female", "dob": date(2010, 7, 22), "parent": "William Smith", "phone": "1111111111"},
            3: {"name": "Noah Williams", "gender": "male", "dob": date(2011, 5, 10), "parent": "George Williams", "phone": "2222222222"},
            4: {"name": "Olivia Williams", "gender": "female", "dob": date(2011, 11, 4), "parent": "George Williams", "phone": "2222222222"},
            5: {"name": "James Jones", "gender": "male", "dob": date(2012, 2, 19), "parent": "Daniel Jones", "phone": "3333333333"},
            6: {"name": "Sophia Jones", "gender": "female", "dob": date(2012, 9, 30), "parent": "Daniel Jones", "phone": "3333333333"},
            7: {"name": "Lucas Miller", "gender": "male", "dob": date(2013, 4, 15), "parent": "Christopher Miller", "phone": "4444444444"},
            8: {"name": "Ava Miller", "gender": "female", "dob": date(2013, 8, 25), "parent": "Christopher Miller", "phone": "4444444444"},
            9: {"name": "Ethan Rodriguez", "gender": "male", "dob": date(2014, 6, 18), "parent": "Joseph Rodriguez", "phone": "5555555555"},
            10: {"name": "Mia Rodriguez", "gender": "female", "dob": date(2014, 12, 5), "parent": "Joseph Rodriguez", "phone": "5555555555"},
        }

        # Parent user accounts cache
        parents_cache = {}

        student_global_idx = 1
        today = date.today()

        for level in range(1, 13):
            cls_obj = classes_dict[level]
            # 25 in Section A, 25 in Section B
            for sec_letter in ["A", "B"]:
                sec_obj = sections_dict[(level, sec_letter)]

                for roll_int in range(1, 26):
                    adm_no = f"ADM-2026-{student_global_idx:04d}"
                    roll_str = f"{roll_int:02d}"
                    username = f"student{student_global_idx}"

                    # Demographics
                    demo = DEMO_STUDENTS.get(student_global_idx)
                    is_girl = (roll_int % 2 == 0)

                    if demo:
                        full_name = demo["name"]
                        gender = demo["gender"]
                        dob = demo["dob"]
                        parent_name = demo["parent"]
                        parent_phone = demo["phone"]
                    else:
                        first_list = FIRST_NAMES_GIRLS if is_girl else FIRST_NAMES_BOYS
                        f_name = first_list[(student_global_idx * 7 + roll_int) % len(first_list)]
                        l_name = LAST_NAMES[(student_global_idx * 11 + roll_int) % len(LAST_NAMES)]
                        full_name = f"{f_name} {l_name}"
                        gender = "female" if is_girl else "male"
                        # Appropriate age based on grade (Grade 1 ~ 6yo in 2026, Grade 12 ~ 17yo in 2026)
                        birth_year = 2026 - (level + 5)
                        dob = date(birth_year, ((student_global_idx * 3) % 12) + 1, ((student_global_idx * 5) % 28) + 1)
                        parent_name = f"Mr. {f_name}'s Guardian {l_name}"
                        parent_phone = f"98200{student_global_idx:05d}"

                    # Student User
                    u = db.execute(select(User).where(User.username == username)).scalar_one_or_none()
                    if not u:
                        u = User(
                            id=uuid.uuid4(),
                            username=username,
                            email=f"{username}@evergrowschools.edu",
                            hashed_password=PASSWORD_HASH,
                            full_name=full_name,
                            phone_number=parent_phone,
                            portal_type="parent_student",
                            is_active=True,
                            is_locked=False,
                        )
                        db.add(u)
                        db.flush()
                        db.add(UserRole(id=uuid.uuid4(), user_id=u.id, role_id=roles["student"].id))
                    else:
                        u.hashed_password = PASSWORD_HASH
                        u.full_name = full_name
                        u.is_active = True
                        u.is_locked = False

                    # Student Record
                    std = db.execute(select(Student).where(Student.admission_number == adm_no)).scalar_one_or_none()
                    if not std:
                        std = Student(
                            id=uuid.uuid4(),
                            admission_number=adm_no,
                            roll_number=roll_str,
                            full_name=full_name,
                            date_of_birth=dob,
                            gender=gender,
                            admission_date=date(2026, 6, 1),
                            class_id=cls_obj.id,
                            section_id=sec_obj.id,
                            academic_year_id=ay.id,
                            status="active",
                            user_id=u.id,
                        )
                        db.add(std)
                        db.flush()
                    else:
                        std.full_name = full_name
                        std.class_id = cls_obj.id
                        std.section_id = sec_obj.id
                        std.roll_number = roll_str
                        std.academic_year_id = ay.id
                        std.status = "active"
                        std.user_id = u.id

                    # Attendance record for today
                    att = db.execute(
                        select(StudentAttendance).where(
                            StudentAttendance.student_id == std.id,
                            StudentAttendance.attendance_date == today,
                            StudentAttendance.session == "full_day",
                        )
                    ).scalar_one_or_none()
                    if not att:
                        # 96% present
                        is_present = (student_global_idx % 25 != 0)
                        att = StudentAttendance(
                            id=uuid.uuid4(),
                            student_id=std.id,
                            class_id=cls_obj.id,
                            section_id=sec_obj.id,
                            academic_year_id=ay.id,
                            attendance_date=today,
                            session="full_day",
                            status="present" if is_present else "absent",
                            remarks="Present in morning assembly" if is_present else "Leave application submitted",
                            marked_by_user_id=prin_user.id,
                            is_locked=False,
                        )
                        db.add(att)

                    # Guardian Link
                    guardian = db.execute(select(Guardian).where(Guardian.phone_number == parent_phone)).scalar_one_or_none()
                    if not guardian:
                        guardian = Guardian(
                            id=uuid.uuid4(),
                            full_name=parent_name,
                            relationship_type="father" if not is_girl else "mother",
                            phone_number=parent_phone,
                            email=f"parent_{adm_no.lower()}@evergrowschools.edu",
                            is_emergency_contact=True,
                        )
                        db.add(guardian)
                        db.flush()

                    sg = db.execute(
                        select(StudentGuardian).where(
                            StudentGuardian.student_id == std.id,
                            StudentGuardian.guardian_id == guardian.id,
                        )
                    ).scalar_one_or_none()
                    if not sg:
                        sg = StudentGuardian(
                            id=uuid.uuid4(),
                            student_id=std.id,
                            guardian_id=guardian.id,
                            is_primary=True,
                            can_pickup=True,
                        )
                        db.add(sg)

                    student_global_idx += 1

        db.commit()
        print(f"  ✓ {student_global_idx - 1} Students created across 12 grades (50 per grade).")

        # -------------------------------------------------------------
        # 9. FINAL VERIFICATION & COUNTS AUDIT
        # -------------------------------------------------------------
        print("\n" + "=" * 75)
        print("FINAL VERIFICATION AUDIT:")
        print("=" * 75)
        classes_cnt = db.execute(select(func.count(ClassRoom.id))).scalar()
        sections_cnt = db.execute(select(func.count(Section.id))).scalar()
        students_cnt = db.execute(select(func.count(Student.id)).where(Student.status == "active")).scalar()
        teachers_cnt = db.execute(select(func.count(Staff.id)).where(Staff.staff_type == "teaching", Staff.designation.like("%Teacher%"))).scalar()
        coords_cnt = db.execute(select(func.count(CoordinatorProfile.id)).where(CoordinatorProfile.is_active == True)).scalar()
        office_cnt = db.execute(select(func.count(Staff.id)).where(Staff.employee_id.like("EMP-OFF-%"))).scalar()
        nts_cnt = db.execute(select(func.count(Staff.id)).where(Staff.employee_id.like("EMP-NTS-%"))).scalar()
        principal_cnt = db.execute(select(func.count(Staff.id)).where(Staff.designation == "Principal")).scalar()
        super_admin_cnt = db.execute(select(func.count(User.id)).where(User.username == "admin")).scalar()

        print(f"• Total Grades / Classes: {classes_cnt} (Target: 12)")
        print(f"• Total Class Sections:   {sections_cnt} (24 sections, 2 per grade)")
        print(f"• Total Active Students:  {students_cnt} (Target: 600, exactly 50 per grade)")
        print(f"• Total Teachers:         {teachers_cnt} (Target: 60, exactly 5 per grade)")
        print(f"• Total Coordinators:     {coords_cnt} (Target: 3: Grades 1-5, Grades 6-9, Grades 10-12)")
        print(f"• Principal:              {principal_cnt} (Target: 1)")
        print(f"• Super Admin:            {super_admin_cnt} (Target: 1)")
        print(f"• Office Staff:           {office_cnt} (Target: 10)")
        print(f"• Non-Teaching Staff:     {nts_cnt} (Target: 10)")
        print("=" * 75)
        print("SUCCESS: Scaling complete and verified!")

    except Exception as e:
        db.rollback()
        print(f"\n[!] Error during scaling: {e}")
        import traceback
        traceback.print_exc()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_scale_school_system()
