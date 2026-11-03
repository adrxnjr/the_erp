import sys
import uuid
from datetime import datetime, timezone

sys.path.insert(0, "backend")

from app.db.session import engine, SessionLocal
from app.db.base import Base
from app.models.tuition import TuitionCenter, TuitionTeacher, TuitionBatch, TuitionEnquiry


SAMPLE_CENTERS = [
    {
        "name": "Apex Science & Math Academy",
        "description": "Premier tutoring institute specializing in CBSE & ICSE STEM coaching, advanced calculus, and analytical physics.",
        "address": "100ft Road, Near Metro Station, Indiranagar",
        "area": "Indiranagar",
        "city": "Bangalore",
        "pincode": "560038",
        "contact_phone": "+91 80 4123 5678",
        "contact_email": "contact@apexacademy.edu.in",
        "website": "https://apexacademy.edu.in",
        "is_approved": True,
        "is_active": True,
        "teachers": [
            {
                "teacher_name": "Dr. R. Narayanan",
                "qualification": "Ph.D. Pure Mathematics, B.Ed",
                "experience_years": 14,
                "subjects_taught": ["Mathematics", "Calculus"],
                "rating": 4.9,
            },
            {
                "teacher_name": "Anita Rao",
                "qualification": "M.Sc Physics, B.Ed",
                "experience_years": 9,
                "subjects_taught": ["Physics", "General Science"],
                "rating": 4.8,
            },
        ],
        "batches": [
            {
                "subject_name": "Mathematics",
                "days_of_week": ["Mon", "Wed", "Fri"],
                "start_time": "17:00",
                "end_time": "18:30",
                "fee_per_month": 2500.0,
                "batch_size_max": 15,
                "current_enrolled": 8,
                "teacher_idx": 0,
            },
            {
                "subject_name": "Physics",
                "days_of_week": ["Tue", "Thu", "Sat"],
                "start_time": "17:00",
                "end_time": "18:30",
                "fee_per_month": 2400.0,
                "batch_size_max": 15,
                "current_enrolled": 6,
                "teacher_idx": 1,
            },
            {
                "subject_name": "General Science",
                "days_of_week": ["Mon", "Wed", "Fri"],
                "start_time": "10:00",
                "end_time": "11:30",
                "fee_per_month": 2200.0,
                "batch_size_max": 12,
                "current_enrolled": 4,
                "teacher_idx": 1,
            },
        ],
    },
    {
        "name": "Quantum Scholars Learning Hub",
        "description": "High-tech learning center with interactive problem-solving labs for computer science, robotics, and physical chemistry.",
        "address": "4th Block, 80ft Road, Koramangala",
        "area": "Koramangala",
        "city": "Bangalore",
        "pincode": "560034",
        "contact_phone": "+91 80 2553 8899",
        "contact_email": "support@quantumscholars.in",
        "website": "https://quantumscholars.in",
        "is_approved": True,
        "is_active": True,
        "teachers": [
            {
                "teacher_name": "Prof. Vikram Sengupta",
                "qualification": "M.Tech Computer Science, B.Tech IIT",
                "experience_years": 11,
                "subjects_taught": ["Computer Science", "Mathematics"],
                "rating": 4.9,
            },
            {
                "teacher_name": "Meenakshi Sundaram",
                "qualification": "M.Sc Analytical Chemistry",
                "experience_years": 8,
                "subjects_taught": ["Chemistry", "General Science"],
                "rating": 4.7,
            },
        ],
        "batches": [
            {
                "subject_name": "Computer Science",
                "days_of_week": ["Tue", "Thu", "Sat"],
                "start_time": "17:30",
                "end_time": "19:00",
                "fee_per_month": 2800.0,
                "batch_size_max": 12,
                "current_enrolled": 7,
                "teacher_idx": 0,
            },
            {
                "subject_name": "Chemistry",
                "days_of_week": ["Mon", "Wed", "Fri"],
                "start_time": "16:00",
                "end_time": "17:30",
                "fee_per_month": 2300.0,
                "batch_size_max": 15,
                "current_enrolled": 9,
                "teacher_idx": 1,
            },
            {
                "subject_name": "Mathematics",
                "days_of_week": ["Sat", "Sun"],
                "start_time": "09:30",
                "end_time": "11:30",
                "fee_per_month": 2600.0,
                "batch_size_max": 15,
                "current_enrolled": 10,
                "teacher_idx": 0,
            },
        ],
    },
    {
        "name": "Pioneer Academic Excellence Center",
        "description": "Comprehensive school foundation program covering languages, social sciences, and CBSE science curriculum.",
        "address": "ITPB Main Road, Opposite Forum Mall, Whitefield",
        "area": "Whitefield",
        "city": "Bangalore",
        "pincode": "560066",
        "contact_phone": "+91 80 6712 3456",
        "contact_email": "admissions@pioneertuitions.com",
        "website": "https://pioneertuitions.com",
        "is_approved": True,
        "is_active": True,
        "teachers": [
            {
                "teacher_name": "Sarah D'Souza",
                "qualification": "M.A. English Literature, B.Ed",
                "experience_years": 12,
                "subjects_taught": ["English", "Social Studies"],
                "rating": 4.8,
            },
            {
                "teacher_name": "Dr. Harish Kumar",
                "qualification": "Ph.D. Biology & Life Sciences",
                "experience_years": 10,
                "subjects_taught": ["Biology", "General Science"],
                "rating": 4.9,
            },
        ],
        "batches": [
            {
                "subject_name": "English",
                "days_of_week": ["Tue", "Thu"],
                "start_time": "16:30",
                "end_time": "18:00",
                "fee_per_month": 1800.0,
                "batch_size_max": 15,
                "current_enrolled": 5,
                "teacher_idx": 0,
            },
            {
                "subject_name": "General Science",
                "days_of_week": ["Mon", "Wed", "Fri"],
                "start_time": "18:00",
                "end_time": "19:30",
                "fee_per_month": 2200.0,
                "batch_size_max": 15,
                "current_enrolled": 8,
                "teacher_idx": 1,
            },
            {
                "subject_name": "Mathematics",
                "days_of_week": ["Mon", "Wed", "Fri"],
                "start_time": "16:30",
                "end_time": "18:00",
                "fee_per_month": 2100.0,
                "batch_size_max": 15,
                "current_enrolled": 6,
                "teacher_idx": 1,
            },
        ],
    },
]


