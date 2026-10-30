import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


class FeeHeadBase(BaseModel):
    name: str = Field(..., max_length=100)
    code: str = Field(..., max_length=20)
    description: Optional[str] = None
    is_refundable: bool = False


class FeeHeadCreate(FeeHeadBase):
    pass


class FeeHeadResponse(FeeHeadBase):
    id: uuid.UUID
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class FeeStructureCreate(BaseModel):
    academic_year_id: uuid.UUID
    class_id: uuid.UUID
    fee_head_id: uuid.UUID
    amount: Decimal = Field(..., gt=Decimal("0.00"))
    due_date: date
    frequency: str = "annual"


class FeeStructureResponse(BaseModel):
    id: uuid.UUID
    academic_year_id: uuid.UUID
    class_id: uuid.UUID
    fee_head_id: uuid.UUID
    amount: Decimal
    due_date: date
    frequency: str
    model_config = ConfigDict(from_attributes=True)


class StudentFeeResponse(BaseModel):
    id: uuid.UUID
    student_id: uuid.UUID
    academic_year_id: uuid.UUID
    total_amount: Decimal
    discounted_amount: Decimal
    paid_amount: Decimal
    status: str
    model_config = ConfigDict(from_attributes=True)


class PaymentCreate(BaseModel):
    student_id: uuid.UUID
    amount: Decimal = Field(..., gt=Decimal("0.00"))
    payment_method: str = Field(..., description="cash, cheque, bank_transfer, upi, card")
    transaction_reference: Optional[str] = None
    payment_date: Optional[date] = None
    remarks: Optional[str] = None


class ReceiptResponse(BaseModel):
    id: uuid.UUID
    payment_id: uuid.UUID
    receipt_number: str
    total_amount: Decimal
    issued_at: datetime
    is_cancelled: bool
    cancellation_reason: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)


class PaymentResponse(BaseModel):
    id: uuid.UUID
    student_id: uuid.UUID
    amount: Decimal
    payment_method: str
    transaction_reference: Optional[str] = None
    payment_date: date
    status: str
    receipt: Optional[ReceiptResponse] = None
    model_config = ConfigDict(from_attributes=True)


class ReceiptCancelRequest(BaseModel):
    cancellation_reason: str = Field(..., min_length=5)


class FeeConcessionCreate(BaseModel):
    student_id: uuid.UUID
    fee_head_id: Optional[uuid.UUID] = None
    concession_type: str = "fixed"
    amount: Decimal = Field(..., gt=Decimal("0.00"))
    reason: str = Field(..., min_length=5)


class FeeConcessionResponse(BaseModel):
    id: uuid.UUID
    student_id: uuid.UUID
    concession_type: str
    amount: Decimal
    reason: str
    model_config = ConfigDict(from_attributes=True)
