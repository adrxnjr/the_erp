import uuid
from datetime import datetime, timezone
from typing import Any, Dict, Optional
from sqlalchemy import DateTime, ForeignKey, Index, String, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


class AuditLog(Base):
    """
    Immutable audit log recording sensitive operations across the School ERP.
    Captures actor ID, action, affected entity, record ID, and JSON snapshots.
    Secrets (passwords, tokens) must NEVER be recorded here.
    """
    __tablename__ = "audit_logs"
    __table_args__ = (
        Index("ix_audit_logs_entity_record", "entity_name", "record_id"),
        Index("ix_audit_logs_created_at", "created_at"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, nullable=False
    )
    actor_user_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    action: Mapped[str] = mapped_column(String(100), nullable=False)
    entity_name: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    record_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    old_values: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONB, nullable=True)
    new_values: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONB, nullable=True)
    correlation_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True, index=True)
    ip_address: Mapped[Optional[str]] = mapped_column(String(45), nullable=True)
    user_agent: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    actor: Mapped[Optional["User"]] = relationship("User", foreign_keys=[actor_user_id])

    def __repr__(self) -> str:
        return f"<AuditLog {self.action} on {self.entity_name}:{self.record_id} by {self.actor_user_id}>"
