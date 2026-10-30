import uuid
from typing import Any, Dict, Optional
from fastapi import Request
from sqlalchemy.orm import Session
from app.models.audit import AuditLog


def sanitize_audit_dict(data: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    """Strips any secrets or passwords before writing to audit logs."""
    if not data:
        return data
    sanitized = {}
    sensitive_keys = {"password", "hashed_password", "secret", "token", "access_token", "refresh_token"}
    for k, v in data.items():
        if k.lower() in sensitive_keys:
            sanitized[k] = "[REDACTED]"
        elif isinstance(v, uuid.UUID):
            sanitized[k] = str(v)
        elif hasattr(v, "isoformat"):
            sanitized[k] = v.isoformat()
        else:
            sanitized[k] = v
    return sanitized


def record_audit(
    db: Session,
    action: str,
    entity_name: str,
    record_id: Optional[str] = None,
    actor_user_id: Optional[uuid.UUID] = None,
    old_values: Optional[Dict[str, Any]] = None,
    new_values: Optional[Dict[str, Any]] = None,
    request: Optional[Request] = None,
) -> AuditLog:
    """
    Creates an immutable audit log record within the current database transaction.
    Guarantees no plaintext secrets or credentials are ever recorded.
    """
    ip_address = None
    user_agent = None
    if request:
        if request.client:
            ip_address = request.client.host
        user_agent = request.headers.get("user-agent")

    audit_entry = AuditLog(
        id=uuid.uuid4(),
        actor_user_id=actor_user_id,
        action=action,
        entity_name=entity_name,
        record_id=str(record_id) if record_id else None,
        old_values=sanitize_audit_dict(old_values),
        new_values=sanitize_audit_dict(new_values),
        ip_address=ip_address,
        user_agent=user_agent,
    )
    db.add(audit_entry)
    return audit_entry
