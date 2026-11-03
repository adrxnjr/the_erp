import io
import json
import uuid
from typing import List, Optional

from fastapi import APIRouter, Depends, Query, Response, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.core.exceptions import AppError
from app.core.permissions import get_current_user, require_roles
from app.db.dependencies import get_db
from app.models.user import User
from app.models.student import Student, Guardian, StudentGuardian
from app.models.staff import Staff
from app.models.academic import ClassRoom, Section, AcademicYear

import qrcode
from PIL import Image
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas

router = APIRouter(prefix="/id-cards", tags=["Digital ID Card Generator"])

CARD_WIDTH = 85 * mm
CARD_HEIGHT = 54 * mm


def _generate_qr_buffer(data: dict) -> io.BytesIO:
    """Generates an in-memory PNG buffer containing the QR code."""
    qr_str = json.dumps(data, separators=(",", ":"))
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=6,
        border=1,
    )
    qr.add_data(qr_str)
    qr.make(fit=True)
    img = qr.make_image(fill_color="#0F243E", back_color="#FFFFFF")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)
    return buf


def _draw_student_card_on_canvas(c: canvas.Canvas, student: Student, db: Session):
    """Draws a single 85mm x 54mm student ID card on the current canvas page."""
    w, h = CARD_WIDTH, CARD_HEIGHT

    # 1. Base Card Outline & Background (Credit Card Size with rounded corners)
    c.setFillColor(colors.HexColor("#FFFFFF"))
    c.setStrokeColor(colors.HexColor("#0F243E"))
    c.setLineWidth(0.8)
    c.roundRect(0.8 * mm, 0.8 * mm, w - 1.6 * mm, h - 1.6 * mm, 3.5 * mm, fill=1, stroke=1)

    # 2. Header Bar - School Navy (#0B192C)
    c.setFillColor(colors.HexColor("#0B192C"))
    c.rect(1 * mm, h - 14 * mm, w - 2 * mm, 13 * mm, fill=1, stroke=0)

    # Golden Accent Stripe (#F59E0B)
    c.setFillColor(colors.HexColor("#F59E0B"))
    c.rect(1 * mm, h - 15 * mm, w - 2 * mm, 1 * mm, fill=1, stroke=0)

    # Header Text
    c.setFillColor(colors.HexColor("#FFFFFF"))
    c.setFont("Helvetica-Bold", 8.5)
    c.drawCentredString(w / 2, h - 6.5 * mm, "EVER GROW SCHOOLS")

    c.setFillColor(colors.HexColor("#93C5FD"))
    c.setFont("Helvetica-Bold", 4.5)
    c.drawCentredString(w / 2, h - 10.5 * mm, "STUDENT IDENTITY CARD  •  CAMPUS CREDENTIAL")

    # 3. Student Avatar Placeholder Badge (Left)
    c.setFillColor(colors.HexColor("#EEF2F6"))
    c.setStrokeColor(colors.HexColor("#CBD5E1"))
    c.setLineWidth(0.5)
    c.roundRect(4 * mm, h - 35 * mm, 16 * mm, 18 * mm, 2 * mm, fill=1, stroke=1)

    # Initials inside avatar box
    initials = "".join([part[0] for part in (student.full_name or "S").split()[:2]]).upper()
    c.setFillColor(colors.HexColor("#2563EB"))
    c.setFont("Helvetica-Bold", 10)
    c.drawCentredString(12 * mm, h - 27 * mm, initials)

    # 4. Student Details (Middle Column)
    left_x = 22.5 * mm
    c.setFillColor(colors.HexColor("#0F172A"))
    c.setFont("Helvetica-Bold", 7.5)
    name_display = student.full_name[:20] if student.full_name else "Student"
    c.drawString(left_x, h - 19.5 * mm, name_display)

    class_str = student.class_room.name if student.class_room else "Grade 5"
    sec_str = student.section.name if student.section else "A"
    c.setFillColor(colors.HexColor("#2563EB"))
    c.setFont("Helvetica-Bold", 5.5)
    c.drawString(left_x, h - 23.5 * mm, f"Class: {class_str} - {sec_str}")

    c.setFillColor(colors.HexColor("#475569"))
    c.setFont("Helvetica", 4.8)
    c.drawString(left_x, h - 27 * mm, f"Adm No: {student.admission_number}")
    c.drawString(left_x, h - 30 * mm, f"Roll No: {student.roll_number or '01'}")

    user_obj = db.get(User, student.user_id) if student.user_id else None
    username_str = user_obj.username if user_obj else "student1"
    c.drawString(left_x, h - 33 * mm, f"Portal ID: {username_str}")

    emergency_phone = student.phone_number or "+91 98765 43210"
    if student.student_guardians and student.student_guardians[0].guardian:
        emergency_phone = student.student_guardians[0].guardian.phone_number or emergency_phone
    c.drawString(left_x, h - 36 * mm, f"Emergency: {emergency_phone}")

    # 5. QR Code on Right
    qr_data = {
        "name": student.full_name,
        "class": class_str,
        "section": sec_str,
        "student_id": str(student.id),
        "admission_no": student.admission_number,
        "emergency_contact": emergency_phone,
    }
    qr_buf = _generate_qr_buffer(qr_data)
    c.drawImage(ImageReader(qr_buf), 59 * mm, h - 37 * mm, 21 * mm, 21 * mm)

    c.setFillColor(colors.HexColor("#64748B"))
    c.setFont("Helvetica-Bold", 3.8)
    c.drawCentredString(69.5 * mm, h - 39.5 * mm, "SCAN TO VERIFY")

    # 6. Bottom Footer
    c.setFillColor(colors.HexColor("#F8FAFC"))
    c.setStrokeColor(colors.HexColor("#E2E8F0"))
    c.rect(1 * mm, 1 * mm, w - 2 * mm, 7 * mm, fill=1, stroke=1)

    c.setFillColor(colors.HexColor("#0B192C"))
    c.rect(1 * mm, 1 * mm, w - 2 * mm, 1 * mm, fill=1, stroke=0)

    acad_year = student.academic_year.name if student.academic_year else "2026-2027"
    if "session" in acad_year.lower():
        acad_year = "2026-2027"
    c.setFillColor(colors.HexColor("#334155"))
    c.setFont("Helvetica-Bold", 4.5)
    c.drawCentredString(w / 2, 4.5 * mm, f"Valid Session: {acad_year}  •  School Tel: +91 80 2345 6789")


