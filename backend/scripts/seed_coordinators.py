import os
import sys
import uuid
from datetime import date
from pathlib import Path

os.environ.setdefault("DISABLE_SQLALCHEMY_CEXT", "1")
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from sqlalchemy import select
from app.db.session import SessionLocal, engine
from app.db.base import Base
from app.core.security import hash_password
from app.models.user import Role, User, UserRole
from app.models.staff import Staff
from app.models.coordinator import CoordinatorProfile

PASSWORD_HASH = hash_password("123")


def seed_coordinators():
    print("=" * 60)
    print("SEEDING COORDINATORS & USER ACCOUNTS")
    print("=" * 60)

    # 1. Ensure table creation
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # 2. Ensure coordinator role exists
        role_coord = db.execute(select(Role).where(Role.name == "coordinator")).scalar_one_or_none()
        if not role_coord:
            role_coord = Role(id=uuid.uuid4(), name="coordinator", description="School Academic & Operations Coordinator", is_active=True)
            db.add(role_coord)
            db.flush()
            print("Created 'coordinator' role.")

        # 3. Create or update user 'coordinator1' (Elena Rostova)
        user = db.execute(select(User).where(User.username == "coordinator1")).scalar_one_or_none()
        if not user:
            user = User(
                id=uuid.uuid4(),
                username="coordinator1",
                email="coordinator1@evergrowschools.edu",
                hashed_password=PASSWORD_HASH,
                full_name="Elena Rostova",
                phone_number="9811000088",
                portal_type="staff",
                is_active=True,
            )
            db.add(user)
            db.flush()
            print("Created user 'coordinator1'")
        else:
            user.hashed_password = PASSWORD_HASH
            user.portal_type = "staff"
            user.is_active = True
            db.flush()

        # Link role to user
        ur = db.execute(
            select(UserRole).where(UserRole.user_id == user.id, UserRole.role_id == role_coord.id)
        ).scalar_one_or_none()
        if not ur:
            ur = UserRole(id=uuid.uuid4(), user_id=user.id, role_id=role_coord.id)
            db.add(ur)
            db.flush()
            print("Assigned 'coordinator' role to coordinator1")

        # 4. Create Staff record for Elena Rostova
        staff = db.execute(select(Staff).where(Staff.employee_id == "EMP-C01")).scalar_one_or_none()
        if not staff:
            staff = Staff(
                id=uuid.uuid4(),
                employee_id="EMP-C01",
                full_name="Elena Rostova",
                email="coordinator1@evergrowschools.edu",
                phone_number="9811000088",
                designation="Chief Academic Coordinator",
                department="Academic Coordination",
                staff_type="teaching",
                qualification="M.Sc. Mathematics, B.Ed., Educational Leadership",
                joining_date=date(2021, 6, 1),
                is_active=True,
                user_id=user.id,
            )
            db.add(staff)
            db.flush()
            print("Created staff record for Elena Rostova (EMP-C01)")

        # 5. Seed 5 rich coordinator profiles
        coordinators_data = [
            {
                "employee_id": "EMP-C01",
                "staff_id": staff.id,
                "user_id": user.id,
                "full_name": "Elena Rostova",
                "email": "coordinator1@evergrowschools.edu",
                "phone_number": "9811000088",
                "designation": "Chief Academic Coordinator",
                "coordinator_type": "ACADEMIC",
                "wing": "Senior Secondary Wing (Grades 9-12)",
                "allocated_grades": ["Grade 9", "Grade 10", "Grade 11", "Grade 12"],
                "supervised_subjects": ["Mathematics", "Physics", "Chemistry", "Computer Science"],
                "office_room": "Academic Wing Rm 102",
                "duty_responsibilities": "Oversees curriculum implementation, teacher performance audits, board exam readiness, and leads all wing coordinators.",
                "is_lead": True,
                "is_active": True,
            },
            {
                "employee_id": "EMP-C02",
                "staff_id": None,
                "user_id": None,
                "full_name": "Marcus Vance",
                "email": "marcus.vance@evergrowschools.edu",
                "phone_number": "9811000089",
                "designation": "Primary Wing Coordinator",
                "coordinator_type": "WING",
                "wing": "Primary Wing (Grades 1-5)",
                "allocated_grades": ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5"],
                "supervised_subjects": ["Foundational English", "Primary Maths", "Environmental Studies"],
                "office_room": "Junior Wing Rm 201",
                "duty_responsibilities": "Manages primary school lesson pacing, parent-teacher reviews, student reading programs, and formative learning milestones.",
                "is_lead": False,
                "is_active": True,
            },
            {
                "employee_id": "EMP-C03",
                "staff_id": None,
                "user_id": None,
                "full_name": "Ananya Sharma",
                "email": "ananya.sharma@evergrowschools.edu",
                "phone_number": "9811000090",
                "designation": "Middle School Coordinator",
                "coordinator_type": "WING",
                "wing": "Middle School Wing (Grades 6-8)",
                "allocated_grades": ["Grade 6", "Grade 7", "Grade 8"],
                "supervised_subjects": ["English Literature", "Integrated Science", "Social Studies", "Hindi"],
                "office_room": "Middle Block Rm 305",
                "duty_responsibilities": "Coordinates experiential learning modules, STEM practicals, mid-term evaluations, and student discipline for middle grades.",
                "is_lead": False,
                "is_active": True,
            },
            {
                "employee_id": "EMP-C04",
                "staff_id": None,
                "user_id": None,
                "full_name": "Dr. Kevin Patel",
                "email": "kevin.patel@evergrowschools.edu",
                "phone_number": "9811000091",
                "designation": "Examination & Evaluation Coordinator",
                "coordinator_type": "EXAMINATION",
                "wing": "Central Examination Cell",
                "allocated_grades": ["Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"],
                "supervised_subjects": ["CBSE Board Examinations", "Internal Assessments", "Question Paper Moderation"],
                "office_room": "Exam Control Center Rm 101",
                "duty_responsibilities": "Directs question paper sealing, hall seating plans, invigilator timetables, mark moderation, and CBSE board submission.",
                "is_lead": False,
                "is_active": True,
            },
            {
                "employee_id": "EMP-C05",
                "staff_id": None,
                "user_id": None,
                "full_name": "Priya Nair",
                "email": "priya.nair@evergrowschools.edu",
                "phone_number": "9811000092",
                "designation": "Co-Curricular & Events Coordinator",
                "coordinator_type": "ACTIVITY",
                "wing": "Whole Campus Activities",
                "allocated_grades": ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"],
                "supervised_subjects": ["Sports Tournaments", "Science Olympiads", "Performing Arts", "Model UN"],
                "office_room": "Activity Complex Studio 3",
                "duty_responsibilities": "Orchestrates inter-school competitions, annual day, sports meet, house events, and external student delegations.",
                "is_lead": False,
                "is_active": True,
            },
        ]

        for c_data in coordinators_data:
            existing_c = db.execute(
                select(CoordinatorProfile).where(CoordinatorProfile.employee_id == c_data["employee_id"])
            ).scalar_one_or_none()
            if not existing_c:
                new_cp = CoordinatorProfile(
                    id=uuid.uuid4(),
                    **c_data
                )
                db.add(new_cp)
                print(f"Added coordinator profile: {c_data['full_name']} ({c_data['designation']})")
            else:
                for k, v in c_data.items():
                    setattr(existing_c, k, v)
                print(f"Updated coordinator profile: {c_data['full_name']}")

        db.commit()
        print("Coordinators seeded successfully!")
    except Exception as e:
        db.rollback()
        print(f"Error seeding coordinators: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_coordinators()
