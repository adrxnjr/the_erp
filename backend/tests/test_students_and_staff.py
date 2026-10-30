import uuid
from fastapi.testclient import TestClient


def test_public_enquiry_submission(client: TestClient):
    """Verify that external guests can submit admission enquiries without logging in."""
    resp = client.post(
        "/api/v1/students/enquiries",
        json={
            "student_name": "Applicant Student",
            "date_of_birth": "2015-05-12",
            "gender": "male",
            "grade_applying_for": "Grade 5",
            "parent_name": "Applicant Parent",
            "parent_phone": "9876543210",
            "parent_email": "parent@applicant.com",
            "notes": "Looking for admission in upcoming term",
        },
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["enquiry_number"].startswith("ENQ-")
    assert data["status"] == "submitted"


def test_student_enrollment_and_duplicate_rejection(client: TestClient, super_admin_user):
    """Verify student enrollment and duplicate admission number rejection."""
    login_resp = client.post(
        "/api/v1/auth/login",
        json={
            "portal_type": "staff",
            "username": "superadmin_test",
            "password": "SuperSecret123!",
        },
    )
    headers = {"Authorization": f"Bearer {login_resp.json()['access_token']}"}

    # Setup Academic Year and Class
    yr_resp = client.post(
        "/api/v1/academic/years",
        headers=headers,
        json={"name": "2026-Enrollment", "start_date": "2026-06-01", "end_date": "2027-04-30"},
    )
    year_id = yr_resp.json()["id"]

    cls_resp = client.post(
        "/api/v1/academic/classes",
        headers=headers,
        json={"name": "Grade 7", "level": 7},
    )
    class_id = cls_resp.json()["id"]

    # First student creation
    s1 = client.post(
        "/api/v1/students",
        headers=headers,
        json={
            "admission_number": "ADM-001",
            "full_name": "Alice Wonder",
            "date_of_birth": "2014-03-10",
            "gender": "female",
            "class_id": class_id,
            "academic_year_id": year_id,
            "admission_date": "2026-06-15",
            "create_user_account": True,
        },
    )
    assert s1.status_code == 201
    assert s1.json()["admission_number"] == "ADM-001"
    student_id = s1.json()["id"]

    # Second student with duplicate admission number -> 409
    s2 = client.post(
        "/api/v1/students",
        headers=headers,
        json={
            "admission_number": "ADM-001",
            "full_name": "Duplicate Student",
            "date_of_birth": "2014-04-10",
            "gender": "male",
            "class_id": class_id,
            "academic_year_id": year_id,
            "admission_date": "2026-06-15",
        },
    )
    assert s2.status_code == 409
    assert "ADMISSION_NUMBER_EXISTS" in s2.text

    # Student status change
    status_resp = client.post(
        f"/api/v1/students/{student_id}/status",
        headers=headers,
        json={"new_status": "transferred", "reason": "Family relocated to another district"},
    )
    assert status_resp.status_code == 200
    assert status_resp.json()["status"] == "transferred"


def test_guardian_registration_and_linking(client: TestClient, super_admin_user):
    """Verify registering a guardian and linking them to a student."""
    login_resp = client.post(
        "/api/v1/auth/login",
        json={
            "portal_type": "staff",
            "username": "superadmin_test",
            "password": "SuperSecret123!",
        },
    )
    headers = {"Authorization": f"Bearer {login_resp.json()['access_token']}"}

    # Setup year, class, student
    yr_resp = client.post(
        "/api/v1/academic/years",
        headers=headers,
        json={"name": "2026-Guardian-Year", "start_date": "2026-06-01", "end_date": "2027-04-30"},
    )
    year_id = yr_resp.json()["id"]

    cls_resp = client.post(
        "/api/v1/academic/classes",
        headers=headers,
        json={"name": "Grade 2", "level": 2},
    )
    class_id = cls_resp.json()["id"]

    s_resp = client.post(
        "/api/v1/students",
        headers=headers,
        json={
            "admission_number": "ADM-002",
            "full_name": "Bob Child",
            "date_of_birth": "2019-01-20",
            "gender": "male",
            "class_id": class_id,
            "academic_year_id": year_id,
            "admission_date": "2026-06-15",
        },
    )
    student_id = s_resp.json()["id"]

    # Register Guardian
    g_resp = client.post(
        "/api/v1/students/guardians",
        headers=headers,
        json={
            "full_name": "Robert Parent",
            "relationship_type": "father",
            "phone_number": "9123456780",
            "email": "robert.parent@mail.com",
            "create_user_account": True,
        },
    )
    assert g_resp.status_code == 201
    guardian_id = g_resp.json()["id"]

    # Link Guardian to Student
    link_resp = client.post(
        f"/api/v1/students/{student_id}/guardians",
        headers=headers,
        json={"guardian_id": guardian_id, "is_primary": True},
    )
    assert link_resp.status_code == 201


def test_staff_management_and_inactive_assignment_protection(client: TestClient, super_admin_user):
    """Verify staff creation, duplicate ID rejection, and inactive teacher assignment rejection."""
    login_resp = client.post(
        "/api/v1/auth/login",
        json={
            "portal_type": "staff",
            "username": "superadmin_test",
            "password": "SuperSecret123!",
        },
    )
    headers = {"Authorization": f"Bearer {login_resp.json()['access_token']}"}

    # Create Staff
    st_resp = client.post(
        "/api/v1/staff",
        headers=headers,
        json={
            "employee_id": "EMP-101",
            "full_name": "Prof. Charles Xavier",
            "email": "xavier@school.internal",
            "phone_number": "9876543211",
            "designation": "Senior Teacher",
            "department": "Science",
            "staff_type": "teaching",
            "joining_date": "2024-08-01",
            "create_user_account": True,
        },
    )
    assert st_resp.status_code == 201
    staff_id = st_resp.json()["id"]

    # Duplicate employee ID -> 409
    dup_resp = client.post(
        "/api/v1/staff",
        headers=headers,
        json={
            "employee_id": "EMP-101",
            "full_name": "Duplicate Employee",
            "phone_number": "9876543212",
            "designation": "Teacher",
            "department": "Science",
            "joining_date": "2024-08-01",
        },
    )
    assert dup_resp.status_code == 409
    assert "EMPLOYEE_ID_EXISTS" in dup_resp.text