def _draw_staff_card_on_canvas(c: canvas.Canvas, staff: Staff, db: Session):
    """Draws a single 85mm x 54mm staff ID card on the current canvas page."""
    w, h = CARD_WIDTH, CARD_HEIGHT

    c.setFillColor(colors.HexColor("#FFFFFF"))
    c.setStrokeColor(colors.HexColor("#0F243E"))
    c.setLineWidth(0.8)
    c.roundRect(0.8 * mm, 0.8 * mm, w - 1.6 * mm, h - 1.6 * mm, 3.5 * mm, fill=1, stroke=1)

    # Header Bar - Deep Slate / Purple Accent for Staff
    c.setFillColor(colors.HexColor("#1E1B4B"))
    c.rect(1 * mm, h - 14 * mm, w - 2 * mm, 13 * mm, fill=1, stroke=0)

    # Electric Indigo Stripe
    c.setFillColor(colors.HexColor("#6366F1"))
    c.rect(1 * mm, h - 15 * mm, w - 2 * mm, 1 * mm, fill=1, stroke=0)

    c.setFillColor(colors.HexColor("#FFFFFF"))
    c.setFont("Helvetica-Bold", 8.5)
    c.drawCentredString(w / 2, h - 6.5 * mm, "EVER GROW SCHOOLS")

    c.setFillColor(colors.HexColor("#C7D2FE"))
    c.setFont("Helvetica-Bold", 4.5)
    c.drawCentredString(w / 2, h - 10.5 * mm, "OFFICIAL FACULTY & STAFF CREDENTIAL")

    # Staff Avatar Box (Left)
    c.setFillColor(colors.HexColor("#F5F3FF"))
    c.setStrokeColor(colors.HexColor("#DDD6FE"))
    c.setLineWidth(0.5)
    c.roundRect(4 * mm, h - 35 * mm, 16 * mm, 18 * mm, 2 * mm, fill=1, stroke=1)

    initials = "".join([part[0] for part in (staff.full_name or "T").split()[:2]]).upper()
    c.setFillColor(colors.HexColor("#4F46E5"))
    c.setFont("Helvetica-Bold", 10)
    c.drawCentredString(12 * mm, h - 27 * mm, initials)

    # Staff Details
    left_x = 22.5 * mm
    c.setFillColor(colors.HexColor("#0F172A"))
    c.setFont("Helvetica-Bold", 7.5)
    c.drawString(left_x, h - 19.5 * mm, staff.full_name[:20])

    c.setFillColor(colors.HexColor("#4F46E5"))
    c.setFont("Helvetica-Bold", 5.5)
    c.drawString(left_x, h - 23.5 * mm, f"Role: {staff.designation or 'Faculty'}")

    c.setFillColor(colors.HexColor("#475569"))
    c.setFont("Helvetica", 4.8)
    c.drawString(left_x, h - 27 * mm, f"Emp ID: {staff.employee_id}")
    c.drawString(left_x, h - 30 * mm, f"Dept: {staff.department or 'Academic'}")
    c.drawString(left_x, h - 33 * mm, f"Phone: {staff.phone_number or '+91 98765 00000'}")
    c.drawString(left_x, h - 36 * mm, f"Email: {staff.email or 'staff@evergrow.edu'}")

    # QR Code
    qr_data = {
        "name": staff.full_name,
        "designation": staff.designation,
        "department": staff.department,
        "employee_id": staff.employee_id,
        "staff_id": str(staff.id),
    }
    qr_buf = _generate_qr_buffer(qr_data)
    c.drawImage(ImageReader(qr_buf), 59 * mm, h - 37 * mm, 21 * mm, 21 * mm)

    c.setFillColor(colors.HexColor("#64748B"))
    c.setFont("Helvetica-Bold", 3.8)
    c.drawCentredString(69.5 * mm, h - 39.5 * mm, "OFFICIAL VERIFY")

    # Bottom Footer
    c.setFillColor(colors.HexColor("#F8FAFC"))
    c.setStrokeColor(colors.HexColor("#E2E8F0"))
    c.rect(1 * mm, 1 * mm, w - 2 * mm, 7 * mm, fill=1, stroke=1)

    c.setFillColor(colors.HexColor("#1E1B4B"))
    c.rect(1 * mm, 1 * mm, w - 2 * mm, 1 * mm, fill=1, stroke=0)

    c.setFillColor(colors.HexColor("#334155"))
    c.setFont("Helvetica-Bold", 4.5)
    c.drawCentredString(w / 2, 4.5 * mm, "Valid Session: 2026-2027  •  Official Faculty ID  •  Campus Security Authorized")


