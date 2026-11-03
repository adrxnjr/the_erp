import os
import sys
import uuid
from datetime import date, datetime, time
from decimal import Decimal

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy import select
from app.db.session import SessionLocal
from app.models.academic import AcademicYear, ClassRoom, Subject
from app.models.student import Student
from app.models.user import User
from app.models.examination import (
    ExamType,
    Exam,
    ExamSubject,
    GradeScale,
    Mark,
    ExamResult,
)
from app.models.finance import (
    FeeHead,
    FeeStructure,
    StudentFee,
    Payment,
    Receipt,
)

def seed_exams_and_finance():
    db = SessionLocal()
    try:
        print("[*] Seeding Examinations, Report Cards, Fee Structures, Payments and Receipts...")

        # 1. Staff User for audit/entered_by
        admin_user = db.execute(select(User).where(User.portal_type == "staff")).scalars().first()
        if not admin_user:
            admin_user = db.execute(select(User)).scalars().first()
        admin_id = admin_user.id if admin_user else uuid.uuid4()

        # 2. Active Academic Year
        ay = db.execute(select(AcademicYear).where(AcademicYear.is_active == True)).scalars().first()
        if not ay:
            ay = AcademicYear(
                id=uuid.uuid4(),
                name="2026-2027 Academic Session",
                start_date=date(2026, 6, 1),
                end_date=date(2027, 4, 30),
                is_active=True,
            )
            db.add(ay)
            db.flush()

        # ---------------- PART 1: EXAMINATIONS & REPORT CARDS ----------------

        # Grade Scales
        scales_data = [
            ("A+", 90.0, 100.0, 10.0, "Outstanding Performance"),
            ("A", 80.0, 89.99, 9.0, "Excellent Performance"),
            ("B+", 70.0, 79.99, 8.0, "Very Good Performance"),
            ("B", 60.0, 69.99, 7.0, "Good Performance"),
            ("C", 50.0, 59.99, 6.0, "Satisfactory"),
            ("D", 35.0, 49.99, 4.0, "Pass"),
            ("F", 0.0, 34.99, 0.0, "Needs Improvement"),
        ]
        for name, min_p, max_p, gp, desc in scales_data:
            existing_gs = db.execute(select(GradeScale).where(GradeScale.name == name)).scalar_one_or_none()
            if not existing_gs:
                gs = GradeScale(
                    id=uuid.uuid4(),
                    name=name,
                    min_percentage=min_p,
                    max_percentage=max_p,
                    grade_point=gp,
                    description=desc,
                )
                db.add(gs)
        db.flush()

        # Exam Types
        exam_types_data = [
            ("Mid-Term Examination", "Mid-term comprehensive evaluation", 40.0),
            ("Quarterly Assessment", "Periodic continuous unit & formative assessment", 20.0),
            ("Annual Preparatory Examination", "Summative annual board preparatory examination", 40.0),
        ]
        type_objs = {}
        for name, desc, wt in exam_types_data:
            et = db.execute(select(ExamType).where(ExamType.name == name)).scalar_one_or_none()
            if not et:
                et = ExamType(
                    id=uuid.uuid4(),
                    name=name,
                    description=desc,
                    weightage=wt,
                )
                db.add(et)
                db.flush()
            type_objs[name] = et

        # Exam Sessions
        exams_config = [
            ("Term 1 Mid-Term Examination 2026", "Mid-Term Examination", date(2026, 9, 15), date(2026, 9, 25)),
            ("Quarterly Assessment Session 2025-2026", "Quarterly Assessment", date(2025, 11, 10), date(2025, 11, 18)),
            ("Annual Preparatory Examination 2026", "Annual Preparatory Examination", date(2026, 2, 20), date(2026, 3, 5)),
        ]

        exam_objs = []
        for ex_name, t_name, s_date, e_date in exams_config:
            ex = db.execute(select(Exam).where(Exam.name == ex_name)).scalar_one_or_none()
            if not ex:
                ex = Exam(
                    id=uuid.uuid4(),
                    academic_year_id=ay.id,
                    exam_type_id=type_objs[t_name].id,
                    name=ex_name,
                    start_date=s_date,
                    end_date=e_date,
                    is_published=True,
                )
                db.add(ex)
                db.flush()
            else:
                ex.is_published = True
                db.flush()
            exam_objs.append(ex)

        # Classes & Subjects
        classes = list(db.execute(select(ClassRoom)).scalars().all())
        subjects = list(db.execute(select(Subject)).scalars().all())
        students = list(db.execute(select(Student)).scalars().all())

        if not subjects:
            default_subjects = [
                ("Mathematics", "MATH"),
                ("English Literature", "ENG"),
                ("General Science", "SCI"),
                ("Social Studies", "SOC"),
                ("Computer Science", "CS"),
            ]
            for s_name, s_code in default_subjects:
                subj = Subject(id=uuid.uuid4(), name=s_name, code=s_code, is_active=True)
                db.add(subj)
                subjects.append(subj)
            db.flush()

        liam_marks_profile = {
            "Term 1 Mid-Term Examination 2026": {
                "Mathematics": 96.0,
                "English Literature": 91.0,
                "General Science": 95.0,
                "Social Studies": 89.0,
                "Computer Science": 98.0,
            },
            "Quarterly Assessment Session 2025-2026": {
                "Mathematics": 92.0,
                "English Literature": 88.0,
                "General Science": 90.0,
                "Social Studies": 84.0,
                "Computer Science": 96.0,
            },
            "Annual Preparatory Examination 2026": {
                "Mathematics": 98.0,
                "English Literature": 94.0,
                "General Science": 97.0,
                "Social Studies": 92.0,
                "Computer Science": 100.0,
            },
        }

        for exam in exam_objs:
            for c in classes:
                for subj in subjects:
                    existing_es = db.execute(
                        select(ExamSubject).where(
                            ExamSubject.exam_id == exam.id,
                            ExamSubject.class_id == c.id,
                            ExamSubject.subject_id == subj.id,
                        )
                    ).scalar_one_or_none()

                    if not existing_es:
                        es = ExamSubject(
                            id=uuid.uuid4(),
                            exam_id=exam.id,
                            class_id=c.id,
                            subject_id=subj.id,
                            max_marks=100.0,
                            pass_marks=35.0,
                            exam_date=exam.start_date,
                            start_time=time(9, 30),
                            end_time=time(12, 30),
                        )
                        db.add(es)
            db.flush()

            for std_idx, std in enumerate(students):
                std_class_id = std.class_id or (classes[0].id if classes else None)
                if not std_class_id:
                    continue

                total_obtained = 0.0
                total_max = 0.0

                for subj in subjects:
                    es = db.execute(
                        select(ExamSubject).where(
                            ExamSubject.exam_id == exam.id,
                            ExamSubject.class_id == std_class_id,
                            ExamSubject.subject_id == subj.id,
                        )
                    ).scalar_one_or_none()

                    if not es:
                        continue

                    if std_idx == 0:  # Liam Smith
                        score = liam_marks_profile.get(exam.name, {}).get(subj.name, 92.0)
                        remarks = "Demonstrates outstanding analytical & problem-solving abilities."
                    else:
                        base = liam_marks_profile.get(exam.name, {}).get(subj.name, 90.0)
                        score = max(50.0, min(95.0, base - (std_idx * 3.5)))
                        remarks = "Good overall performance."

                    existing_mark = db.execute(
                        select(Mark).where(
                            Mark.exam_subject_id == es.id,
                            Mark.student_id == std.id,
                        )
                    ).scalar_one_or_none()

                    if not existing_mark:
                        m = Mark(
                            id=uuid.uuid4(),
                            exam_subject_id=es.id,
                            student_id=std.id,
                            marks_obtained=score,
                            is_absent=False,
                            status="approved",
                            remarks=remarks,
                            entered_by_user_id=admin_id,
                        )
                        db.add(m)
                    else:
                        existing_mark.marks_obtained = score
                        existing_mark.status = "approved"

                    total_obtained += score
                    total_max += 100.0

                pct = round((total_obtained / total_max * 100.0), 2) if total_max > 0 else 0.0
                grade = "A+" if pct >= 90 else ("A" if pct >= 80 else ("B+" if pct >= 70 else "B"))
                rank = 1 if std_idx == 0 else (std_idx + 1)

                existing_er = db.execute(
                    select(ExamResult).where(
                        ExamResult.exam_id == exam.id,
                        ExamResult.student_id == std.id,
                    )
                ).scalar_one_or_none()

                if not existing_er:
                    er = ExamResult(
                        id=uuid.uuid4(),
                        exam_id=exam.id,
                        student_id=std.id,
                        total_marks_obtained=total_obtained,
                        total_max_marks=total_max,
                        percentage=pct,
                        grade=grade,
                        rank=rank,
                        status="published",
                    )
                    db.add(er)
                else:
                    existing_er.total_marks_obtained = total_obtained
                    existing_er.total_max_marks = total_max
                    existing_er.percentage = pct
                    existing_er.grade = grade
                    existing_er.rank = rank
                    existing_er.status = "published"

        db.flush()

        # ---------------- PART 2: FEES & ALL PAID STATUS ----------------

        # Fee Heads
        fee_heads_data = [
            ("Tuition Fee", "TUIT", "Core academic and instructional tuition"),
            ("Science & Computer Lab Fee", "LAB", "Practical science, IT and robotics lab facilities"),
            ("Campus Transportation Fee", "TRANS", "Air-conditioned school bus route transport"),
            ("Library & Activity Fee", "LIB", "Library, sports equipment and co-curricular programs"),
        ]
        head_objs = {}
        for name, code, desc in fee_heads_data:
            fh = db.execute(select(FeeHead).where(FeeHead.code == code)).scalar_one_or_none()
            if not fh:
                fh = FeeHead(
                    id=uuid.uuid4(),
                    name=name,
                    code=code,
                    description=desc,
                    is_refundable=False,
                )
                db.add(fh)
                db.flush()
            head_objs[code] = fh

        # Fee Structure for classes
        for c in classes:
            structures = [
                ("TUIT", Decimal("25000.00"), "term"),
                ("LAB", Decimal("12000.00"), "annual"),
                ("TRANS", Decimal("8000.00"), "term"),
            ]
            for code, amt, freq in structures:
                existing_fs = db.execute(
                    select(FeeStructure).where(
                        FeeStructure.academic_year_id == ay.id,
                        FeeStructure.class_id == c.id,
                        FeeStructure.fee_head_id == head_objs[code].id,
                    )
                ).scalar_one_or_none()
                if not existing_fs:
                    fs = FeeStructure(
                        id=uuid.uuid4(),
                        academic_year_id=ay.id,
                        class_id=c.id,
                        fee_head_id=head_objs[code].id,
                        amount=amt,
                        due_date=date(2026, 8, 30),
                        frequency=freq,
                    )
                    db.add(fs)
        db.flush()

        # Setup StudentFee for Liam Smith and other students
        # Total fee = 25000 + 12000 + 8000 = 45000.00 (All Paid!)
        total_annual_fee = Decimal("45000.00")

        for std_idx, std in enumerate(students):
            sf = db.execute(
                select(StudentFee).where(
                    StudentFee.student_id == std.id,
                    StudentFee.academic_year_id == ay.id,
                )
            ).scalar_one_or_none()

            if not sf:
                sf = StudentFee(
                    id=uuid.uuid4(),
                    student_id=std.id,
                    academic_year_id=ay.id,
                    total_amount=total_annual_fee,
                    discounted_amount=Decimal("0.00"),
                    paid_amount=total_annual_fee,
                    status="paid",  # ALL PAID!
                )
                db.add(sf)
            else:
                sf.total_amount = total_annual_fee
                sf.paid_amount = total_annual_fee
                sf.discounted_amount = Decimal("0.00")
                sf.status = "paid"  # ALL PAID!

        db.flush()

        # Create 3 Paid Payment transactions and Official sequential Receipts for Liam Smith
        liam_student = students[0] if students else None
        if liam_student:
            payment_specs = [
                (
                    Decimal("25000.00"),
                    "bank_transfer",
                    "TXN-HDFC-982149",
                    date(2026, 8, 15),
                    "Term 1 Academic Tuition Fee (Full Clearance)",
                    "REC-2026-0001",
                ),
                (
                    Decimal("12000.00"),
                    "card",
                    "TXN-VISA-771240",
                    date(2026, 9, 10),
                    "Annual Science, Robotics & IT Lab Facility Charges",
                    "REC-2026-0002",
                ),
                (
                    Decimal("8000.00"),
                    "upi",
                    "UPI-ICICI-441299",
                    date(2026, 10, 5),
                    "Campus Air-Conditioned Route 1 Transportation Fee",
                    "REC-2026-0003",
                ),
            ]

            for amt, method, ref, p_date, rem, r_num in payment_specs:
                existing_p = db.execute(select(Payment).where(Payment.transaction_reference == ref)).scalar_one_or_none()
                if not existing_p:
                    p = Payment(
                        id=uuid.uuid4(),
                        student_id=liam_student.id,
                        amount=amt,
                        payment_method=method,
                        transaction_reference=ref,
                        payment_date=p_date,
                        status="completed",
                        received_by_user_id=admin_id,
                        remarks=rem,
                    )
                    db.add(p)
                    db.flush()

                    r = Receipt(
                        id=uuid.uuid4(),
                        payment_id=p.id,
                        receipt_number=r_num,
                        total_amount=amt,
                        issued_at=datetime.combine(p_date, time(11, 30)),
                        is_cancelled=False,
                    )
                    db.add(r)

        db.commit()
        print("[OK] Successfully seeded Published Exams, Marks, Grade Scales, Report Cards, and 'ALL PAID' Student Fees with Receipts!")

    except Exception as e:
        db.rollback()
        print(f"[!] Error: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_exams_and_finance()
