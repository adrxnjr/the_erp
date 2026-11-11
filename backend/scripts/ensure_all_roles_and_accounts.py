import os
import sys
import uuid

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.db.session import SessionLocal
from app.models.user import Role, User, UserRole
from app.core.security import hash_password

def ensure_roles_and_accounts():
    db = SessionLocal()
    try:
        # 1. Define required roles
        roles_to_ensure = [
            ("super_admin", "Super Administrator - Full governance and configuration access"),
            ("vice_admin", "Vice Administrator - Operations and administrative oversight"),
            ("coordinator", "Academic & Wing Coordinator"),
            ("teacher", "Teaching Faculty & Academic Marks Evaluator"),
            ("parent", "Parent & Legal Guardian Portal Access"),
            ("student", "Enrolled Student Academy Access"),
            ("principal", "Principal & Head of Institution"),
            ("school_admin", "School Administration & Operational Staff"),
        ]

        role_objs = {}
        for r_name, r_desc in roles_to_ensure:
            role = db.query(Role).filter_by(name=r_name).first()
            if not role:
                role = Role(id=uuid.uuid4(), name=r_name, description=r_desc, is_active=True)
                db.add(role)
                db.flush()
                print(f"[CREATED ROLE] {r_name}")
            else:
                role_objs[r_name] = role
                print(f"[EXISTS ROLE] {r_name}")
            role_objs[r_name] = role

        # 2. Define key users
        users_to_ensure = [
            {
                "username": "adrin",
                "full_name": "Adrin (Super Admin)",
                "email": "adrin@evergrow.edu",
                "portal_type": "staff",
                "roles": ["super_admin"],
            },
            {
                "username": "viceadmin",
                "full_name": "Dr. Marcus Vance (Vice Admin)",
                "email": "viceadmin@evergrow.edu",
                "portal_type": "staff",
                "roles": ["vice_admin"],
            },
            {
                "username": "coordinator1",
                "full_name": "Dr. Elena Rostova",
                "email": "coordinator1@evergrow.edu",
                "portal_type": "staff",
                "roles": ["coordinator"],
            },
            {
                "username": "staff3",
                "full_name": "Michael Chang (Teacher)",
                "email": "staff3@evergrow.edu",
                "portal_type": "staff",
                "roles": ["teacher"],
            },
            {
                "username": "teacher1",
                "full_name": "Michael Chang (Teacher)",
                "email": "teacher1@evergrow.edu",
                "portal_type": "staff",
                "roles": ["teacher"],
            },
            {
                "username": "staff",
                "full_name": "Office Desk Staff",
                "email": "office.desk@evergrow.edu",
                "portal_type": "staff",
                "roles": ["school_admin", "teacher"],
            },
            {
                "username": "principal",
                "full_name": "Dr. Arthur Vance",
                "email": "principal@evergrow.edu",
                "portal_type": "staff",
                "roles": ["principal", "school_admin"],
            },
            {
                "username": "parent1",
                "full_name": "Rajesh Sharma (Parent)",
                "email": "parent1@evergrow.edu",
                "portal_type": "parent_student",
                "roles": ["parent"],
            },
            {
                "username": "student1",
                "full_name": "Liam Smith (Student)",
                "email": "student1@evergrow.edu",
                "portal_type": "parent_student",
                "roles": ["student"],
            },
        ]

        pwd_hash = hash_password("123")

        for u_data in users_to_ensure:
            user = db.query(User).filter_by(username=u_data["username"]).first()
            if not user:
                user = User(
                    id=uuid.uuid4(),
                    username=u_data["username"],
                    full_name=u_data["full_name"],
                    email=u_data["email"],
                    hashed_password=pwd_hash,
                    portal_type=u_data["portal_type"],
                    is_active=True,
                    is_locked=False,
                    failed_login_attempts=0,
                )
                db.add(user)
                db.flush()
                print(f"[CREATED USER] {user.username}")
            else:
                user.hashed_password = pwd_hash
                user.is_active = True
                user.is_locked = False
                user.failed_login_attempts = 0
                print(f"[UPDATED USER] {user.username}")

            # Ensure roles attached
            for r_name in u_data["roles"]:
                target_role = role_objs.get(r_name)
                if target_role:
                    existing_ur = db.query(UserRole).filter_by(user_id=user.id, role_id=target_role.id).first()
                    if not existing_ur:
                        db.add(UserRole(id=uuid.uuid4(), user_id=user.id, role_id=target_role.id))
                        print(f"  + Assigned role {r_name} to {user.username}")

        db.commit()
        print("[SUCCESS] All roles and users verified and configured!")

    except Exception as e:
        db.rollback()
        print(f"[ERROR] {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    ensure_roles_and_accounts()