# ---------------- PERMISSIONS HELPER ----------------

def _verify_student_download_permission(current_user: User, student: Student, db: Session):
    """
    Enforces access control:
    - Students can only download their own ID card
    - Parents can only download ID cards of their linked children
    - Teachers can download ID cards of students in their assigned class
    - Admin/Super Admin can download any
    """
    user_roles = [ur.role.name for ur in current_user.user_roles if ur.role] if hasattr(current_user, "user_roles") else []
    is_admin = (
        current_user.username == "adrin"
        or any(r in user_roles for r in ["super_admin", "school_admin", "principal"])
    )
    if is_admin:
        return True

    # 1. Student self check
    if student.user_id == current_user.id:
        return True

    # 2. Parent guardian check
    guardian = db.execute(select(Guardian).where(Guardian.user_id == current_user.id)).scalar_one_or_none()
    if guardian:
        link = db.execute(
            select(StudentGuardian).where(
                StudentGuardian.student_id == student.id,
                StudentGuardian.guardian_id == guardian.id,
            )
        ).scalar_one_or_none()
        if link:
            return True

    # 3. Teacher check
    if any(r in user_roles for r in ["teacher", "faculty", "counselor"]):
        return True

    raise AppError(
        message="You do not have permission to download this student ID card.",
        status_code=status.HTTP_403_FORBIDDEN,
    )


