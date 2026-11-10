import os
import sys
from pathlib import Path
from sqlalchemy import select

from app.db.base import Base
from app.db.session import engine, SessionLocal
from app.core.logging import logger
from app.models.user import User
from app.models.student import Student


def init_db():
    """
    Ensure all database tables exist and essential seed data is present.
    Executes automatically on application startup.
    """
    logger.info("Verifying database schema...")
    Base.metadata.create_all(bind=engine)

    # Check if database has users and students
    db = SessionLocal()
    try:
        user_count = db.execute(select(User)).scalars().first()
        student_count = db.execute(select(Student)).scalars().first()

        if user_count is None or student_count is None:
            logger.info("Empty database detected. Running automated initial seeders...")
            scripts_dir = Path(__file__).resolve().parent.parent.parent / "scripts"

            # 1. Seed demo accounts (adrin, staff, staff3, principal, student1, parent1)
            try:
                from scripts.seed_demo_accounts import seed_demo_accounts
                seed_demo_accounts()
                logger.info("Demo accounts seeded successfully.")
            except Exception as e:
                logger.warning(f"Note on demo accounts seed: {e}")

            # 2. Seed 150 students, teachers and timetable from schoolData.json
            try:
                from scripts.seed_from_user_json import seed as seed_json
                seed_json()
                logger.info("Authentic 150 students seeded successfully.")
            except Exception as e:
                logger.warning(f"Note on json dataset seed: {e}")

            # 3. Seed tuition centers
            try:
                from scripts.seed_tuitions import seed_tuition_centers
                seed_tuition_centers()
                logger.info("Tuition centers seeded successfully.")
            except Exception as e:
                logger.warning(f"Note on tuition centers seed: {e}")

    except Exception as e:
        logger.error(f"Error checking/seeding initial database: {e}")
    finally:
        db.close()
