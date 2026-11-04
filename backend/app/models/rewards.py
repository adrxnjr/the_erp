import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class PointTransaction(Base, UUIDPrimaryKeyMixin):
    """
    Audit log of individual point credits and debit redemptions for a student.
    """
    __tablename__ = "point_transactions"

    student_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True
    )
    points: Mapped[int] = mapped_column(Integer, nullable=False)  # positive for earn, negative for redemption
    reason: Mapped[str] = mapped_column(String(255), nullable=False)
    category: Mapped[str] = mapped_column(
        String(50), default="MANUAL_BONUS", nullable=False
    )  # ATTENDANCE, EXAM, PUNCTUALITY, HOMEWORK, DISCIPLINE, REDEMPTION, MANUAL_BONUS
    reference_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    awarded_by: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False, index=True
    )

    student = relationship("app.models.student.Student")
    user = relationship("app.models.user.User")


class StudentPointSummary(Base, UUIDPrimaryKeyMixin):
    """
    Real-time maintained points aggregate and scholarship status tier for a student.
    """
    __tablename__ = "student_point_summaries"

    student_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("students.id", ondelete="CASCADE"), unique=True, nullable=False, index=True
    )
    total_points: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    current_level: Mapped[str] = mapped_column(
        String(20), default="BRONZE", nullable=False
    )  # BRONZE, SILVER, GOLD, CHAMPION
    points_this_month: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    points_this_term: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    last_updated: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    student = relationship("app.models.student.Student")


class Badge(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Configurable achievement badges unlocked via criteria or manual teacher commendation.
    """
    __tablename__ = "badges"

    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    icon_emoji: Mapped[str] = mapped_column(String(20), default="", nullable=False)
    category: Mapped[str] = mapped_column(
        String(50), default="ACADEMIC", nullable=False
    )  # ATTENDANCE, ACADEMIC, BEHAVIOR, SPECIAL
    criteria_type: Mapped[str] = mapped_column(
        String(50), default="POINTS_TOTAL", nullable=False
    )  # ATTENDANCE_STREAK, EXAM_SCORE, POINTS_TOTAL, MANUAL
    criteria_value: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    points_reward: Mapped[int] = mapped_column(Integer, default=50, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)


class StudentBadge(Base, UUIDPrimaryKeyMixin):
    """
    Junction record representing an earned badge by a student.
    """
    __tablename__ = "student_badges"
    __table_args__ = (
        UniqueConstraint("student_id", "badge_id", name="uq_student_badge"),
    )

    student_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True
    )
    badge_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("badges.id", ondelete="CASCADE"), nullable=False, index=True
    )
    awarded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    awarded_by: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    notes: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    badge = relationship("Badge")
    student = relationship("app.models.student.Student")


class RewardItem(Base, UUIDPrimaryKeyMixin):
    """
    Rewards store catalog item redeemable using student scholarship points.
    """
    __tablename__ = "reward_items"

    name: Mapped[str] = mapped_column(String(150), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    icon_emoji: Mapped[str] = mapped_column(String(20), default="", nullable=False)
    points_cost: Mapped[int] = mapped_column(Integer, nullable=False)
    category: Mapped[str] = mapped_column(
        String(50), default="PRIVILEGE", nullable=False
    )  # CANTEEN, STATIONERY, PRIVILEGE, RECOGNITION, TROPHY
    stock: Mapped[int] = mapped_column(Integer, default=-1, nullable=False)  # -1 means unlimited
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )


class RewardRedemption(Base, UUIDPrimaryKeyMixin):
    """
    Redemption request filed by student and processed by school administration/teacher.
    """
    __tablename__ = "reward_redemptions"

    student_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True
    )
    reward_item_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("reward_items.id", ondelete="CASCADE"), nullable=False, index=True
    )
    points_spent: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[str] = mapped_column(
        String(20), default="PENDING", nullable=False
    )  # PENDING, APPROVED, REJECTED, FULFILLED
    requested_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    processed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    processed_by: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    admin_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    reward_item = relationship("RewardItem")
    student = relationship("app.models.student.Student")
    processor = relationship("app.models.user.User")

