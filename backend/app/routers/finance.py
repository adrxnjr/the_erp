import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response, status
from sqlalchemy.orm import Session

from app.core.permissions import get_current_user, require_roles
from app.db.dependencies import get_db
from app.models.user import User
from app.schemas.finance import (
    FeeHeadCreate,
    FeeHeadResponse,
    FeeStructureCreate,
    FeeStructureResponse,
    OnlineCheckoutPaymentRequest,
    PaymentCreate,
    PaymentResponse,
    ReceiptCancelRequest,
    ReceiptResponse,
    StudentFeeResponse,
)
from app.services.finance_service import FinanceService

router = APIRouter(prefix="/finance", tags=["Finance & Fees"])


@router.post("/fee-heads", response_model=FeeHeadResponse, status_code=status.HTTP_201_CREATED)
def create_fee_head(
    payload: FeeHeadCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("super_admin", "school_admin", "accountant")),
):
    return FinanceService.create_fee_head(db, payload, current_user, request)


@router.get("/fee-heads", response_model=List[FeeHeadResponse])
def list_fee_heads(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return FinanceService.list_fee_heads(db)


@router.post("/fee-structures", response_model=FeeStructureResponse, status_code=status.HTTP_201_CREATED)
def create_fee_structure(
    payload: FeeStructureCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("super_admin", "school_admin", "accountant")),
):
    return FinanceService.create_fee_structure(db, payload, current_user)


@router.get("/fee-structures", response_model=List[FeeStructureResponse])
def list_fee_structures(
    academic_year_id: Optional[uuid.UUID] = Query(None),
    class_id: Optional[uuid.UUID] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return FinanceService.list_fee_structures(db, academic_year_id, class_id)


@router.get("/student-fee/{student_id}/{academic_year_id}", response_model=StudentFeeResponse)
def get_student_fee(
    student_id: uuid.UUID,
    academic_year_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return FinanceService.get_or_create_student_fee(db, student_id, academic_year_id)


@router.post("/payments", response_model=PaymentResponse, status_code=status.HTTP_201_CREATED)
def process_payment(
    payload: PaymentCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("super_admin", "school_admin", "accountant")),
):
    return FinanceService.process_payment(db, payload, current_user, request)


@router.post("/receipts/{receipt_id}/cancel", response_model=ReceiptResponse)
def cancel_receipt(
    receipt_id: uuid.UUID,
    payload: ReceiptCancelRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("super_admin", "school_admin", "accountant")),
):
    return FinanceService.cancel_receipt(db, receipt_id, payload, current_user, request)


@router.get("/receipts/{receipt_id}/pdf")
def download_receipt_pdf(
    receipt_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    pdf_bytes = FinanceService.generate_receipt_pdf(db, receipt_id)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=receipt_{receipt_id}.pdf"},
    )


