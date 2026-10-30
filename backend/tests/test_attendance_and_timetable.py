import uuid
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.models.attendance import StudentAttendance


def test_bulk_attendance_and_stats(client: TestClient, super_admin_user, db_session: Session):
    """Verify bulk attendance marking and attendance percentage calculation."""
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"portal_type": "staff", "username": "superadmin_test", "password": "SuperSecret123!"},
    )
    headers = {"Authorization": f"Bearer {login_resp.json()['access_token']}"}

    # Setup year, class, section, student
    yr = client.post("/api/v1/academic/years", headers=headers, json={"name": "2026-Att-Year", "start_date": "2026-06-01", "end_date": "2027-04-30"}).json()
    cls = client.post("/api/v1/academic/classes", headers=headers, json={"name": "Grade 4", "level": 4}).json()
    sec = client.post("/api/v1/academic/sections", headers=headers, json={"class_id": cls["id"], "name": "A"}).json()
    std = client.post(
        "/api/v1/students",
        headers=headers,
        json={"admission_number": "ADM-ATT-1", "full_name": "Att Student", "date_of_birth": "2016-01-01", "gender": "male", "class_id": cls["id"], "academic_year_id": yr["id"], "admission_date": "2026-06-15"},
    ).json()

    # Day 1: Present
    att1 = client.post(
        "/api/v1/attendance/student/bulk",
        headers=headers,
        json={
            "class_id": cls["id"],
            "section_id": sec["id"],
            "academic_year_id": yr["id"],
            "attendance_date": "2026-06-16",
            "items": [{"student_id": std["id"], "status": "present"}],
        },
    )
    assert att1.status_code == 200

    # Day 2: Absent
    att2 = client.post(
        "/api/v1/attendance/student/bulk",
        headers=headers,
        json={
            "class_id": cls["id"],
            "section_id": sec["id"],
            "academic_year_id": yr["id"],
            "attendance_date": "2026-06-17",
            "items": [{"student_id": std["id"], "status": "absent"}],
        },
    )
    assert att2.status_code == 200

    # Verify Stats: 1 present out of 2 total = 50.0%
    stats_resp = client.get(f"/api/v1/attendance/student/{std['id']}/stats")
    assert stats_resp.status_code == 200
    stats = stats_resp.json()
    assert stats["total_days"] == 2
    assert stats["present_days"] == 1
    assert stats["absent_days"] == 1
    assert stats["attendance_percentage"] == 50.0


def test_locked_attendance_and_correction_workflow(client: TestClient, super_admin_user, db_session: Session):
    """Verify that locked attendance rejects direct edits and requires an approved correction request."""
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"portal_type": "staff", "username": "superadmin_test", "password": "SuperSecret123!"},
    )
    headers = {"Authorization": f"Bearer {login_resp.json()['access_token']}"}

    yr = client.post("/api/v1/academic/years", headers=headers, json={"name": "2026-Lock-Year", "start_date": "2026-06-01", "end_date": "2027-04-30"}).json()
    cls = client.post("/api/v1/academic/classes", headers=headers, json={"name": "Grade 9", "level": 9}).json()
    sec = client.post("/api/v1/academic/sections", headers=headers, json={"class_id": cls["id"], "name": "B"}).json()
    std = client.post(
        "/api/v1/students",
        headers=headers,
        json={"admission_number": "ADM-LOCK-1", "full_name": "Lock Student", "date_of_birth": "2011-01-01", "gender": "female", "class_id": cls["id"], "academic_year_id": yr["id"], "admission_date": "2026-06-15"},
    ).json()

    # Mark attendance
    mark_resp = client.post(
        "/api/v1/attendance/student/bulk",
        headers=headers,
        json={
            "class_id": cls["id"],
            "section_id": sec["id"],
            "academic_year_id": yr["id"],
            "attendance_date": "2026-06-18",
            "items": [{"student_id": std["id"], "status": "absent"}],
        },
    )
    assert mark_resp.status_code == 200
    attendance_id = mark_resp.json()[0]["id"]

    # Lock the record in database to simulate lock deadline expiry
    from sqlalchemy import select
    record = db_session.execute(select(StudentAttendance).where(StudentAttendance.id == uuid.UUID(attendance_id))).scalar_one()
    record.is_locked = True
    db_session.commit()

    # Direct edit attempt must fail with 403
    edit_resp = client.post(
        "/api/v1/attendance/student/bulk",
        headers=headers,
        json={
            "class_id": cls["id"],
            "section_id": sec["id"],
            "academic_year_id": yr["id"],
            "attendance_date": "2026-06-18",
            "items": [{"student_id": std["id"], "status": "present"}],
        },
    )
    assert edit_resp.status_code == 403
    assert "ATTENDANCE_LOCKED" in edit_resp.text

    # Submit correction request
    corr_resp = client.post(
        "/api/v1/attendance/student/corrections",
        headers=headers,
        json={
            "attendance_id": attendance_id,
            "requested_status": "present",
            "reason": "Student was marked absent by mistake during assembly",
        },
    )
    assert corr_resp.status_code == 201


