import os
import sys
import uuid
from pathlib import Path

# Ensure pure-python SQLAlchemy and sys.path
os.environ.setdefault("DISABLE_SQLALCHEMY_CEXT", "1")
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from sqlalchemy import select
from app.db.session import SessionLocal
from app.models.user import Role, User, UserRole
from app.core.security import hash_password

INITIAL_ROLES = [
    ("super_admin", "System Administrator with full organizational oversight"),
    ("principal", "School Principal"),
    ("correspondent", "School Correspondent"),
    ("school_admin", "School Office Administrator"),
    ("teacher", "Teaching Staff"),
    ("accountant", "Accounts & Finance Staff"),
    ("non_teaching", "Non-Teaching Administrative Staff"),
    ("driver", "School Transport Driver"),
    ("parent", "Parent / Legal Guardian"),
    ("student", "Enrolled Student"),
]


def seed():
    db = SessionLocal()
    try:
        print("Checking roles...")
        role_map = {}
        for role_name, desc in INITIAL_ROLES:
            stmt = select(Role).where(Role.name == role_name)
            role = db.execute(stmt).scalar_one_or_none()
            if not role:
                role = Role(
                    id=uuid.uuid4(),
                    name=role_name,
                    description=desc,
                    is_active=True,
                )
                db.add(role)
                db.flush()
                print(f"Created role: {role_name}")
            role_map[role_name] = role

        # Check super_admin user
        admin_username = os.environ.get("ADMIN_USERNAME", "superadmin")
        admin_password = os.environ.get("ADMIN_PASSWORD", "SuperAdmin@2026!")

        stmt = select(User).where(User.username == admin_username)
        admin = db.execute(stmt).scalar_one_or_none()
        if not admin:
            admin = User(
                id=uuid.uuid4(),
                username=admin_username,
                email="superadmin@school.internal",
                hashed_password=hash_password(admin_password),
                full_name="System Super Administrator",
                portal_type="staff",
                is_active=True,
                is_locked=False,
                must_change_password=False,
            )
            db.add(admin)
            db.flush()

            # Assign super_admin role
            ur = UserRole(
                id=uuid.uuid4(),
                user_id=admin.id,
                role_id=role_map["super_admin"].id,
            )
            db.add(ur)
            print(f"Created initial super_admin user '{admin_username}' with password '{admin_password}'")
        else:
            print(f"User '{admin_username}' already exists.")

        db.commit()
        print("Seeding completed successfully!")
    except Exception as e:
        db.rollback()
        print(f"Seeding failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