def _build_student_fee_dict(student, db: Session):
    from sqlalchemy import select
    from app.models.finance import StudentFee, Payment

    fee_record = db.execute(select(StudentFee).where(StudentFee.student_id == student.id)).scalar_one_or_none()
    payments = list(
        db.execute(
            select(Payment).where(Payment.student_id == student.id).order_by(Payment.payment_date.desc())
        ).scalars().all()
    )

    tot_paid = sum(float(p.amount) for p in payments)

    # Standard annual fee schedule items for 2026-2027
    schedule_items = [
        {"id": "fee-term1", "category": "Term 1 Tuition & Academics", "amount": 25000.00, "due_date": "2026-08-30"},
        {"id": "fee-lab", "category": "Science Lab, IT & Robotics", "amount": 12000.00, "due_date": "2026-09-15"},
        {"id": "fee-trans", "category": "Campus Transport (Route 1)", "amount": 8000.00, "due_date": "2026-10-10"},
        {"id": "fee-term2", "category": "Term 2 Tuition & Academics", "amount": 18000.00, "due_date": "2026-12-15"},
        {"id": "fee-sports", "category": "Annual Sports & Extracurriculars", "amount": 5000.00, "due_date": "2027-01-10"},
        {"id": "fee-exam", "category": "Examination & Library Clearance", "amount": 3000.00, "due_date": "2027-02-15"},
    ]

    tot_due = sum(item["amount"] for item in schedule_items)
    balance = max(0.0, tot_due - tot_paid)
    fee_status = "paid" if balance <= 0 else ("partially_paid" if tot_paid > 0 else "unpaid")

    # Allocate paid amount progressively to determine status of each fee head
    remaining_allocation = tot_paid
    breakdown = []
    for item in schedule_items:
        cost = item["amount"]
        if remaining_allocation >= cost:
            status = "Paid"
            remaining_allocation -= cost
        elif remaining_allocation > 0:
            status = "Partially Paid"
            remaining_allocation = 0.0
        else:
            status = "Not Paid"

        breakdown.append({
            "id": item["id"],
            "category": item["category"],
            "amount": cost,
            "status": status,
            "due_date": item["due_date"],
        })

    payment_list = []
    for p in payments:
        payment_list.append({
            "id": str(p.id),
            "amount": float(p.amount),
            "method": p.payment_method.upper().replace("_", " "),
            "date": str(p.payment_date),
            "reference": p.transaction_reference or f"TXN-{str(p.id)[:8].upper()}",
            "remarks": p.remarks or "Academic Term Fee",
            "receipt_id": str(p.receipt.id) if p.receipt else None,
            "receipt_number": p.receipt.receipt_number if p.receipt else "REC-2026-0001",
            "status": "Completed",
        })

    return {
        "student_id": str(student.id),
        "student_name": student.full_name,
        "admission_number": student.admission_number,
        "class_name": student.class_room.name if student.class_room else "Grade 1",
        "section_name": student.section.name if student.section else "A",
        "academic_session": "2026-2027",
        "total_annual_fee": tot_due,
        "total_paid": tot_paid,
        "outstanding_balance": balance,
        "status": fee_status,
        "is_all_paid": (balance <= 0),
        "breakdown": breakdown,
        "receipts": payment_list,
    }


