import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.db.session import SessionLocal
from app.models.student import Student
from app.models.rewards import RewardItem, Badge
from app.services.rewards_service import RewardsService

def test():
    db = SessionLocal()
    try:
        student = db.query(Student).filter(Student.full_name.like("%Liam%")).first()
        if not student:
            student = db.query(Student).first()
        print(f"Testing with student: {student.full_name} ({student.id})")

        # 1. Test Summary
        summary = RewardsService.get_points_summary(student.id, db)
        print("Summary retrieved successfully!")
        print(f"Total points: {summary['total_points']}, Level: {summary['current_level']}, Progress: {summary['progress_percent']}%")
        print(f"Earned Badges: {len(summary['earned_badges'])}, All Badges: {len(summary['all_badges'])}")

        # 2. Test School Leaderboard
        school_lb = RewardsService.get_school_leaderboard(db, limit=5)
        print(f"School leaderboard top count: {len(school_lb)}")
        for entry in school_lb:
            print(f"  #{entry['rank']} {entry['student_name']} - {entry['total_points']} pts ({entry['current_level']})")

        # 3. Test Certificate PDF generation
        pdf_bytes = RewardsService.generate_certificate_pdf(student.id, db)
        print(f"Certificate generated successfully! PDF size: {len(pdf_bytes)} bytes")
        assert len(pdf_bytes) > 1000

        print("\nALL REWARDS BACKEND LOGIC VERIFIED SUCCESSFULLY!")
    finally:
        db.close()

if __name__ == "__main__":
    test()
