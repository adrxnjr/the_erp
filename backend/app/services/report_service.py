import io
import uuid
from typing import Optional
import openpyxl
from openpyxl.styles import Alignment, Font, PatternFill
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.exceptions import AppError
from app.models.academic import ClassRoom, Section
from app.models.attendance import StudentAttendance
from app.models.finance import Payment, StudentFee
from app.models.student import Student


class ReportService:
    @staticmethod
    def generate_attendance_excel(db: Session, class_id: uuid.UUID) -> bytes:
        cls = db.execute(select(ClassRoom).where(ClassRoom.id == class_id)).scalar_one_or_none()
        if not cls:
            raise AppError(message="Class not found.", status_code=404, error_code="NOT_FOUND")

        students = list(db.execute(select(Student).where(Student.class_id == class_id)).scalars().all())

        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = f"Attendance - {cls.name}"

        # Header styling
        header_font = Font(name="Calibri", size=11, bold=True, color="FFFFFF")
        header_fill = PatternFill(start_color="1F497D", end_color="1F497D", fill_type="solid")

        headers = ["Admission No", "Roll No", "Student Name", "Total Days", "Present Days", "Percentage (%)"]
        ws.append(headers)
        for col_num in range(1, len(headers) + 1):
            cell = ws.cell(row=1, column=col_num)
            cell.font = header_font
            cell.fill = header_fill
            cell.alignment = Alignment(horizontal="center", vertical="center")

        for s in students:
            records = list(
                db.execute(
                    select(StudentAttendance).where(StudentAttendance.student_id == s.id)
                ).scalars().all()
            )
            tot = len(records)
            pres = sum(1 for r in records if r.status in ["present", "half_day"])
            pct = round((pres / tot * 100.0), 2) if tot > 0 else 0.0

            ws.append([
                s.admission_number,
                s.roll_number or "N/A",
                s.full_name,
                tot,
                pres,
                pct,
            ])

        for col in ws.columns:
            max_len = max(len(str(cell.value or "")) for cell in col)
            col_letter = openpyxl.utils.get_column_letter(col[0].column)
            ws.column_dimensions[col_letter].width = max(max_len + 4, 12)

        buffer = io.BytesIO()
        wb.save(buffer)
        buffer.seek(0)
        return buffer.getvalue()

    @staticmethod
    def generate_fees_excel(db: Session, academic_year_id: uuid.UUID) -> bytes:
        student_fees = list(
            db.execute(
                select(StudentFee).where(StudentFee.academic_year_id == academic_year_id)
            ).scalars().all()
        )

        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "Fee Register"

        header_font = Font(name="Calibri", size=11, bold=True, color="FFFFFF")
        header_fill = PatternFill(start_color="366092", end_color="366092", fill_type="solid")

        headers = ["Admission No", "Student Name", "Class", "Total Fee", "Discount", "Paid Amount", "Outstanding Due", "Status"]
        ws.append(headers)
        for col_num in range(1, len(headers) + 1):
            cell = ws.cell(row=1, column=col_num)
            cell.font = header_font
            cell.fill = header_fill
            cell.alignment = Alignment(horizontal="center", vertical="center")

        for sf in student_fees:
            std = sf.student
            cls_name = std.class_room.name if std and std.class_room else "Unassigned"
            due = sf.total_amount - sf.discounted_amount - sf.paid_amount

            ws.append([
                std.admission_number if std else "N/A",
                std.full_name if std else "N/A",
                cls_name,
                float(sf.total_amount),
                float(sf.discounted_amount),
                float(sf.paid_amount),
                float(due),
                sf.status.upper(),
            ])

        for col in ws.columns:
            max_len = max(len(str(cell.value or "")) for cell in col)
            col_letter = openpyxl.utils.get_column_letter(col[0].column)
            ws.column_dimensions[col_letter].width = max(max_len + 4, 12)

        buffer = io.BytesIO()
        wb.save(buffer)
        buffer.seek(0)
        return buffer.getvalue()
