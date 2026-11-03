import uuid
from datetime import datetime, timezone, date
import sys
sys.path.insert(0, "backend")

from app.db.session import SessionLocal
from app.models.student import Enquiry

SAMPLE_ENQUIRIES = [
    {
        "enquiry_number": "ENQ-2026-0002",
        "student_name": "Sophia Miller",
        "gender": "Female",
        "grade_applying_for": "Grade 6",
        "parent_name": "David Miller",
        "parent_phone": "+91 9876543210",
        "parent_email": "david.miller@example.com",
        "address": "42 Orchard Boulevard, Phase 2, Bangalore",
        "status": "submitted",
        "notes": "Transferring from Delhi Public School. Advanced in mathematics, competitive robotics, and swimming.",
    },
    {
        "enquiry_number": "ENQ-2026-0003",
        "student_name": "Aarav Patel",
        "gender": "Male",
        "grade_applying_for": "Grade 9",
        "parent_name": "Sunita Patel",
        "parent_phone": "+91 9812345678",
        "parent_email": "sunita.patel@example.com",
        "address": "15 Palm Meadows, Whitefield, Bangalore",
        "status": "under_review",
        "notes": "Inquiring about CBSE curriculum, physics laboratory facilities, and school transport route 14.",
    },
    {
        "enquiry_number": "ENQ-2026-0004",
        "student_name": "Emily Chen",
        "gender": "Female",
        "grade_applying_for": "Grade 11",
        "parent_name": "Michael Chen",
        "parent_phone": "+91 9923456789",
        "parent_email": "m.chen@example.com",
        "address": "77 Indiranagar 100ft Road, Bangalore",
        "status": "shortlisted",
        "notes": "National Science Olympiad qualifier. Strong inclination toward Science Stream Group 1 (PCM + Computer Science).",
    },
    {
        "enquiry_number": "ENQ-2026-0005",
        "student_name": "Rahul Sharma",
        "gender": "Male",
        "grade_applying_for": "Grade 3",
        "parent_name": "Priya Sharma",
        "parent_phone": "+91 9845612345",
        "parent_email": "priya.sharma@example.com",
        "address": "102 Ferns Residency, Doddanekundi, Bangalore",
        "status": "converted",
        "notes": "Sibling of current Grade 5 student Liam Smith. Application verified and admission confirmed.",
    },
    {
        "enquiry_number": "ENQ-2026-0006",
        "student_name": "Jessica Brown",
        "gender": "Female",
        "grade_applying_for": "Grade 1",
        "parent_name": "Robert Brown",
        "parent_phone": "+91 9765432109",
        "parent_email": "robert.b@example.com",
        "address": "8 Green Glen Layout, Bellandur, Bangalore",
        "status": "submitted",
        "notes": "Seeking primary school admission for academic year 2026-2027. Requires afternoon bus drop-off service.",
    },
    {
        "enquiry_number": "ENQ-2026-0007",
        "student_name": "Karthik Raja",
        "gender": "Male",
        "grade_applying_for": "Grade 8",
        "parent_name": "Venkatesh Raja",
        "parent_phone": "+91 9888123456",
        "parent_email": "venkatesh.r@example.com",
        "address": "23 Koramangala 4th Block, Bangalore",
        "status": "under_review",
        "notes": "Staff referral inquiry submitted via staff portal. Keen interest in campus sports academy.",
    },
]

def seed_enquiries():
    db = SessionLocal()
    try:
        count = 0
        for item in SAMPLE_ENQUIRIES:
            existing = db.query(Enquiry).filter_by(enquiry_number=item["enquiry_number"]).first()
            if not existing:
                enq = Enquiry(
                    id=uuid.uuid4(),
                    enquiry_number=item["enquiry_number"],
                    student_name=item["student_name"],
                    gender=item.get("gender"),
                    grade_applying_for=item["grade_applying_for"],
                    parent_name=item["parent_name"],
                    parent_phone=item["parent_phone"],
                    parent_email=item.get("parent_email"),
                    address=item.get("address"),
                    status=item["status"],
                    notes=item.get("notes"),
                    created_at=datetime.now(timezone.utc),
                )
                db.add(enq)
                count += 1
        db.commit()
        print(f"[OK] Successfully seeded {count} sample admission enquiries.")
    except Exception as e:
        db.rollback()
        print(f"[ERROR] Seeding enquiries failed: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_enquiries()