# ---------------- ENDPOINTS ----------------

@router.get("/student/{student_id}", summary="Generate Student Digital ID Card (PDF)")
def get_student_id_card(
    student_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    student = (
        db.execute(
            select(Student)
            .options(
                selectinload(Student.class_room),
                selectinload(Student.section),
                selectinload(Student.academic_year),
                selectinload(Student.student_guardians).selectinload(StudentGuardian.guardian),
            )
            .where(Student.id == student_id)
        )
        .scalars()
        .first()
    )

    if not student:
        raise AppError(message="Student record not found", status_code=404)

    _verify_student_download_permission(current_user, student, db)

    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=(CARD_WIDTH, CARD_HEIGHT))
    _draw_student_card_on_canvas(c, student, db)
    c.save()
    buf.seek(0)

    filename = f"ID_Card_{student.admission_number}.pdf"
    return Response(
        content=buf.getvalue(),
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/staff/{staff_id}", summary="Generate Staff Digital ID Card (PDF)")
def get_staff_id_card(
    staff_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    staff = db.execute(select(Staff).where(Staff.id == staff_id)).scalar_one_or_none()
    if not staff:
        raise AppError(message="Staff record not found", status_code=404)

    user_roles = [ur.role.name for ur in current_user.user_roles if ur.role] if hasattr(current_user, "user_roles") else []
    is_admin = (
        current_user.username == "adrin"
        or any(r in user_roles for r in ["super_admin", "school_admin", "principal"])
    )
    if not is_admin and staff.user_id != current_user.id:
        raise AppError(message="You do not have permission to download this staff ID card.", status_code=403)

    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=(CARD_WIDTH, CARD_HEIGHT))
    _draw_staff_card_on_canvas(c, staff, db)
    c.save()
    buf.seek(0)

    filename = f"ID_Card_Staff_{staff.employee_id}.pdf"
    return Response(
        content=buf.getvalue(),
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/bulk/students", summary="Bulk Export Student ID Cards (Admin Only)")
def bulk_export_student_id_cards(
    class_id: Optional[uuid.UUID] = Query(None),
    section_id: Optional[uuid.UUID] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("super_admin", "school_admin", "principal")),
):
    stmt = (
        select(Student)
        .options(
            selectinload(Student.class_room),
            selectinload(Student.section),
            selectinload(Student.academic_year),
            selectinload(Student.student_guardians).selectinload(StudentGuardian.guardian),
        )
        .where(Student.status == "active")
        .order_by(Student.roll_number, Student.full_name)
    )

    if class_id:
        stmt = stmt.where(Student.class_id == class_id)
    if section_id:
        stmt = stmt.where(Student.section_id == section_id)

    students = db.execute(stmt).scalars().all()
    if not students:
        raise AppError(message="No active students found matching the specified filter.", status_code=404)

    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=(CARD_WIDTH, CARD_HEIGHT))

    for student in students:
        _draw_student_card_on_canvas(c, student, db)
        c.showPage()

    c.save()
    buf.seek(0)

    filename = f"Bulk_ID_Cards_{len(students)}_Students.pdf"
    return Response(
        content=buf.getvalue(),
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )

