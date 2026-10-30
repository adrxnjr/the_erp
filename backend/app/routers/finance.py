import uuid
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
