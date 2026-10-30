import uuid
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session


def test_parent_portal_isolation_and_dashboards(client: TestClient, super_admin_user, test_roles):
    """Verify parent portal access control, child isolation, dashboards, and Excel reports."""
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"portal_type": "staff", "username": "superadmin_test", "password": "SuperSecret123!"},
    )
    headers = {"Authorization": f"Bearer {login_resp.json()['access_token']}"}

    # Setup class, year, student
    yr = client.post("/api/v1/academic/years", headers=headers, json={"name": "2026-Portal-Year", "start_date": "2026-06-01", "end_date": "2027-04-30"}).json()
    cls = client.post("/api/v1/academic/classes", headers=headers, json={"name": "Grade 8", "level": 8}).json()
    sec = client.post("/api/v1/academic/sections", headers=headers, json={"class_id": cls["id"], "name": "A"}).json()

    s1 = client.post(
        "/api/v1/students",
        headers=headers,
        json={"admission_number": "ADM-PORT-1", "full_name": "Kid One", "date_of_birth": "2012-03-12", "gender": "male", "class_id": cls["id"], "section_id": sec["id"], "academic_year_id": yr["id"], "admission_date": "2026-06-15"},
    ).json()

    s2 = client.post(
        "/api/v1/students",
        headers=headers,
        json={"admission_number": "ADM-PORT-2", "full_name": "Unrelated Kid", "date_of_birth": "2012-04-18", "gender": "female", "class_id": cls["id"], "section_id": sec["id"], "academic_year_id": yr["id"], "admission_date": "2026-06-15"},
    ).json()

    # Create Parent User and Guardian record
    parent_user_resp = client.post(
        "/api/v1/users",
        headers=headers,
        json={
            "username": "parent_doe",
            "email": "doe_parent@example.com",
            "password": "ParentPassword123!",
            "full_name": "John Doe",
            "portal_type": "parent",
            "role_ids": [str(test_roles["parent"].id)],
        },
    )
    assert parent_user_resp.status_code == 201
    parent_user = parent_user_resp.json()

    # Register Guardian and link to s1 only
    g_resp = client.post(
        "/api/v1/students/guardians",
        headers=headers,
        json={"user_id": parent_user["id"], "full_name": "John Doe", "relationship_type": "father", "phone_number": "9876543210", "email": "doe_parent@example.com"},
    )
    assert g_resp.status_code == 201
    guardian = g_resp.json()

    link_resp = client.post(
        f"/api/v1/students/{s1['id']}/guardians",
        headers=headers,
        json={"guardian_id": guardian["id"], "relationship": "Father", "is_primary": True},
    )
    assert link_resp.status_code == 201

    # Login as Parent
    p_login = client.post(
        "/api/v1/auth/login",
        json={"portal_type": "parent", "username": "parent_doe", "password": "ParentPassword123!"},
    )
    assert p_login.status_code == 200
    p_headers = {"Authorization": f"Bearer {p_login.json()['access_token']}"}

    # 1. Parent lists children
    children = client.get("/api/v1/portal/parent/children", headers=p_headers).json()
    assert len(children) == 1
    assert children[0]["full_name"] == "Kid One"

    # 2. Parent accesses linked child's attendance -> OK
    att_resp = client.get(f"/api/v1/portal/student/{s1['id']}/attendance", headers=p_headers)
    assert att_resp.status_code == 200

    # 3. Parent attempts access to unrelated child (s2) -> 403 Forbidden
    unauth_resp = client.get(f"/api/v1/portal/student/{s2['id']}/attendance", headers=p_headers)
    assert unauth_resp.status_code == 403

    # 4. Role Dashboards
    dash_prin = client.get("/api/v1/dashboards/principal", headers=headers)
    assert dash_prin.status_code == 200
    assert "total_active_students" in dash_prin.json()

    dash_acc = client.get("/api/v1/dashboards/accountant", headers=headers)
    assert dash_acc.status_code == 200
    assert "today_collection" in dash_acc.json()

    dash_adm = client.get("/api/v1/dashboards/admin", headers=headers)
    assert dash_adm.status_code == 200
    assert "total_users" in dash_adm.json()

    # 5. Excel Reports
    att_excel = client.get(f"/api/v1/reports/attendance/excel?class_id={cls['id']}", headers=headers)
    assert att_excel.status_code == 200
    assert "openxmlformats" in att_excel.headers["content-type"]
    assert len(att_excel.content) > 1000

    fee_excel = client.get(f"/api/v1/reports/fees/excel?academic_year_id={yr['id']}", headers=headers)
    assert fee_excel.status_code == 200
    assert "openxmlformats" in fee_excel.headers["content-type"]
    assert len(fee_excel.content) > 1000
