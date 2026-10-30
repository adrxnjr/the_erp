from fastapi.testclient import TestClient


def test_academic_year_lifecycle_and_single_active(client: TestClient, super_admin_user):
    """Verify academic year creation, and that activating a year automatically enforces single-active invariant."""
    login_resp = client.post(
        "/api/v1/auth/login",
        json={
            "portal_type": "staff",
            "username": "superadmin_test",
            "password": "SuperSecret123!",
        },
    )
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Create Year 1 (Active)
    resp1 = client.post(
        "/api/v1/academic/years",
        headers=headers,
        json={
            "name": "2025-2026",
            "start_date": "2025-06-01",
            "end_date": "2026-04-30",
            "is_active": True,
        },
    )
    assert resp1.status_code == 201
    year1_id = resp1.json()["id"]

    # Create Year 2 (Active) -> Should automatically deactivate Year 1
    resp2 = client.post(
        "/api/v1/academic/years",
        headers=headers,
        json={
            "name": "2026-2027",
            "start_date": "2026-06-01",
            "end_date": "2027-04-30",
            "is_active": True,
        },
    )
    assert resp2.status_code == 201
    year2_id = resp2.json()["id"]

    # List years and verify only Year 2 is active
    list_resp = client.get("/api/v1/academic/years")
    assert list_resp.status_code == 200
    years = {y["id"]: y["is_active"] for y in list_resp.json()}
    assert years[year1_id] is False
    assert years[year2_id] is True


def test_duplicate_class_rejected(client: TestClient, super_admin_user):
    """Verify that creating two classes with the same name is rejected with 409."""
    login_resp = client.post(
        "/api/v1/auth/login",
        json={
            "portal_type": "staff",
            "username": "superadmin_test",
            "password": "SuperSecret123!",
        },
    )
    headers = {"Authorization": f"Bearer {login_resp.json()['access_token']}"}

    c1 = client.post("/api/v1/academic/classes", headers=headers, json={"name": "Grade 5", "level": 5})
    assert c1.status_code == 201

    c2 = client.post("/api/v1/academic/classes", headers=headers, json={"name": "Grade 5", "level": 5})
    assert c2.status_code == 409
    assert "CLASS_EXISTS" in c2.text


def test_duplicate_section_in_same_class_rejected(client: TestClient, super_admin_user):
    """Verify sections must be unique per class."""
    login_resp = client.post(
        "/api/v1/auth/login",
        json={
            "portal_type": "staff",
            "username": "superadmin_test",
            "password": "SuperSecret123!",
        },
    )
    headers = {"Authorization": f"Bearer {login_resp.json()['access_token']}"}

    cls_resp = client.post("/api/v1/academic/classes", headers=headers, json={"name": "Grade 8", "level": 8})
    class_id = cls_resp.json()["id"]

    # First section A
    s1 = client.post("/api/v1/academic/sections", headers=headers, json={"class_id": class_id, "name": "A"})
    assert s1.status_code == 201

    # Second section A in same class -> 409
    s2 = client.post("/api/v1/academic/sections", headers=headers, json={"class_id": class_id, "name": "A"})
    assert s2.status_code == 409
    assert "SECTION_EXISTS" in s2.text
