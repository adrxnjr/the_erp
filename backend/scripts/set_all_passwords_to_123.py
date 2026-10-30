import os
import sys
from pathlib import Path

os.environ.setdefault("DISABLE_SQLALCHEMY_CEXT", "1")
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from sqlalchemy import select
from app.db.session import SessionLocal
from app.core.security import hash_password, verify_password
from app.models.user import User

def set_all_passwords():
    db = SessionLocal()
    new_hash = hash_password("123")
    assert verify_password("123", new_hash), "Password verification self-check failed!"

    try:
        users = db.execute(select(User)).scalars().all()
        print(f"Updating passwords for {len(users)} users to '123'...")
        for u in users:
            u.hashed_password = new_hash
            u.is_locked = False
            u.failed_login_attempts = 0
            u.is_active = True
            u.must_change_password = False
            print(f" - {u.username:<18} (portal: {u.portal_type}) -> password set to '123'")
        
        db.commit()
        print("\n[SUCCESS] All users now have password '123' and accounts are unlocked.")
    except Exception as e:
        db.rollback()
        print(f"[ERROR] Failed to update passwords: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    set_all_passwords()
