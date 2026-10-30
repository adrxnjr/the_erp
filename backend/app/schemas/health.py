from datetime import datetime, timezone
from typing import Optional
from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    """
    Standard schema for application and database health checks.
    Separates application availability from database connectivity.
    """
    status: str = Field(..., description="Overall service status ('ok' or 'degraded')")
    database: str = Field(..., description="Database connectivity status ('connected' or 'disconnected')")
    app_name: str = Field(..., description="Application name")
    environment: str = Field(..., description="Application environment")
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), description="Timestamp of the health check")

    model_config = {
        "json_schema_extra": {
            "example": {
                "status": "ok",
                "database": "connected",
                "app_name": "School ERP System",
                "environment": "development",
                "timestamp": "2026-10-29T14:15:00Z"
            }
        }
    }