@router.post("/checkout-pay", summary="Online student/parent fee checkout using Amazon-style payment gateway")
def checkout_pay(
    payload: OnlineCheckoutPaymentRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from sqlalchemy import select, func
    from app.models.student import Student, Guardian, StudentGuardian
    from app.models.finance import Payment, Receipt, StudentFee
    from app.models.audit import AuditLog
    import random

    student = None
    if payload.student_id:
        student = db.execute(select(Student).where(Student.id == payload.student_id)).scalar_one_or_none()
    elif current_user.portal_type == "student":
        student = db.execute(select(Student).where(Student.user_id == current_user.id)).scalar_one_or_none()
        if not student:
            student = db.execute(select(Student).where(Student.admission_number == "ADM-2026-0001")).scalar_one_or_none()
    elif current_user.portal_type == "parent":
        guardian_subq = select(Guardian.id).where(
            (Guardian.user_id == current_user.id)
            | (Guardian.email == current_user.email)
            | (Guardian.phone_number == current_user.phone_number)
        )
        link = db.execute(select(StudentGuardian).where(StudentGuardian.guardian_id.in_(guardian_subq))).scalars().first()
        if link:
            student = db.get(Student, link.student_id)
        if not student:
            student = db.execute(select(Student).order_by(Student.admission_number)).scalars().first()
    else:
        student = db.execute(select(Student).order_by(Student.admission_number)).scalars().first()

    if not student:
        raise HTTPException(status_code=404, detail="Student record not found for fee payment.")

    current_year = date.today().year
    count_receipts = db.execute(
        select(func.count(Receipt.id)).where(Receipt.receipt_number.like(f"RCP-{current_year}-%"))
    ).scalar() or 0
    receipt_num = f"RCP-{current_year}-{count_receipts + 1:05d}"
    tx_ref = f"AMZN-PAY-{current_year}-{random.randint(100000, 999999)}"

    # Detailed remarks mentioning payment method and selected items
    method_label = payload.payment_method.upper().replace("_", " ")
    items_desc = f" [{', '.join(payload.selected_categories)}]" if payload.selected_categories else ""
    card_info = f" (Card ending in {payload.card_last4})" if payload.card_last4 else ""
    bank_info = f" ({payload.bank_name})" if payload.bank_name else ""
    upi_info = f" ({payload.upi_id})" if payload.upi_id else ""
    final_remarks = f"Amazon Pay Checkout: {method_label}{card_info}{bank_info}{upi_info}{items_desc}"
    if payload.promo_code:
        final_remarks += f" [Voucher Applied: {payload.promo_code}]"

    payment = Payment(
        id=uuid.uuid4(),
        student_id=student.id,
        amount=payload.amount,
        payment_method=payload.payment_method,
        transaction_reference=tx_ref,
        payment_date=date.today(),
        received_by_user_id=current_user.id,
        remarks=final_remarks[:250],
        status="completed",
    )
    db.add(payment)

    receipt = Receipt(
        id=uuid.uuid4(),
        payment_id=payment.id,
        receipt_number=receipt_num,
        total_amount=payload.amount,
        is_cancelled=False,
    )
    db.add(receipt)

    # Update StudentFee table
    sf = db.execute(select(StudentFee).where(StudentFee.student_id == student.id)).scalar_one_or_none()
    if sf:
        sf.paid_amount += payload.amount
        if sf.paid_amount >= sf.total_amount:
            sf.status = "paid"
        else:
            sf.status = "partially_paid"
    else:
        sf = StudentFee(
            id=uuid.uuid4(),
            student_id=student.id,
            academic_year_id=student.academic_year_id or uuid.uuid4(),
            total_amount=Decimal("71000.00"),
            paid_amount=payload.amount,
            status="partially_paid",
        )
        db.add(sf)

    db.add(
        AuditLog(
            id=uuid.uuid4(),
            actor_user_id=current_user.id,
            action="ONLINE_FEE_CHECKOUT",
            entity_name="payments",
            record_id=str(payment.id),
            new_values={
                "receipt_number": receipt_num,
                "amount": str(payload.amount),
                "method": payload.payment_method,
                "student_id": str(student.id),
                "tx_ref": tx_ref,
            },
            ip_address=request.client.host if request and request.client else "unknown",
            user_agent=request.headers.get("user-agent", "unknown") if request else "unknown",
        )
    )
    db.commit()

    updated_ledger = _build_student_fee_dict(student, db)

    return {
        "success": True,
        "message": f"Payment of ${float(payload.amount):,.2f} completed successfully!",
        "receipt": {
            "id": str(receipt.id),
            "receipt_number": receipt_num,
            "transaction_reference": tx_ref,
            "amount": float(payload.amount),
            "payment_method": method_label,
            "date": str(payment.payment_date),
            "remarks": final_remarks,
        },
        "updated_ledger": updated_ledger,
    }


@router.post("/reset-demo-fees", summary="Reset student fee dues to initial state for testing")
def reset_demo_fees(
    student_id: Optional[uuid.UUID] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from sqlalchemy import select, delete
    from app.models.student import Student
    from app.models.finance import Payment, Receipt, StudentFee

    student = None
    if student_id:
        student = db.execute(select(Student).where(Student.id == student_id)).scalar_one_or_none()
    elif current_user.portal_type == "student":
        student = db.execute(select(Student).where(Student.user_id == current_user.id)).scalar_one_or_none()
        if not student:
            student = db.execute(select(Student).where(Student.admission_number == "ADM-2026-0001")).scalar_one_or_none()
    else:
        student = db.execute(select(Student).order_by(Student.admission_number)).scalars().first()

    if not student:
        raise HTTPException(status_code=404, detail="Student not found.")

    # Remove extra payments and receipts beyond initial base payments
    all_payments = list(
        db.execute(select(Payment).where(Payment.student_id == student.id).order_by(Payment.payment_date.asc())).scalars().all()
    )
    # Keep first 3 base payments ($25,000, $12,000, $8,000 = $45,000)
    for p in all_payments[3:]:
        if p.receipt:
            db.delete(p.receipt)
        db.delete(p)

    sf = db.execute(select(StudentFee).where(StudentFee.student_id == student.id)).scalar_one_or_none()
    if sf:
        sf.total_amount = Decimal("71000.00")
        sf.paid_amount = Decimal("45000.00")
        sf.status = "partially_paid"

    db.commit()
    return {"success": True, "message": "Fee ledger reset to initial pending dues state.", "updated_ledger": _build_student_fee_dict(student, db)}



@router.get("/parent/family-fees", summary="Get fee statements for all children of current parent")
def get_parent_family_fees(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from sqlalchemy import select
    from app.models.student import Student, Guardian, StudentGuardian

    guardian_subq = select(Guardian.id).where(
        (Guardian.user_id == current_user.id)
        | (Guardian.email == current_user.email)
        | (Guardian.phone_number == current_user.phone_number)
    )
    links = list(
        db.execute(select(StudentGuardian).where(StudentGuardian.guardian_id.in_(guardian_subq))).scalars().all()
    )
    student_ids = [l.student_id for l in links]

    if not student_ids:
        # Fallback to first 2 demo students if parent has no linked children
        demo_students = list(db.execute(select(Student).order_by(Student.admission_number).limit(2)).scalars().all())
    else:
        demo_students = list(
            db.execute(select(Student).where(Student.id.in_(student_ids)).order_by(Student.admission_number)).scalars().all()
        )

    children_fees = [_build_student_fee_dict(s, db) for s in demo_students]
    total_annual = sum(cf["total_annual_fee"] for cf in children_fees)
    total_paid = sum(cf["total_paid"] for cf in children_fees)
    total_bal = sum(cf["outstanding_balance"] for cf in children_fees)

    return {
        "family_summary": {
            "total_annual_fee": total_annual,
            "total_paid": total_paid,
            "outstanding_balance": total_bal,
            "is_all_paid": (total_bal <= 0),
            "total_children": len(children_fees),
        },
        "children": children_fees,
    }


@router.get("/my-fees", summary="Get fee dues, breakdown and payment receipts for current student")
def get_my_fees(
    student_id: Optional[uuid.UUID] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from sqlalchemy import select
    from app.models.student import Student, Guardian, StudentGuardian

    student = None
    if student_id:
        student = db.execute(select(Student).where(Student.id == student_id)).scalar_one_or_none()
    elif current_user.portal_type == "student":
        student = db.execute(select(Student).where(Student.user_id == current_user.id)).scalar_one_or_none()
        if not student and current_user.email:
            student = db.execute(select(Student).where(Student.email == current_user.email)).scalar_one_or_none()
        if not student:
            student = db.execute(select(Student).where(Student.admission_number == "ADM-2026-0001")).scalar_one_or_none()
    elif current_user.portal_type == "parent":
        guardian_subq = select(Guardian.id).where(
            (Guardian.user_id == current_user.id)
            | (Guardian.email == current_user.email)
            | (Guardian.phone_number == current_user.phone_number)
        )
        link = db.execute(select(StudentGuardian).where(StudentGuardian.guardian_id.in_(guardian_subq))).scalars().first()
        if link:
            student = db.get(Student, link.student_id)
        if not student:
            student = db.execute(select(Student).order_by(Student.admission_number)).scalars().first()
    else:
        student = db.execute(select(Student).order_by(Student.admission_number)).scalars().first()

    if not student:
        raise HTTPException(status_code=404, detail="Student record not found.")

    return _build_student_fee_dict(student, db)

