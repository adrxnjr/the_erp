import uuid
from fastapi.testclient import TestClient


def test_super_admin_can_create_user(client: TestClient, super_admin_user, test_roles):
    """Verify super_admin can create new users and assign roles."""
    login_resp = client.post(
        "/api/v1/auth/login",
        json={
            "portal_type": "staff",
            "username": "superadmin_test",
            "password": "SuperSecret123!",
        },
    )
    token = login_resp.json()["access_token"]

    resp = client.post(
        "/api/v1/users",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "username": "new_teacher",
            "email": "newteacher@school.internal",
            "password": "TempPassword123!",
            "full_name": "New Teacher Name",
            "phone_number": "1234567890",
            "portal_type": "staff",
            "role_ids": [str(test_roles["teacher"].id)],
        },
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["username"] == "new_teacher"
    assert "teacher" in data["roles"]


def test_regular_staff_cannot_create_user(client: TestClient, teacher_user, test_roles):
    """Verify non-super_admin staff cannot access user management (HTTP 403)."""
    login_resp = client.post(
        "/api/v1/auth/login",
        json={
            "portal_type": "staff",
            "username": "teacher_test",
            "password": "TeacherSecret123!",
        },
    )
    token = login_resp.json()["access_token"]

    resp = client.post(
        "/api/v1/users",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "username": "unauthorized_user",
            "password": "Password123!",
            "full_name": "Unauthorized",
            "portal_type": "staff",
            "role_ids": [str(test_roles["teacher"].id)],
        },
    )
    assert resp.status_code == 403
    assert "FORBIDDEN_ROLE" in resp.text


def test_cannot_deactivate_last_super_admin(client: TestClient, super_admin_user):
    """Verify the business invariant: the last active super_admin cannot be deactivated."""
    login_resp = client.post(
        "/api/v1/auth/login",
        json={
            "portal_type": "staff",
            "username": "superadmin_test",
            "password": "SuperSecret123!",
        },
    )
    token = login_resp.json()["access_token"]

    resp = client.patch(
        f"/api/v1/users/{super_admin_user.id}",
        headers={"Authorization": f"Bearer {token}"},
        json={"is_active": False},
    )
    assert resp.status_code == 400
    assert "CANNOT_REMOVE_LAST_SUPER_ADMIN" in resp.text
