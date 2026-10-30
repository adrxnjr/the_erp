import os
import uuid
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool

os.environ.setdefault("DISABLE_SQLALCHEMY_CEXT", "1")

from app.core.security import hash_password
from app.core.rate_limit import limiter
from app.db.base import Base
from app.db.dependencies import get_db
from app.main import app
from app.models.user import Role, User, UserRole

# Disable rate limiter during testing
limiter.enabled = False

# SQLite in-memory engine shared across threads for testing
test_engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    """Initializes the database schema before test suite execution."""
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)


@pytest.fixture
def db_session():
    """Provides a transactional database session per test with automatic rollback."""
    connection = test_engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)

    yield session

    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture
def client(db_session: Session):
    """Provides a TestClient with the database dependency overridden."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def test_roles(db_session: Session):
    """Seeds standard roles for tests."""
    roles = {}
    for name in ["super_admin", "school_admin", "teacher", "parent", "student", "accountant"]:
        role = Role(id=uuid.uuid4(), name=name, description=f"{name} role", is_active=True)
        db_session.add(role)
        roles[name] = role
    db_session.commit()
    return roles


@pytest.fixture
def super_admin_user(db_session: Session, test_roles):
    """Creates a seeded super_admin user."""
    user = User(
        id=uuid.uuid4(),
        username="superadmin_test",
        email="superadmin@test.local",
        hashed_password=hash_password("SuperSecret123!"),
        full_name="Test Super Admin",
        portal_type="staff",
        is_active=True,
        is_locked=False,
        failed_login_attempts=0,
        must_change_password=False,
    )
    db_session.add(user)
    db_session.flush()

    ur = UserRole(id=uuid.uuid4(), user_id=user.id, role_id=test_roles["super_admin"].id)
    db_session.add(ur)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def teacher_user(db_session: Session, test_roles):
    """Creates a seeded teacher staff user."""
    user = User(
        id=uuid.uuid4(),
        username="teacher_test",
        email="teacher@test.local",
        hashed_password=hash_password("TeacherSecret123!"),
        full_name="Test Teacher",
        portal_type="staff",
        is_active=True,
        is_locked=False,
        failed_login_attempts=0,
        must_change_password=False,
    )
    db_session.add(user)
    db_session.flush()

    ur = UserRole(id=uuid.uuid4(), user_id=user.id, role_id=test_roles["teacher"].id)
    db_session.add(ur)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def parent_user(db_session: Session, test_roles):
    """Creates a seeded parent user."""
    user = User(
        id=uuid.uuid4(),
        username="parent_test",
        email="parent@test.local",
        hashed_password=hash_password("ParentSecret123!"),
        full_name="Test Parent",
        portal_type="parent_student",
        is_active=True,
        is_locked=False,
        failed_login_attempts=0,
        must_change_password=False,
    )
    db_session.add(user)
    db_session.flush()

    ur = UserRole(id=uuid.uuid4(), user_id=user.id, role_id=test_roles["parent"].id)
    db_session.add(ur)
    db_session.commit()
    db_session.refresh(user)
    return user
