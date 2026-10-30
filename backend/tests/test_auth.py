import uuid
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.models.user import User, UserRole


def test_successful_staff_login(client: TestClient, teacher_user):
    """Verify successful login for staff account into the staff portal."""
    response = client.post(
        "/api/v1/auth/login",
        json={
            "portal_type": "staff",
            "username": "teacher_test",
            "password": "TeacherSecret123!",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["portal_type"] == "staff"
    assert "teacher" in data["roles"]


def test_successful_parent_login(client: TestClient, parent_user):
    """Verify successful login for parent into the parent_student portal."""
    response = client.post(
        "/api/v1/auth/login",
        json={
            "portal_type": "parent_student",
            "username": "parent_test",
            "password": "ParentSecret123!",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["portal_type"] == "parent_student"
    assert "parent" in data["roles"]


def test_wrong_password_returns_401(client: TestClient, teacher_user):
    """Verify generic 401 response on wrong password."""
    response = client.post(
        "/api/v1/auth/login",
        json={
            "portal_type": "staff",
            "username": "teacher_test",
            "password": "WrongPassword999!",
        },
    )
    assert response.status_code == 401
    assert "Invalid credentials" in response.text


def test_incorrect_portal_selection_rejected(client: TestClient, teacher_user):
    """Verify that a staff user attempting to log into parent_student portal is rejected with 403."""
    response = client.post(
        "/api/v1/auth/login",
        json={
            "portal_type": "parent_student",
            "username": "teacher_test",
            "password": "TeacherSecret123!",
        },
    )
    assert response.status_code == 403
    assert "PORTAL_INCOMPATIBLE" in response.text


def test_account_lockout_after_five_failures(client: TestClient, teacher_user, db_session: Session):
    """Verify account locks automatically after 5 consecutive failed login attempts."""
    for i in range(5):
        resp = client.post(
            "/api/v1/auth/login",
            json={
                "portal_type": "staff",
                "username": "teacher_test",
                "password": f"WrongAttempt{i}!",
            },
        )
        assert resp.status_code == 401

    # Sixth attempt with CORRECT password should be rejected because account is now locked
    locked_resp = client.post(
        "/api/v1/auth/login",
        json={
            "portal_type": "staff",
            "username": "teacher_test",
            "password": "TeacherSecret123!",
        },
    )
    assert locked_resp.status_code == 403
    assert "ACCOUNT_LOCKED" in locked_resp.text


def test_inactive_user_cannot_login(client: TestClient, db_session: Session, test_roles):
    """Verify that deactivated accounts cannot log in."""
    user = User(
        id=uuid.uuid4(),
        username="inactive_user",
        email="inactive@test.local",
        hashed_password=hash_password("InactiveSecret123!"),
        full_name="Inactive User",
        portal_type="staff",
        is_active=False,
        is_locked=False,
    )
    db_session.add(user)
    db_session.flush()
    ur = UserRole(id=uuid.uuid4(), user_id=user.id, role_id=test_roles["teacher"].id)
    db_session.add(ur)
    db_session.commit()

    response = client.post(
        "/api/v1/auth/login",
        json={
            "portal_type": "staff",
            "username": "inactive_user",
            "password": "InactiveSecret123!",
        },
    )
    assert response.status_code == 403
    assert "ACCOUNT_DEACTIVATED" in response.text


def test_refresh_token_rotation(client: TestClient, teacher_user):
    """Verify refresh token rotation issues new tokens and invalidates the previous refresh token."""
    login_resp = client.post(
        "/api/v1/auth/login",
        json={
            "portal_type": "staff",
            "username": "teacher_test",
            "password": "TeacherSecret123!",
        },
    )
    tokens = login_resp.json()
    first_refresh = tokens["refresh_token"]

    # Rotate token
    rotate_resp = client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": first_refresh},
    )
    assert rotate_resp.status_code == 200
    rotated_tokens = rotate_resp.json()
    assert rotated_tokens["refresh_token"] != first_refresh

    # Using the old refresh token must now be rejected
    reuse_resp = client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": first_refresh},
    )
    assert reuse_resp.status_code == 401
    assert "REVOKED_REFRESH_TOKEN" in reuse_resp.text


def test_get_me_profile(client: TestClient, teacher_user):
    """Verify /api/v1/auth/me returns authenticated user details."""
    login_resp = client.post(
        "/api/v1/auth/login",
        json={
            "portal_type": "staff",
            "username": "teacher_test",
            "password": "TeacherSecret123!",
        },
    )
    access_token = login_resp.json()["access_token"]

    me_resp = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {access_token}"},
    )
    assert me_resp.status_code == 200
    data = me_resp.json()
    assert data["username"] == "teacher_test"
    assert "teacher" in data["roles"]