def seed_tuitions():
    # 1. Ensure tables are created
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        created_centers = 0
        for c_data in SAMPLE_CENTERS:
            existing = db.query(TuitionCenter).filter_by(name=c_data["name"]).first()
            if not existing:
                center = TuitionCenter(
                    id=uuid.uuid4(),
                    name=c_data["name"],
                    description=c_data["description"],
                    address=c_data["address"],
                    area=c_data["area"],
                    city=c_data["city"],
                    pincode=c_data["pincode"],
                    contact_phone=c_data["contact_phone"],
                    contact_email=c_data["contact_email"],
                    website=c_data["website"],
                    is_approved=c_data["is_approved"],
                    is_active=c_data["is_active"],
                    created_at=datetime.now(timezone.utc),
                    updated_at=datetime.now(timezone.utc),
                )
                db.add(center)
                db.flush()

                # Add teachers
                teacher_objs = []
                for t_data in c_data["teachers"]:
                    t = TuitionTeacher(
                        id=uuid.uuid4(),
                        tuition_center_id=center.id,
                        teacher_name=t_data["teacher_name"],
                        qualification=t_data["qualification"],
                        experience_years=t_data["experience_years"],
                        subjects_taught=t_data["subjects_taught"],
                        rating=t_data["rating"],
                        is_active=True,
                    )
                    db.add(t)
                    teacher_objs.append(t)
                db.flush()

                # Add batches
                for b_data in c_data["batches"]:
                    assigned_teacher = (
                        teacher_objs[b_data["teacher_idx"]]
                        if b_data.get("teacher_idx") is not None and b_data["teacher_idx"] < len(teacher_objs)
                        else None
                    )
                    b = TuitionBatch(
                        id=uuid.uuid4(),
                        tuition_center_id=center.id,
                        teacher_id=assigned_teacher.id if assigned_teacher else None,
                        subject_name=b_data["subject_name"],
                        days_of_week=b_data["days_of_week"],
                        start_time=b_data["start_time"],
                        end_time=b_data["end_time"],
                        fee_per_month=b_data["fee_per_month"],
                        batch_size_max=b_data["batch_size_max"],
                        current_enrolled=b_data["current_enrolled"],
                        is_active=True,
                    )
                    db.add(b)

                created_centers += 1

        db.commit()
        print(f"[OK] Successfully initialized tuition database and seeded {created_centers} tuition centers.")
    except Exception as e:
        db.rollback()
        print(f"[ERROR] Seeding tuitions failed: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    seed_tuitions()

