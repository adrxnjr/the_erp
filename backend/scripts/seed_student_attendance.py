import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import uuid
from datetime import date
from sqlalchemy import select
from app.db.session import SessionLocal
from app.models.student import Student
from app.models.user import User
from app.models.attendance import StudentAttendance
from app.models.academic import AcademicYear

def seed_student_attendance():
    db = SessionLocal()
    try:
        # Check active academic year
        ay = db.execute(select(AcademicYear).where(AcademicYear.is_active == True)).scalar_one_or_none()
        if not ay:
            print("[!] No active academic year found!")
            return

        # Fetch a staff user for marked_by_user_id
        staff_user = db.execute(select(User).where(User.username == "staff1")).scalar_one_or_none()
        if not staff_user:
            staff_user = db.execute(select(User).where(User.portal_type == "staff")).scalars().first()

        students = db.execute(select(Student)).scalars().all()
        print(f"[*] Found {len(students)} students in database.")

        # Class schedule mapping by day of week (0=Mon, 1=Tue, 2=Wed, 3=Thu, 4=Fri)
        daily_classes = {
            0: "Mathematics (Algebra), General Science (Biology), English Literature, Physical Education",
            1: "General Science (Chemistry), Mathematics (Geometry), Computer Science (Python Basics), Social Studies",
            2: "English Literature (Grammar), Mathematics (Calculus), Physics Lab Experiment, Library Reading",
            3: "Social Studies (History & Civics), Physics (Mechanics), Computer Science (Coding Lab), Mathematics",
            4: "Mathematics (Problem Solving), Chemistry Lab, English Literature (Poetry), Sports & Athletics",
        }

        # 16 working days leading up to 2026-11-02
        dates = [
            date(2026, 11, 2),
            date(2026, 10, 30),
            date(2026, 10, 29),
            date(2026, 10, 28),
            date(2026, 10, 27),
            date(2026, 10, 26),
            date(2026, 10, 23),
            date(2026, 10, 22),
            date(2026, 10, 21),
            date(2026, 10, 20),
            date(2026, 10, 19),
            date(2026, 10, 16),
            date(2026, 10, 15),
            date(2026, 10, 14),
            date(2026, 10, 13),
            date(2026, 10, 12),
        ]

        total_created = 0

        for idx, student in enumerate(students):
            for day_idx, d in enumerate(dates):
                weekday = d.weekday()
                class_summary = daily_classes.get(weekday, "General Academic Periods (Core Subjects)")

                # Designate 1 or 2 excused absent days for realism
                is_absent = (day_idx == 8 and idx % 2 == 0) or (day_idx == 4 and idx % 3 == 0)
                status = "absent" if is_absent else "present"

                if is_absent:
                    remarks = f"{class_summary} | Excused medical leave approved by Class Teacher"
                else:
                    remarks = f"{class_summary} | Full day roll-call signed off by Class Faculty"

                # Check if record already exists
                existing = db.execute(
                    select(StudentAttendance).where(
                        StudentAttendance.student_id == student.id,
                        StudentAttendance.attendance_date == d,
                        StudentAttendance.session == "full_day",
                    )
                ).scalar_one_or_none()

                if not existing:
                    att = StudentAttendance(
                        id=uuid.uuid4(),
                        student_id=student.id,
                        class_id=student.class_id,
                        section_id=student.section_id,
                        academic_year_id=student.academic_year_id or ay.id,
                        attendance_date=d,
                        session="full_day",
                        status=status,
                        remarks=remarks,
                        marked_by_user_id=staff_user.id,
                        is_locked=True,
                    )
                    db.add(att)
                    total_created += 1

        db.commit()
        print(f"[SUCCESS] Created {total_created} student attendance records across {len(students)} students!")

    except Exception as e:
        db.rollback()
        print(f"[!] Error seeding attendance: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_student_attendance()
