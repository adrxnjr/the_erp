import io
import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import List, Optional
from fastapi import Request
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from sqlalchemy import desc, func, select
from sqlalchemy.orm import Session

from app.core.exceptions import AppError
from app.models.academic import AcademicYear, ClassRoom
from app.models.audit import AuditLog
from app.models.finance import (
    FeeAdjustment,
    FeeConcession,
    FeeHead,
    FeeStructure,
    Payment,
    Receipt,
    StudentFee,
)
from app.models.student import Student
from app.models.user import User
from app.schemas.finance import (
    FeeConcessionCreate,
    FeeHeadCreate,
    FeeStructureCreate,
    PaymentCreate,
    ReceiptCancelRequest,
)


class FinanceService:
    @staticmethod
    def create_fee_head(db: Session, data: FeeHeadCreate, actor: User, request: Optional[Request] = None) -> FeeHead:
        existing = db.execute(select(FeeHead).where((FeeHead.name == data.name) | (FeeHead.code == data.code))).scalar_one_or_none()
        if existing:
            raise AppError(message="Fee head with same name or code already exists.", status_code=409, error_code="DUPLICATE_FEE_HEAD")

        fh = FeeHead(
            id=uuid.uuid4(),
            name=data.name,
            code=data.code.upper(),
            description=data.description,
            is_refundable=data.is_refundable,
        )
        db.add(fh)
        db.commit()
        db.refresh(fh)
        return fh

    @staticmethod
    def list_fee_heads(db: Session) -> List[FeeHead]:
        return list(db.execute(select(FeeHead)).scalars().all())

    @staticmethod
    def create_fee_structure(db: Session, data: FeeStructureCreate, actor: User) -> FeeStructure:
        existing = db.execute(
            select(FeeStructure).where(
                FeeStructure.academic_year_id == data.academic_year_id,
                FeeStructure.class_id == data.class_id,
                FeeStructure.fee_head_id == data.fee_head_id,
            )
        ).scalar_one_or_none()
        if existing:
            raise AppError(message="Fee structure already assigned for this class and fee head.", status_code=409, error_code="DUPLICATE_STRUCTURE")

        fs = FeeStructure(
            id=uuid.uuid4(),
            academic_year_id=data.academic_year_id,
            class_id=data.class_id,
            fee_head_id=data.fee_head_id,
            amount=data.amount,
            due_date=data.due_date,
            frequency=data.frequency,
        )
        db.add(fs)
        db.commit()
        db.refresh(fs)
        return fs

    @staticmethod
    def list_fee_structures(db: Session, academic_year_id: Optional[uuid.UUID] = None, class_id: Optional[uuid.UUID] = None) -> List[FeeStructure]:
        stmt = select(FeeStructure)
        if academic_year_id:
            stmt = stmt.where(FeeStructure.academic_year_id == academic_year_id)
        if class_id:
            stmt = stmt.where(FeeStructure.class_id == class_id)
        return list(db.execute(stmt).scalars().all())

    @staticmethod
    def get_or_create_student_fee(db: Session, student_id: uuid.UUID, academic_year_id: uuid.UUID) -> StudentFee:
        sf = db.execute(
            select(StudentFee).where(StudentFee.student_id == student_id, StudentFee.academic_year_id == academic_year_id)
        ).scalar_one_or_none()

        if not sf:
            student = db.execute(select(Student).where(Student.id == student_id)).scalar_one_or_none()
            if not student:
                raise AppError(message="Student not found.", status_code=404, error_code="NOT_FOUND")

            # Calculate total from class fee structures
            structures = list(
                db.execute(
                    select(FeeStructure).where(
                        FeeStructure.academic_year_id == academic_year_id,
                        FeeStructure.class_id == student.class_id,
                    )
                ).scalars().all()
            )
            total = sum((fs.amount for fs in structures), Decimal("0.00"))

            sf = StudentFee(
                id=uuid.uuid4(),
                student_id=student_id,
                academic_year_id=academic_year_id,
                total_amount=total,
                discounted_amount=Decimal("0.00"),
                paid_amount=Decimal("0.00"),
                status="unpaid" if total > 0 else "paid",
            )
            db.add(sf)
            db.commit()
            db.refresh(sf)
        return sf

    @staticmethod
    def process_payment(db: Session, data: PaymentCreate, actor: User, request: Optional[Request] = None) -> Payment:
        student = db.execute(select(Student).where(Student.id == data.student_id)).scalar_one_or_none()
        if not student:
            raise AppError(message="Student not found.", status_code=404, error_code="NOT_FOUND")

        # Check idempotent transaction reference
        if data.transaction_reference:
            existing_tx = db.execute(
                select(Payment).where(Payment.transaction_reference == data.transaction_reference)
            ).scalar_one_or_none()
            if existing_tx:
                return existing_tx

        # Generate sequential receipt number
        current_year = date.today().year
        count_receipts = db.execute(
            select(func.count(Receipt.id)).where(Receipt.receipt_number.like(f"RCP-{current_year}-%"))
        ).scalar() or 0
        receipt_num = f"RCP-{current_year}-{count_receipts + 1:05d}"

        payment = Payment(
            id=uuid.uuid4(),
            student_id=data.student_id,
            amount=data.amount,
            payment_method=data.payment_method,
            transaction_reference=data.transaction_reference,
            payment_date=data.payment_date or date.today(),
            received_by_user_id=actor.id,
            remarks=data.remarks,
            status="completed",
        )
        db.add(payment)

        receipt = Receipt(
            id=uuid.uuid4(),
            payment_id=payment.id,
            receipt_number=receipt_num,
            total_amount=data.amount,
            is_cancelled=False,
        )
        db.add(receipt)

        # Update student fee ledger if exists
        sf = db.execute(
            select(StudentFee).where(
                StudentFee.student_id == data.student_id,
                StudentFee.academic_year_id == student.academic_year_id,
            )
        ).scalar_one_or_none()

        if sf:
            sf.paid_amount += data.amount
            net_due = sf.total_amount - sf.discounted_amount
            if sf.paid_amount >= net_due:
                sf.status = "paid"
            elif sf.paid_amount > 0:
                sf.status = "partially_paid"

        db.add(
            AuditLog(
                id=uuid.uuid4(),
                actor_user_id=actor.id,
                action="FEE_PAYMENT_PROCESSED",
                entity_name="payments",
                record_id=str(payment.id),
                new_values={"receipt_number": receipt_num, "amount": str(data.amount), "student_id": str(data.student_id)},
                ip_address=request.client.host if request and request.client else "unknown",
                user_agent=request.headers.get("user-agent", "unknown") if request else "unknown",
            )
        )
        db.commit()
        db.refresh(payment)
        return payment

    @staticmethod
    def cancel_receipt(
        db: Session,
        receipt_id: uuid.UUID,
        data: ReceiptCancelRequest,
        actor: User,
        request: Optional[Request] = None,
    ) -> Receipt:
        receipt = db.execute(select(Receipt).where(Receipt.id == receipt_id)).scalar_one_or_none()
        if not receipt:
            raise AppError(message="Receipt not found.", status_code=404, error_code="NOT_FOUND")

        if receipt.is_cancelled:
            raise AppError(message="Receipt is already cancelled.", status_code=400, error_code="ALREADY_CANCELLED")

        receipt.is_cancelled = True
        receipt.cancellation_reason = data.cancellation_reason
        receipt.cancelled_by_user_id = actor.id

        payment = db.execute(select(Payment).where(Payment.id == receipt.payment_id)).scalar_one()
        payment.status = "reversed"

        # Reverse paid amount on student ledger
        student = db.execute(select(Student).where(Student.id == payment.student_id)).scalar_one()
        sf = db.execute(
            select(StudentFee).where(
                StudentFee.student_id == student.id,
                StudentFee.academic_year_id == student.academic_year_id,
            )
        ).scalar_one_or_none()

        if sf:
            sf.paid_amount = max(Decimal("0.00"), sf.paid_amount - payment.amount)
            net_due = sf.total_amount - sf.discounted_amount
            if sf.paid_amount == Decimal("0.00"):
                sf.status = "unpaid"
            elif sf.paid_amount < net_due:
                sf.status = "partially_paid"
            else:
                sf.status = "paid"

        db.add(
            AuditLog(
                id=uuid.uuid4(),
                actor_user_id=actor.id,
                action="RECEIPT_CANCELLED",
                entity_name="receipts",
                record_id=str(receipt.id),
                new_values={"cancellation_reason": data.cancellation_reason},
                ip_address=request.client.host if request and request.client else "unknown",
                user_agent=request.headers.get("user-agent", "unknown") if request else "unknown",
            )
        )
        db.commit()
        db.refresh(receipt)
        return receipt

    @staticmethod
    def generate_receipt_pdf(db: Session, receipt_id: uuid.UUID) -> bytes:
        receipt = db.execute(select(Receipt).where(Receipt.id == receipt_id)).scalar_one_or_none()
        if not receipt:
            raise AppError(message="Receipt not found.", status_code=404, error_code="NOT_FOUND")

        payment = db.execute(select(Payment).where(Payment.id == receipt.payment_id)).scalar_one()
        student = db.execute(select(Student).where(Student.id == payment.student_id)).scalar_one()

        buffer = io.BytesIO()
        p = canvas.Canvas(buffer, pagesize=letter)
        width, height = letter

        p.setFont("Helvetica-Bold", 18)
        p.drawCentredString(width / 2.0, height - 50, "EVER GROW SCHOOLS - OFFICIAL FEE RECEIPT")
        if receipt.is_cancelled:
            p.setFont("Helvetica-Bold", 26)
            p.setFillColorRGB(0.8, 0, 0)
            p.drawCentredString(width / 2.0, height - 100, "*** CANCELLED / VOID ***")
            p.setFillColorRGB(0, 0, 0)

        p.line(50, height - 110, width - 50, height - 110)
        p.setFont("Helvetica", 11)
        p.drawString(50, height - 130, f"Receipt No: {receipt.receipt_number}")
        p.drawString(350, height - 130, f"Date: {payment.payment_date.strftime('%Y-%m-%d')}")
        p.drawString(50, height - 150, f"Student Name: {student.full_name}")
        p.drawString(350, height - 150, f"Admission No: {student.admission_number}")
        p.drawString(50, height - 170, f"Payment Mode: {payment.payment_method.upper()}")
        p.drawString(350, height - 170, f"Reference: {payment.transaction_reference or 'N/A'}")

        p.line(50, height - 190, width - 50, height - 190)
        p.setFont("Helvetica-Bold", 12)
        p.drawString(60, height - 210, "Description")
        p.drawString(450, height - 210, "Amount (INR/USD)")
        p.line(50, height - 220, width - 50, height - 220)

        p.setFont("Helvetica", 11)
        p.drawString(60, height - 240, "Fee Collection Payment")
        p.drawString(450, height - 240, f"{payment.amount:.2f}")

        p.line(50, height - 260, width - 50, height - 260)
        p.setFont("Helvetica-Bold", 12)
        p.drawString(350, height - 280, "Total Amount Paid:")
        p.drawString(450, height - 280, f"{receipt.total_amount:.2f}")

        if receipt.is_cancelled:
            p.setFont("Helvetica-Oblique", 10)
            p.drawString(50, height - 310, f"Reason for Cancellation: {receipt.cancellation_reason}")

        p.setFont("Helvetica-Oblique", 9)
        p.drawString(50, 50, "This is a computer-generated tax and fee receipt. No signature required.")
        p.showPage()
        p.save()

        buffer.seek(0)
        return buffer.getvalue()
