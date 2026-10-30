import uuid
from decimal import Decimal
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.academic import AcademicYear, ClassRoom, Section, Subject
from app.models.examination import Exam, ExamSubject, ExamType, GradeScale, Mark
from app.models.finance import FeeHead, FeeStructure, Payment, Receipt


def test_examination_lifecycle_and_report_card(client: TestClient, super_admin_user):
    """Verify exam setup, bulk mark entry, calculation, publishing, and PDF generation."""
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"portal_type": "staff", "username": "superadmin_test", "password": "SuperSecret123!"},
    )
    headers = {"Authorization": f"Bearer {login_resp.json()['access_token']}"}

    # Setup academic context
    yr = client.post("/api/v1/academic/years", headers=headers, json={"name": "2026-Exam-Year", "start_date": "2026-06-01", "end_date": "2027-04-30"}).json()
    cls = client.post("/api/v1/academic/classes", headers=headers, json={"name": "Grade 10", "level": 10}).json()
    sec = client.post("/api/v1/academic/sections", headers=headers, json={"class_id": cls["id"], "name": "A"}).json()
    sub1 = client.post("/api/v1/academic/subjects", headers=headers, json={"name": "Mathematics", "code": "MATH10"}).json()
    sub2 = client.post("/api/v1/academic/subjects", headers=headers, json={"name": "English", "code": "ENG10"}).json()

    # Create students
    s1 = client.post(
        "/api/v1/students",
        headers=headers,
        json={"admission_number": "ADM-EX-1", "full_name": "Topper Student", "date_of_birth": "2010-05-10", "gender": "female", "class_id": cls["id"], "academic_year_id": yr["id"], "admission_date": "2026-06-15"},
    ).json()
    s2 = client.post(
        "/api/v1/students",
        headers=headers,
        json={"admission_number": "ADM-EX-2", "full_name": "Second Student", "date_of_birth": "2010-08-14", "gender": "male", "class_id": cls["id"], "academic_year_id": yr["id"], "admission_date": "2026-06-15"},
    ).json()

    # 1. Create Exam Type & Exam
    et = client.post(
        "/api/v1/exams/types",
        headers=headers,
        json={"name": "Annual Examination 2026", "weightage": 100.0, "description": "End of year finals"},
    ).json()

    exam = client.post(
        "/api/v1/exams",
        headers=headers,
        json={
            "academic_year_id": yr["id"],
            "exam_type_id": et["id"],
            "name": "Grade 10 Annuals",
            "start_date": "2027-03-01",
            "end_date": "2027-03-15",
        },
    ).json()

    # 2. Add Exam Subjects
    es1 = client.post(
        f"/api/v1/exams/{exam['id']}/subjects",
        headers=headers,
        json={"class_id": cls["id"], "subject_id": sub1["id"], "max_marks": 100.0, "pass_marks": 35.0},
    ).json()
    es2 = client.post(
        f"/api/v1/exams/{exam['id']}/subjects",
        headers=headers,
        json={"class_id": cls["id"], "subject_id": sub2["id"], "max_marks": 100.0, "pass_marks": 35.0},
    ).json()

    # 3. Add Grade Scales
    client.post(
        "/api/v1/exams/grade-scales",
        headers=headers,
        json={"name": "A+", "min_percentage": 90.0, "max_percentage": 100.0, "grade_point": 10.0},
    )
    client.post(
        "/api/v1/exams/grade-scales",
        headers=headers,
        json={"name": "A", "min_percentage": 80.0, "max_percentage": 89.99, "grade_point": 9.0},
    )
    client.post(
        "/api/v1/exams/grade-scales",
        headers=headers,
        json={"name": "B", "min_percentage": 60.0, "max_percentage": 79.99, "grade_point": 7.0},
    )

    # 4. Enter Bulk Marks
    client.post(
        "/api/v1/exams/marks/bulk",
        headers=headers,
        json={
            "exam_subject_id": es1["id"],
            "status": "submitted",
            "items": [
                {"student_id": s1["id"], "marks_obtained": 95.0},
                {"student_id": s2["id"], "marks_obtained": 82.0},
            ],
        },
    )
    client.post(
        "/api/v1/exams/marks/bulk",
        headers=headers,
        json={
            "exam_subject_id": es2["id"],
            "status": "submitted",
            "items": [
                {"student_id": s1["id"], "marks_obtained": 90.0},
                {"student_id": s2["id"], "marks_obtained": 80.0},
            ],
        },
    )

    # 5. Calculate and Publish Results
    pub_resp = client.post(f"/api/v1/exams/{exam['id']}/publish-results", headers=headers)
    assert pub_resp.status_code == 200
    results = pub_resp.json()
    assert len(results) == 2
    # Topper should have rank 1 and A+
    topper = next(r for r in results if r["student_id"] == s1["id"])
    assert topper["rank"] == 1
    assert topper["grade"] == "A+"
    assert topper["percentage"] == 92.5

    # 6. Download Report Card PDF
    rc_resp = client.get(f"/api/v1/exams/{exam['id']}/report-cards/{s1['id']}", headers=headers)
    assert rc_resp.status_code == 200
    assert rc_resp.headers["content-type"] == "application/pdf"
    assert len(rc_resp.content) > 500


def test_fees_and_receipt_lifecycle(client: TestClient, super_admin_user):
    """Verify fee head setup, payment recording, sequential receipting, and cancellation."""
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"portal_type": "staff", "username": "superadmin_test", "password": "SuperSecret123!"},
    )
    headers = {"Authorization": f"Bearer {login_resp.json()['access_token']}"}

    yr = client.post("/api/v1/academic/years", headers=headers, json={"name": "2026-Fee-Year", "start_date": "2026-06-01", "end_date": "2027-04-30"}).json()
    cls = client.post("/api/v1/academic/classes", headers=headers, json={"name": "Grade 5", "level": 5}).json()
    std = client.post(
        "/api/v1/students",
        headers=headers,
        json={"admission_number": "ADM-FEE-1", "full_name": "Fee Student", "date_of_birth": "2013-02-10", "gender": "male", "class_id": cls["id"], "academic_year_id": yr["id"], "admission_date": "2026-06-15"},
    ).json()

    # 1. Create Fee Head & Fee Structure
    fh = client.post(
        "/api/v1/finance/fee-heads",
        headers=headers,
        json={"name": "Tuition Fee", "code": "TUIT26", "description": "Annual tuition", "is_refundable": False},
    ).json()

    client.post(
        "/api/v1/finance/fee-structures",
        headers=headers,
        json={"academic_year_id": yr["id"], "class_id": cls["id"], "fee_head_id": fh["id"], "amount": 12000.0, "due_date": "2026-07-31", "frequency": "annual"},
    )

    # 2. Get Student Fee Ledger
    ledger = client.get(f"/api/v1/finance/student-fee/{std['id']}/{yr['id']}", headers=headers).json()
    assert float(ledger["total_amount"]) == 12000.0
    assert ledger["status"] == "unpaid"

    # 3. Process Payment
    pay_resp = client.post(
        "/api/v1/finance/payments",
        headers=headers,
        json={
            "student_id": std["id"],
            "amount": 6000.0,
            "payment_method": "upi",
            "transaction_reference": "UPI-TXN-998822",
        },
    )
    assert pay_resp.status_code == 201
    payment = pay_resp.json()
    receipt = payment["receipt"]
    assert receipt["receipt_number"].startswith("RCP-")
    assert not receipt["is_cancelled"]

    # Verify ledger updated to partially_paid
    ledger_after = client.get(f"/api/v1/finance/student-fee/{std['id']}/{yr['id']}", headers=headers).json()
    assert float(ledger_after["paid_amount"]) == 6000.0
    assert ledger_after["status"] == "partially_paid"

    # 4. Download Receipt PDF
    rec_pdf = client.get(f"/api/v1/finance/receipts/{receipt['id']}/pdf", headers=headers)
    assert rec_pdf.status_code == 200
    assert rec_pdf.headers["content-type"] == "application/pdf"

    # 5. Cancel Receipt
    cancel_resp = client.post(
        f"/api/v1/finance/receipts/{receipt['id']}/cancel",
        headers=headers,
        json={"cancellation_reason": "Bounced transaction / bank chargeback reversal"},
    )
    assert cancel_resp.status_code == 200
    assert cancel_resp.json()["is_cancelled"] is True

    # Verify ledger reverted to unpaid
    ledger_rev = client.get(f"/api/v1/finance/student-fee/{std['id']}/{yr['id']}", headers=headers).json()
    assert float(ledger_rev["paid_amount"]) == 0.0
    assert ledger_rev["status"] == "unpaid"
