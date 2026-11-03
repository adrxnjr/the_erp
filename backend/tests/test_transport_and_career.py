import uuid
from datetime import date
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.academic import AcademicYear, ClassRoom, Section
from app.models.student import Student, Guardian, StudentGuardian


def test_transport_fleet_and_live_tracking(client: TestClient, super_admin_user, test_roles):
    """Verify transport vehicle, driver, route creation, trip lifecycle and live fleet map."""
    # 1. Login as Super Admin
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"portal_type": "staff", "username": "superadmin_test", "password": "SuperSecret123!"},
    )
    assert login_resp.status_code == 200
    headers = {"Authorization": f"Bearer {login_resp.json()['access_token']}"}

    # 2. Register Vehicle
    v_resp = client.post(
        "/api/v1/transport/vehicles",
        headers=headers,
        json={"registration_number": "KA-01-EB-1234", "capacity": 35, "model": "Tata Starbus 2025"},
    )
    assert v_resp.status_code == 201
    vehicle = v_resp.json()

    # 3. Register Driver
    d_resp = client.post(
        "/api/v1/transport/drivers",
        headers=headers,
        json={"full_name": "Ramesh Kumar", "phone_number": "9845012345", "license_number": "DL-KA01-2020"},
    )
    assert d_resp.status_code == 201
    driver = d_resp.json()

    # 4. Create Route with Stops
    r_resp = client.post(
        "/api/v1/transport/routes",
        headers=headers,
        json={
            "name": "Route 1 - North Campus Morning",
            "direction": "pickup",
            "planned_start_time": "07:30:00",
            "planned_end_time": "08:30:00",
            "vehicle_id": vehicle["id"],
            "driver_id": driver["id"],
            "stops": [
                {"name": "Greenwood Circle", "latitude": 12.9716, "longitude": 77.5946, "stop_order": 1, "planned_time": "07:35:00"},
                {"name": "Metro Station Gate 2", "latitude": 12.9780, "longitude": 77.6010, "stop_order": 2, "planned_time": "07:50:00"},
                {"name": "Ever Grow Schools Campus", "latitude": 12.9850, "longitude": 77.6100, "stop_order": 3, "planned_time": "08:15:00"},
            ],
        },
    )
    assert r_resp.status_code == 201
    route = r_resp.json()

    # 5. Start Daily Trip
    trip_start_resp = client.post(f"/api/v1/transport/trips/{route['id']}/start", headers=headers)
    assert trip_start_resp.status_code == 200
    trip_id = trip_start_resp.json()["trip_id"]

    # 6. Ingest GPS location ping
    ping_resp = client.post(
        "/api/v1/transport/location",
        json={"trip_id": trip_id, "latitude": 12.9720, "longitude": 77.5950, "speed": 28.5},
    )
    assert ping_resp.status_code == 200
    assert ping_resp.json()["status"] == "ok"

    # 7. Check Live Fleet Map
    live_resp = client.get("/api/v1/transport/live", headers=headers)
    assert live_resp.status_code == 200
    fleet = live_resp.json()
    assert len(fleet) >= 1
    assert fleet[0]["vehicle_reg"] == "KA-01-EB-1234"
    assert fleet[0]["current_speed"] == 28.5


