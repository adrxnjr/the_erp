import uuid
from typing import Any, Dict, List, Optional
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.exceptions import AppError
from app.models.academic import ClassRoom, Section
from app.models.attendance import LeaveRequest, StudentAttendance
from app.models.examination import Exam, ExamResult, ExamSubject, Mark
from app.models.finance import Payment, Receipt, StudentFee
from app.models.student import Guardian, Student, StudentGuardian
from app.models.timetable import Period, TimetableEntry
from app.models.user import User


class PortalService:
    @staticmethod
    def verify_student_access(db: Session, user: User, student_id: uuid.UUID) -> Student:
        """
        Enforce strict isolation:
        - Students can only access their own record.
        - Parents can only access their linked children.
        - Staff / Admins can access if authorized.
        """
        student = db.execute(select(Student).where(Student.id == student_id)).scalar_one_or_none()
        if not student:
            raise AppError(message="Student not found.", status_code=404, error_code="NOT_FOUND")

        # Admin / Staff bypass
        if user.portal_type == "staff":
            return student

        # Student portal: verify user_id matches
        if user.portal_type == "student":
            if student.user_id != user.id:
                raise AppError(message="Forbidden: Cannot access another student's data.", status_code=403, error_code="FORBIDDEN")
            return student

        # Parent portal: verify guardian link
        if user.portal_type == "parent":
            # Match guardian by user_id or email
            guardian_subq = select(Guardian.id).where(
                (Guardian.user_id == user.id) | (Guardian.email == user.email)
            )
            linked = db.execute(
                select(StudentGuardian).where(
                    StudentGuardian.student_id == student_id,
                    StudentGuardian.guardian_id.in_(guardian_subq),
                )
            ).scalar_one_or_none()
            if not linked:
                raise AppError(message="Forbidden: You are not authorized to view this student.", status_code=403, error_code="FORBIDDEN")
            return student

        raise AppError(message="Forbidden.", status_code=403, error_code="FORBIDDEN")

    @staticmethod
    def get_parent_children(db: Session, parent_user: User) -> List[Dict[str, Any]]:
        guardian_subq = select(Guardian.id).where(
            (Guardian.user_id == parent_user.id) | (Guardian.email == parent_user.email)
        )
        links = list(
            db.execute(select(StudentGuardian).where(StudentGuardian.guardian_id.in_(guardian_subq))).scalars().all()
        )
        student_ids = [l.student_id for l in links]
        if not student_ids:
            return []

        students = list(db.execute(select(Student).where(Student.id.in_(student_ids))).scalars().all())
        results = []
        for s in students:
            cls_name = s.class_room.name if s.class_room else "Unassigned"
            sec_name = s.section.name if s.section else "Unassigned"
            results.append({
                "id": s.id,
                "admission_number": s.admission_number,
                "full_name": s.full_name,
                "gender": s.gender,
                "class_name": cls_name,
                "section_name": sec_name,
                "status": s.status,
            })
        return results

    @staticmethod
    def get_student_profile(db: Session, student_user: User) -> Dict[str, Any]:
        student = db.execute(select(Student).where(Student.user_id == student_user.id)).scalar_one_or_none()
        if not student:
            raise AppError(message="Student profile not linked to user account.", status_code=404, error_code="NOT_FOUND")

        return {
            "id": student.id,
            "admission_number": student.admission_number,
            "roll_number": student.roll_number,
            "full_name": student.full_name,
            "date_of_birth": student.date_of_birth,
            "gender": student.gender,
            "status": student.status,
            "class_id": student.class_id,
            "section_id": student.section_id,
            "academic_year_id": student.academic_year_id,
        }

    @staticmethod
    def get_student_attendance(db: Session, user: User, student_id: uuid.UUID) -> Dict[str, Any]:
        PortalService.verify_student_access(db, user, student_id)
        records = list(
            db.execute(
                select(StudentAttendance).where(StudentAttendance.student_id == student_id)
            ).scalars().all()
        )
        total_days = len(records)
        present_days = sum(1 for r in records if r.status in ["present", "half_day"])
        percentage = round((present_days / total_days * 100.0), 2) if total_days > 0 else 100.0

        return {
            "total_days": total_days,
            "present_days": present_days,
            "percentage": percentage,
            "records": [
                {
                    "date": r.attendance_date,
                    "session": r.session,
                    "status": r.status,
                    "remarks": r.remarks,
                }
                for r in records
            ],
        }

    @staticmethod
    def get_student_timetable(db: Session, user: User, student_id: uuid.UUID) -> List[Dict[str, Any]]:
        student = PortalService.verify_student_access(db, user, student_id)
        if not student.class_id or not student.section_id:
            return []

        entries = list(
            db.execute(
                select(TimetableEntry).where(
                    TimetableEntry.class_id == student.class_id,
                    TimetableEntry.section_id == student.section_id,
                    TimetableEntry.is_active == True,
                )
            ).scalars().all()
        )
        results = []
        for e in entries:
            results.append({
                "day_of_week": e.day_of_week,
                "period_id": e.period_id,
                "period_name": e.period.name if e.period else "Period",
                "start_time": str(e.period.start_time) if e.period else None,
                "end_time": str(e.period.end_time) if e.period else None,
                "subject_name": e.subject.name if e.subject else "Subject",
                "room_number": e.room_number,
            })
        return results

    @staticmethod
    def get_student_results(db: Session, user: User, student_id: uuid.UUID) -> List[Dict[str, Any]]:
        student = PortalService.verify_student_access(db, user, student_id)
        # Fetch published exams only
        results = list(
            db.execute(
                select(ExamResult).join(Exam, Exam.id == ExamResult.exam_id).where(
                    ExamResult.student_id == student_id,
                    Exam.is_published == True,
                    ExamResult.status == "published",
                )
            ).scalars().all()
        )
        data = []
        for r in results:
            exam = db.execute(select(Exam).where(Exam.id == r.exam_id)).scalar_one()
            data.append({
                "exam_id": exam.id,
                "exam_name": exam.name,
                "total_marks_obtained": r.total_marks_obtained,
                "total_max_marks": r.total_max_marks,
                "percentage": r.percentage,
                "grade": r.grade,
                "rank": r.rank,
            })
        return data

    @staticmethod
    def get_student_fees(db: Session, user: User, student_id: uuid.UUID) -> Dict[str, Any]:
        student = PortalService.verify_student_access(db, user, student_id)
        fee_record = db.execute(
            select(StudentFee).where(StudentFee.student_id == student_id)
        ).scalar_one_or_none()

        payments = list(
            db.execute(
                select(Payment).where(Payment.student_id == student_id)
            ).scalars().all()
        )

        return {
            "total_due": str(fee_record.total_amount if fee_record else "0.00"),
            "discount": str(fee_record.discounted_amount if fee_record else "0.00"),
            "paid_amount": str(fee_record.paid_amount if fee_record else "0.00"),
            "status": fee_record.status if fee_record else "paid",
            "payments": [
                {
                    "id": p.id,
                    "amount": str(p.amount),
                    "method": p.payment_method,
                    "date": p.payment_date,
                    "receipt_number": p.receipt.receipt_number if p.receipt else None,
                    "status": p.status,
                }
                for p in payments
            ],
        }
