import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional
from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Index,
    String,
    Text,
    JSON,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class CoordinatorProfile(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Academic, Wing, and Examination Coordinator profiles for managing campus operations.
    """
    __tablename__ = "coordinator_profiles"

    staff_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("staff.id", ondelete="SET NULL"), nullable=True, index=True
    )
    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )

    full_name: Mapped[str] = mapped_column(String(150), index=True, nullable=False)
    employee_id: Mapped[str] = mapped_column(String(50), index=True, nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    phone_number: Mapped[str] = mapped_column(String(50), nullable=False)

    designation: Mapped[str] = mapped_column(String(100), nullable=False)  # Chief Academic Coordinator, Primary Wing Coordinator
    coordinator_type: Mapped[str] = mapped_column(String(50), default="ACADEMIC", nullable=False)  # ACADEMIC, WING, EXAMINATION, ACTIVITY, DISCIPLINE
    wing: Mapped[str] = mapped_column(String(100), default="Senior Wing", nullable=False)

    allocated_grades: Mapped[Optional[Any]] = mapped_column(JSON, default=list, nullable=True)  # ["Grade 1", "Grade 2"]
    supervised_subjects: Mapped[Optional[Any]] = mapped_column(JSON, default=list, nullable=True)  # ["Mathematics", "Science"]
    office_room: Mapped[Optional[str]] = mapped_column(String(100), default="Academic Wing Rm 102", nullable=True)
    duty_responsibilities: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    is_lead: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": str(self.id),
            "staff_id": str(self.staff_id) if self.staff_id else None,
            "user_id": str(self.user_id) if self.user_id else None,
            "full_name": self.full_name,
            "employee_id": self.employee_id,
            "email": self.email,
            "phone_number": self.phone_number,
            "designation": self.designation,
            "coordinator_type": self.coordinator_type,
            "wing": self.wing,
            "allocated_grades": self.allocated_grades if isinstance(self.allocated_grades, list) else [],
            "supervised_subjects": self.supervised_subjects if isinstance(self.supervised_subjects, list) else [],
            "office_room": self.office_room,
            "duty_responsibilities": self.duty_responsibilities,
            "is_lead": self.is_lead,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

