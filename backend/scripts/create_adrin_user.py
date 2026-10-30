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
from app.db.session import SessionLocal
from app.core.security import hash_password
from app.models.user import User, Role, UserRole
from app.models.staff import Staff

def create_or_update_adrin():
    db = SessionLocal()
    try:
        # Find or create super_admin role
        super_admin_role = db.execute(select(Role).where(Role.name == "super_admin")).scalar_one_or_none()
        if not super_admin_role:
            super_admin_role = Role(
                id=uuid.uuid4(),
                name="super_admin",
                description="System Administrator with full organizational oversight",
                is_active=True,
            )
            db.add(super_admin_role)
            db.flush()

        # Check if adrin already exists
        adrin = db.execute(select(User).where(User.username == "adrin")).scalar_one_or_none()
        hashed = hash_password("123")

        if not adrin:
            adrin = User(
                id=uuid.uuid4(),
                username="adrin",
                email="adrin@evergrowschools.edu",
                hashed_password=hashed,
                full_name="Adrin (Super Admin)",
                portal_type="staff",
                is_active=True,
                is_locked=False,
                failed_login_attempts=0,
            )
            db.add(adrin)
            db.flush()
            print("[OK] User 'adrin' created with password '123'")
        else:
            # Update password and unlock if needed
            adrin.hashed_password = hashed
            adrin.is_active = True
            adrin.is_locked = False
            adrin.failed_login_attempts = 0
            adrin.portal_type = "staff"
            print("[OK] User 'adrin' updated with password '123'")

        # Ensure user has super_admin role
        has_role = db.execute(
            select(UserRole).where(
                UserRole.user_id == adrin.id,
                UserRole.role_id == super_admin_role.id,
            )
        ).scalar_one_or_none()

        if not has_role:
            db.add(UserRole(id=uuid.uuid4(), user_id=adrin.id, role_id=super_admin_role.id))
            db.flush()
            print("[OK] Assigned role 'super_admin' to user 'adrin'")

        # Ensure Staff record exists
        staff_rec = db.execute(select(Staff).where(Staff.user_id == adrin.id)).scalar_one_or_none()
        if not staff_rec:
            staff_rec = Staff(
                id=uuid.uuid4(),
                employee_id="EMP-ADRIN-01",
                full_name="Adrin (Super Admin)",
                email="adrin@evergrowschools.edu",
                phone_number="9999999999",
                designation="Executive Super Administrator",
                department="Management",
                staff_type="non_teaching",
                joining_date=date(2024, 1, 1),
                is_active=True,
                user_id=adrin.id,
            )
            db.add(staff_rec)
            db.flush()
            print("[OK] Staff employee record created for 'adrin'")

        db.commit()
        print("\nSuccess: Username 'adrin' with password '123' is now live with Super Admin privileges!")

    except Exception as e:
        db.rollback()
        print(f"Error: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    create_or_update_adrin()
