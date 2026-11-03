import os
import sys
import uuid
from datetime import date, time

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy import select
from app.db.session import SessionLocal
from app.models.academic import AcademicYear, ClassRoom, Section, Subject, ClassSubject
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

def seed_exams_and_report_cards():
    db = SessionLocal()
    try:
        print("[*] Seeding sample examination types, grade scales, exams, subjects, marks, and report cards...")

        # 1. Staff User for audit/entered_by
        admin_user = db.execute(select(User).where(User.portal_type == "staff")).scalars().first()
        if not admin_user:
            admin_user = db.execute(select(User)).scalars().first()
        admin_id = admin_user.id if admin_user else uuid.uuid4()

        # 2. Academic Year
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

        # 3. Grade Scales (A+, A, B+, B, C, D, F)
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

        # 4. Exam Types
        exam_types_data = [
            ("Mid-Term Examination", "Mid-term comprehensive curricular evaluation", 40.0),
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

        # 5. Exam Sessions
        exams_config = [
            (
                "Term 1 Mid-Term Examination 2026",
                "Mid-Term Examination",
                date(2026, 9, 15),
                date(2026, 9, 25),
            ),
            (
                "Quarterly Assessment Session 2025-2026",
                "Quarterly Assessment",
                date(2025, 11, 10),
                date(2025, 11, 18),
            ),
            (
                "Annual Preparatory Examination 2026",
                "Annual Preparatory Examination",
                date(2026, 2, 20),
                date(2026, 3, 5),
            ),
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

        # 6. Classes & Subjects
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

        # 7. Create ExamSubject mappings and Marks for each Exam
        # Pre-set marks profile for Liam Smith (ADM-2026-0001) across 3 exams
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

        # Classmate variations to generate a realistic class rank
        classmate_offsets = {
            1: -3.0,  # Emma Smith
            2: -6.0,  # Noah Williams
            3: -9.0,  # Olivia Williams
            4: -12.0, # James Jones
            5: -15.0, # Sophia Jones
            6: -18.0, # Lucas Miller
            7: -22.0, # Ava Miller
            8: -25.0, # Ethan Rodriguez
            9: -28.0, # Mia Rodriguez
        }

        for exam in exam_objs:
            # Create ExamSubjects for each class and subject
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

            # Now create Marks and ExamResults for all students
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

                    # Score determination
                    if std_idx == 0:  # Liam Smith
                        score = liam_marks_profile.get(exam.name, {}).get(subj.name, 90.0)
                        remarks = "Demonstrates outstanding analytical & problem-solving abilities."
                    else:
                        offset = classmate_offsets.get(std_idx, -10.0)
                        base_score = liam_marks_profile.get(exam.name, {}).get(subj.name, 90.0)
                        score = max(45.0, min(99.0, base_score + offset + (std_idx % 3)))
                        remarks = "Good performance, keep up the effort."

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

                existing_er = db.execute(
                    select(ExamResult).where(
                        ExamResult.exam_id == exam.id,
                        ExamResult.student_id == std.id,
                    )
                ).scalar_one_or_none()

                # Rank: Liam Smith is #1 in Mid-Term & Annual, #2 in Quarterly
                if std_idx == 0:
                    rank = 1 if "Quarterly" not in exam.name else 2
                else:
                    rank = std_idx + 1 if "Quarterly" not in exam.name else (1 if std_idx == 1 else std_idx + 1)

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

        db.commit()
        print("[✓] Successfully seeded 3 Published Examinations, Subjects, Marks, and Official Report Cards for Liam Smith and class roster!")
    except Exception as e:
        db.rollback()
        print(f"[!] Error seeding examination records: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_exams_and_report_cards()