def test_timetable_clash_prevention(client: TestClient, super_admin_user):
    """Verify timetable conflict detection preventing teacher and section scheduling clashes."""
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"portal_type": "staff", "username": "superadmin_test", "password": "SuperSecret123!"},
    )
    headers = {"Authorization": f"Bearer {login_resp.json()['access_token']}"}

    yr = client.post("/api/v1/academic/years", headers=headers, json={"name": "2026-TT-Year", "start_date": "2026-06-01", "end_date": "2027-04-30"}).json()
    cls1 = client.post("/api/v1/academic/classes", headers=headers, json={"name": "Grade 6", "level": 6}).json()
    cls2 = client.post("/api/v1/academic/classes", headers=headers, json={"name": "Grade 11", "level": 11}).json()
    sec1 = client.post("/api/v1/academic/sections", headers=headers, json={"class_id": cls1["id"], "name": "A"}).json()
    sec2 = client.post("/api/v1/academic/sections", headers=headers, json={"class_id": cls2["id"], "name": "A"}).json()
    sub1 = client.post("/api/v1/academic/subjects", headers=headers, json={"name": "Physics", "code": "PHYS01"}).json()
    sub2 = client.post("/api/v1/academic/subjects", headers=headers, json={"name": "Chemistry", "code": "CHEM01"}).json()
    teacher = client.post(
        "/api/v1/staff",
        headers=headers,
        json={"employee_id": "EMP-TT-1", "full_name": "Science Teacher", "phone_number": "9998887771", "designation": "Teacher", "department": "Science", "joining_date": "2024-01-01"},
    ).json()

    # Create Period 1
    period = client.post(
        "/api/v1/timetable/periods",
        headers=headers,
        json={"name": "Period 1", "period_number": 1, "start_time": "09:00:00", "end_time": "09:45:00"},
    ).json()

    # 1. Schedule Grade 6A with teacher during Period 1 on Monday (day_of_week=0)
    tt1 = client.post(
        "/api/v1/timetable/entries",
        headers=headers,
        json={
            "academic_year_id": yr["id"],
            "class_id": cls1["id"],
            "section_id": sec1["id"],
            "subject_id": sub1["id"],
            "teacher_staff_id": teacher["id"],
            "period_id": period["id"],
            "day_of_week": 0,
            "room_number": "Room 101",
        },
    )
    assert tt1.status_code == 201

    # 2. Attempt to schedule the SAME teacher in Grade 11A during the same Monday Period 1 -> Teacher Clash (409)
    clash_resp = client.post(
        "/api/v1/timetable/entries",
        headers=headers,
        json={
            "academic_year_id": yr["id"],
            "class_id": cls2["id"],
            "section_id": sec2["id"],
            "subject_id": sub2["id"],
            "teacher_staff_id": teacher["id"],
            "period_id": period["id"],
            "day_of_week": 0,
            "room_number": "Room 202",
        },
    )
    assert clash_resp.status_code == 409
    assert "TEACHER_TIMETABLE_CLASH" in clash_resp.text