def test_career_recommendation_and_approval_workflow(client: TestClient, super_admin_user, db_session: Session):
    """Verify Class 12 career assessment submission, deterministic scoring, counsellor review, and PDF report."""
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"portal_type": "staff", "username": "superadmin_test", "password": "SuperSecret123!"},
    )
    headers = {"Authorization": f"Bearer {login_resp.json()['access_token']}"}

    # Setup Academic Year, Class 12, Student
    ay = AcademicYear(id=uuid.uuid4(), name="2026-2027", start_date=date(2026, 6, 1), end_date=date(2027, 4, 30), is_active=True)
    cls12 = ClassRoom(id=uuid.uuid4(), name="Class 12", level=12, is_active=True)
    sec = Section(id=uuid.uuid4(), class_id=cls12.id, name="A")
    db_session.add_all([ay, cls12, sec])
    db_session.flush()

    student = Student(
        id=uuid.uuid4(),
        admission_number="ADM-CAREER-01",
        full_name="Alex Mercer",
        date_of_birth=date(2008, 5, 20),
        gender="male",
        class_id=cls12.id,
        section_id=sec.id,
        academic_year_id=ay.id,
        admission_date=date(2026, 6, 15),
        status="active",
    )
    db_session.add(student)
    db_session.commit()

    # 1. Fetch Questionnaire
    q_resp = client.get("/api/v1/career/questions", headers=headers)
    assert q_resp.status_code == 200
    questions = q_resp.json()
    assert len(questions) >= 5

    # 2. Submit Assessment Answers (high investigative / realistic)
    answers = [{"question_id": q["id"], "score": 5 if q["interest_type"] in ("Investigative", "Realistic") else 2} for q in questions]
    sub_resp = client.post(
        "/api/v1/career/attempts",
        headers=headers,
        json={"student_id": str(student.id), "answers": answers, "student_notes": "Interested in AI & Robotics"},
    )
    assert sub_resp.status_code == 201
    attempt_id = sub_resp.json()["attempt_id"]

    # 3. Check Review Queue for Counsellor / Principal
    queue_resp = client.get("/api/v1/career/review-queue", headers=headers)
    assert queue_resp.status_code == 200
    queue = queue_resp.json()
    assert any(item["student_name"] == "Alex Mercer" for item in queue)

    # 4. Counsellor Review & Approval
    rev_resp = client.post(
        f"/api/v1/career/attempts/{attempt_id}/review",
        headers=headers,
        json={"decision": "approved", "counsellor_notes": "High aptitude for computer science and data analytics. Approved."},
    )
    assert rev_resp.status_code == 200
    assert rev_resp.json()["status"] == "approved"

    # 5. Access Approved Career Guidance Report
    rep_resp = client.get(f"/api/v1/career/attempts/{attempt_id}/report", headers=headers)
    assert rep_resp.status_code == 200
    report = rep_resp.json()
    assert report["status"] == "approved"
    assert len(report["recommendations"]) >= 3
    assert report["recommendations"][0]["rank"] == 1

    # 6. Generate and Download Career Report PDF
    pdf_resp = client.get(f"/api/v1/career/reports/{attempt_id}/pdf", headers=headers)
    assert pdf_resp.status_code == 200
    assert pdf_resp.headers["content-type"] == "application/pdf"
    assert len(pdf_resp.content) > 1000


def test_student_and_parent_my_bus_tracking(client: TestClient, super_admin_user, db_session: Session):
    """Verify /transport/my-bus returns live tracking, driver, velocity, ETA, and stops for student portal."""
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"portal_type": "staff", "username": "superadmin_test", "password": "SuperSecret123!"},
    )
    headers = {"Authorization": f"Bearer {login_resp.json()['access_token']}"}

    # Setup Academic Year, Student
    ay = AcademicYear(id=uuid.uuid4(), name="2026-2027-Transport", start_date=date(2026, 6, 1), end_date=date(2027, 4, 30), is_active=True)
    db_session.add(ay)
    db_session.flush()

    student = Student(
        id=uuid.uuid4(),
        admission_number="ADM-BUS-01",
        full_name="Liam Smith",
        date_of_birth=date(2015, 3, 14),
        gender="male",
        academic_year_id=ay.id,
        admission_date=date(2026, 6, 15),
        status="active",
    )
    db_session.add(student)
    db_session.commit()

    # Call /transport/my-bus
    resp = client.get(f"/api/v1/transport/my-bus?student_id={student.id}", headers=headers)
    assert resp.status_code == 200
    data = resp.json()

    assert data["has_transport"] is True
    assert "route_name" in data
    assert "driver_name" in data
    assert "driver_phone" in data
    assert "vehicle_registration" in data
    assert "current_speed" in data
    assert "eta_minutes" in data
    assert "distance_km" in data
    assert "stops" in data
    assert len(data["stops"]) >= 1

