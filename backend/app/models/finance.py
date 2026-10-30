import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import List, Optional
from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Index, Integer, Numeric, String, Text, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class FeeHead(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Standard billing categories (e.g. Tuition, Computer Lab, Transportation, Library).
    """
    __tablename__ = "fee_heads"

    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    code: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    is_refundable: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)


class FeeStructure(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Class-level fee schedule per academic year.
    """
    __tablename__ = "fee_structures"
    __table_args__ = (
        UniqueConstraint("academic_year_id", "class_id", "fee_head_id", name="uq_academic_class_fee_head"),
        Index("ix_fee_structures_class", "class_id"),
    )

    academic_year_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("academic_years.id", ondelete="CASCADE"), nullable=False
    )
    class_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("classes.id", ondelete="CASCADE"), nullable=False
    )
    fee_head_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("fee_heads.id", ondelete="RESTRICT"), nullable=False
    )
    amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    due_date: Mapped[date] = mapped_column(Date, nullable=False)
    frequency: Mapped[str] = mapped_column(String(20), default="annual", nullable=False)  # annual, term, monthly, one_time

    fee_head = relationship("FeeHead")
    class_room = relationship("ClassRoom")


class StudentFee(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Student-specific ledger account for an academic year.
    """
    __tablename__ = "student_fees"
    __table_args__ = (
        UniqueConstraint("student_id", "academic_year_id", name="uq_student_academic_fee"),
        Index("ix_student_fees_student", "student_id"),
    )

    student_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("students.id", ondelete="CASCADE"), nullable=False
    )
    academic_year_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("academic_years.id", ondelete="CASCADE"), nullable=False
    )
    total_amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=Decimal("0.00"), nullable=False)
    discounted_amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=Decimal("0.00"), nullable=False)
    paid_amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=Decimal("0.00"), nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="unpaid", nullable=False)  # unpaid, partially_paid, paid, overdue

    student = relationship("Student")


class FeeConcession(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Approved scholarship, sibling discount, or financial aid concession.
    """
    __tablename__ = "fee_concessions"

    student_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True
    )
    fee_head_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("fee_heads.id", ondelete="RESTRICT"), nullable=True
    )
    concession_type: Mapped[str] = mapped_column(String(20), default="fixed", nullable=False)  # fixed, percentage
    amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    reason: Mapped[str] = mapped_column(Text, nullable=False)
    approved_by_user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False
    )


class Payment(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Transaction record of fee collection.
    """
    __tablename__ = "payments"
    __table_args__ = (
        Index("ix_payments_student", "student_id"),
        Index("ix_payments_date", "payment_date"),
    )

    student_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("students.id", ondelete="CASCADE"), nullable=False
    )
    amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    payment_method: Mapped[str] = mapped_column(String(30), nullable=False)  # cash, cheque, bank_transfer, upi, card
    transaction_reference: Mapped[Optional[str]] = mapped_column(String(100), unique=True, nullable=True)
    payment_date: Mapped[date] = mapped_column(Date, default=func.current_date, nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="completed", nullable=False)  # completed, reversed
    received_by_user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False
    )
    remarks: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    student = relationship("Student", backref="payments")
    receipt = relationship("Receipt", back_populates="payment", uselist=False, cascade="all, delete-orphan")


class Receipt(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Official sequentially numbered tax/fee receipt.
    Receipt numbers cannot be modified or deleted.
    """
    __tablename__ = "receipts"

    payment_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("payments.id", ondelete="RESTRICT"), unique=True, nullable=False
    )
    receipt_number: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    total_amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    issued_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    is_cancelled: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    cancellation_reason: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    cancelled_by_user_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), nullable=True
    )

    payment = relationship("Payment", back_populates="receipt")


class FeeAdjustment(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Manual debit or credit adjustments to student accounts with audit tracking.
    """
    __tablename__ = "fee_adjustments"

    student_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True
    )
    adjustment_type: Mapped[str] = mapped_column(String(20), nullable=False)  # waiver, fine, penalty, correction
    amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    reason: Mapped[str] = mapped_column(Text, nullable=False)
    approved_by_user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False
    )
