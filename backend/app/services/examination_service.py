import io
import uuid
from typing import List, Optional
from fastapi import Request
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from sqlalchemy import desc, select
from sqlalchemy.orm import Session

from app.core.exceptions import AppError
from app.models.academic import ClassRoom, ClassSubject, Subject
from app.models.audit import AuditLog
from app.models.examination import (
    Exam,
    ExamResult,
    ExamSubject,
    ExamType,
    GradeScale,
    Mark,
    MarkCorrectionRequest,
)
from app.models.staff import StaffAssignment
from app.models.student import Student
from app.models.user import User
from app.schemas.examination import (
    BulkMarkEntryRequest,
    ExamCreate,
    ExamSubjectCreate,
    ExamTypeCreate,
    GradeScaleCreate,
    MarkCorrectionCreate,
    MarkCorrectionReview,
)


class ExaminationService:
    @staticmethod
    def create_exam_type(db: Session, data: ExamTypeCreate, actor: User, request: Optional[Request] = None) -> ExamType:
        existing = db.execute(select(ExamType).where(ExamType.name == data.name)).scalar_one_or_none()
        if existing:
            raise AppError(message="Exam type already exists.", status_code=409, error_code="DUPLICATE_EXAM_TYPE")

        et = ExamType(
            id=uuid.uuid4(),
            name=data.name,
            description=data.description,
            weightage=data.weightage,
        )
        db.add(et)
        db.commit()
        db.refresh(et)
        return et

    @staticmethod
    def list_exam_types(db: Session) -> List[ExamType]:
        return list(db.execute(select(ExamType)).scalars().all())

    @staticmethod
    def create_exam(db: Session, data: ExamCreate, actor: User, request: Optional[Request] = None) -> Exam:
        exam = Exam(
            id=uuid.uuid4(),
            academic_year_id=data.academic_year_id,
            exam_type_id=data.exam_type_id,
            name=data.name,
            start_date=data.start_date,
            end_date=data.end_date,
            is_published=False,
        )
        db.add(exam)
        db.commit()
        db.refresh(exam)
        return exam

    @staticmethod
    def list_exams(db: Session, academic_year_id: Optional[uuid.UUID] = None) -> List[Exam]:
        stmt = select(Exam)
        if academic_year_id:
            stmt = stmt.where(Exam.academic_year_id == academic_year_id)
        return list(db.execute(stmt).scalars().all())

    @staticmethod
    def add_exam_subject(db: Session, exam_id: uuid.UUID, data: ExamSubjectCreate, actor: User) -> ExamSubject:
        existing = db.execute(
            select(ExamSubject).where(
                ExamSubject.exam_id == exam_id,
                ExamSubject.class_id == data.class_id,
                ExamSubject.subject_id == data.subject_id,
            )
        ).scalar_one_or_none()
        if existing:
            raise AppError(message="Subject already scheduled for this exam and class.", status_code=409, error_code="DUPLICATE_EXAM_SUBJECT")

        es = ExamSubject(
            id=uuid.uuid4(),
            exam_id=exam_id,
            class_id=data.class_id,
            subject_id=data.subject_id,
            max_marks=data.max_marks,
            pass_marks=data.pass_marks,
            exam_date=data.exam_date,
            start_time=data.start_time,
            end_time=data.end_time,
        )
        db.add(es)
        db.commit()
        db.refresh(es)
        return es

    @staticmethod
    def create_grade_scale(db: Session, data: GradeScaleCreate, actor: User) -> GradeScale:
        gs = GradeScale(
            id=uuid.uuid4(),
            name=data.name,
            min_percentage=data.min_percentage,
            max_percentage=data.max_percentage,
            grade_point=data.grade_point,
            description=data.description,
        )
        db.add(gs)
        db.commit()
        db.refresh(gs)
        return gs

    @staticmethod
    def list_grade_scales(db: Session) -> List[GradeScale]:
        return list(db.execute(select(GradeScale).order_by(desc(GradeScale.min_percentage))).scalars().all())

    @staticmethod
    def record_bulk_marks(
        db: Session,
        data: BulkMarkEntryRequest,
        actor: User,
        request: Optional[Request] = None,
    ) -> List[Mark]:
        exam_sub = db.execute(select(ExamSubject).where(ExamSubject.id == data.exam_subject_id)).scalar_one_or_none()
        if not exam_sub:
            raise AppError(message="Exam subject not found.", status_code=404, error_code="NOT_FOUND")

        # Check if actor is a teacher; enforce assignment check if not admin
        is_admin = any(ur.role.name in ["super_admin", "school_admin", "principal"] for ur in actor.user_roles if ur.role)
        if not is_admin:
            assignment = db.execute(
                select(StaffAssignment).where(
                    StaffAssignment.class_id == exam_sub.class_id,
                    StaffAssignment.subject_id == exam_sub.subject_id,
                    StaffAssignment.is_active == True,
                )
            ).scalar_one_or_none()
            if not assignment:
                raise AppError(
                    message="You are not authorized to enter marks for this subject and class.",
                    status_code=403,
                    error_code="UNAUTHORIZED_TEACHER",
                )

        results = []
        for item in data.items:
            if item.marks_obtained > exam_sub.max_marks:
                raise AppError(
                    message=f"Marks obtained ({item.marks_obtained}) exceeds max marks ({exam_sub.max_marks}).",
                    status_code=400,
                    error_code="INVALID_MARKS",
                )

            existing = db.execute(
                select(Mark).where(
                    Mark.exam_subject_id == data.exam_subject_id,
                    Mark.student_id == item.student_id,
                )
            ).scalar_one_or_none()

            if existing:
                existing.marks_obtained = item.marks_obtained
                existing.is_absent = item.is_absent
                existing.status = data.status
                existing.remarks = item.remarks
                existing.entered_by_user_id = actor.id
                results.append(existing)
            else:
                m = Mark(
                    id=uuid.uuid4(),
                    exam_subject_id=data.exam_subject_id,
                    student_id=item.student_id,
                    marks_obtained=item.marks_obtained,
                    is_absent=item.is_absent,
                    status=data.status,
                    remarks=item.remarks,
                    entered_by_user_id=actor.id,
                )
                db.add(m)
                results.append(m)

        db.add(
            AuditLog(
                id=uuid.uuid4(),
                actor_user_id=actor.id,
                action="BULK_MARKS_RECORDED",
                entity_name="marks",
                new_values={"exam_subject_id": str(data.exam_subject_id), "count": len(data.items), "status": data.status},
                ip_address=request.client.host if request and request.client else "unknown",
                user_agent=request.headers.get("user-agent", "unknown") if request else "unknown",
            )
        )
        db.commit()
        for r in results:
            db.refresh(r)
        return results

    @staticmethod
    def calculate_and_publish_results(
        db: Session,
        exam_id: uuid.UUID,
        actor: User,
        request: Optional[Request] = None,
    ) -> List[ExamResult]:
        exam = db.execute(select(Exam).where(Exam.id == exam_id)).scalar_one_or_none()
        if not exam:
            raise AppError(message="Exam not found.", status_code=404, error_code="NOT_FOUND")

        # Fetch all exam subjects
        exam_subjects = list(db.execute(select(ExamSubject).where(ExamSubject.exam_id == exam_id)).scalars().all())
        if not exam_subjects:
            raise AppError(message="No subjects found for this exam.", status_code=400, error_code="NO_SUBJECTS")

        exam_subject_ids = [es.id for es in exam_subjects]
        marks = list(db.execute(select(Mark).where(Mark.exam_subject_id.in_(exam_subject_ids))).scalars().all())

        # Group marks by student
        student_marks = {}
        for m in marks:
            if m.student_id not in student_marks:
                student_marks[m.student_id] = []
            student_marks[m.student_id].append(m)

        grade_scales = list(db.execute(select(GradeScale).order_by(desc(GradeScale.min_percentage))).scalars().all())

        results = []
        for student_id, m_list in student_marks.items():
            tot_obtained = sum(m.marks_obtained for m in m_list if not m.is_absent)
            # Find max marks sum for subjects attempted
            sub_id_to_max = {es.id: es.max_marks for es in exam_subjects}
            tot_max = sum(sub_id_to_max.get(m.exam_subject_id, 100.0) for m in m_list)
            pct = (tot_obtained / tot_max * 100.0) if tot_max > 0 else 0.0

            # Determine grade
            assigned_grade = "F"
            for gs in grade_scales:
                if gs.min_percentage <= pct <= gs.max_percentage:
                    assigned_grade = gs.name
                    break

            existing_result = db.execute(
                select(ExamResult).where(
                    ExamResult.exam_id == exam_id,
                    ExamResult.student_id == student_id,
                )
            ).scalar_one_or_none()

            if existing_result:
                existing_result.total_marks_obtained = tot_obtained
                existing_result.total_max_marks = tot_max
                existing_result.percentage = round(pct, 2)
                existing_result.grade = assigned_grade
                existing_result.status = "published"
                results.append(existing_result)
            else:
                er = ExamResult(
                    id=uuid.uuid4(),
                    exam_id=exam_id,
                    student_id=student_id,
                    total_marks_obtained=tot_obtained,
                    total_max_marks=tot_max,
                    percentage=round(pct, 2),
                    grade=assigned_grade,
                    status="published",
                )
                db.add(er)
                results.append(er)

        # Calculate ranks
        results.sort(key=lambda r: r.percentage, reverse=True)
        for rank, res in enumerate(results, start=1):
            res.rank = rank

        exam.is_published = True

        db.add(
            AuditLog(
                id=uuid.uuid4(),
                actor_user_id=actor.id,
                action="EXAM_RESULTS_PUBLISHED",
                entity_name="exams",
                record_id=str(exam_id),
                new_values={"exam_id": str(exam_id), "student_count": len(results)},
                ip_address=request.client.host if request and request.client else "unknown",
                user_agent=request.headers.get("user-agent", "unknown") if request else "unknown",
            )
        )
        db.commit()
        for r in results:
            db.refresh(r)
        return results

    @staticmethod
    def generate_report_card_pdf(db: Session, exam_id: uuid.UUID, student_id: uuid.UUID) -> bytes:
        exam = db.execute(select(Exam).where(Exam.id == exam_id)).scalar_one_or_none()
        if not exam:
            raise AppError(message="Exam not found.", status_code=404, error_code="NOT_FOUND")

        student = db.execute(select(Student).where(Student.id == student_id)).scalar_one_or_none()
        if not student:
            raise AppError(message="Student not found.", status_code=404, error_code="NOT_FOUND")

        result = db.execute(
            select(ExamResult).where(ExamResult.exam_id == exam_id, ExamResult.student_id == student_id)
        ).scalar_one_or_none()

        buffer = io.BytesIO()
        p = canvas.Canvas(buffer, pagesize=letter)
        width, height = letter

        # Draw report card header
        p.setFont("Helvetica-Bold", 18)
        p.drawCentredString(width / 2.0, height - 50, "EVER GROW SCHOOLS - OFFICIAL REPORT CARD")
        p.setFont("Helvetica", 12)
        p.drawCentredString(width / 2.0, height - 70, f"Examination: {exam.name}")
        p.line(50, height - 80, width - 50, height - 80)

        # Student info
        p.setFont("Helvetica-Bold", 11)
        p.drawString(50, height - 110, f"Student Name: {student.full_name}")
        p.drawString(50, height - 128, f"Admission No: {student.admission_number}")
        p.drawString(320, height - 110, f"Roll Number: {student.roll_number or 'N/A'}")
        p.drawString(320, height - 128, f"Status: {student.status.upper()}")

        # Subject marks table
        p.line(50, height - 145, width - 50, height - 145)
        p.drawString(60, height - 160, "Subject")
        p.drawString(250, height - 160, "Max Marks")
        p.drawString(350, height - 160, "Pass Marks")
        p.drawString(450, height - 160, "Marks Obtained")
        p.line(50, height - 170, width - 50, height - 170)

        y = height - 190
        p.setFont("Helvetica", 10)
        exam_subjects = list(db.execute(select(ExamSubject).where(ExamSubject.exam_id == exam_id)).scalars().all())
        for es in exam_subjects:
            mark = db.execute(
                select(Mark).where(Mark.exam_subject_id == es.id, Mark.student_id == student_id)
            ).scalar_one_or_none()
            sub = db.execute(select(Subject).where(Subject.id == es.subject_id)).scalar_one_or_none()
            sub_name = sub.name if sub else "Subject"

            p.drawString(60, y, sub_name)
            p.drawString(250, y, str(es.max_marks))
            p.drawString(350, y, str(es.pass_marks))
            val = "ABSENT" if (mark and mark.is_absent) else str(mark.marks_obtained if mark else "N/A")
            p.drawString(450, y, val)
            y -= 20

        # Summary box
        p.line(50, y - 10, width - 50, y - 10)
        p.setFont("Helvetica-Bold", 11)
        if result:
            p.drawString(60, y - 30, f"Total Marks: {result.total_marks_obtained} / {result.total_max_marks}")
            p.drawString(250, y - 30, f"Percentage: {result.percentage}%")
            p.drawString(380, y - 30, f"Grade: {result.grade or 'N/A'}")
            p.drawString(480, y - 30, f"Rank: {result.rank or 'N/A'}")
        else:
            p.drawString(60, y - 30, "Result pending or not published.")

        p.setFont("Helvetica-Oblique", 9)
        p.drawString(50, 40, "This is an electronically generated official document by School ERP System.")
        p.showPage()
        p.save()

        buffer.seek(0)
        return buffer.getvalue()
