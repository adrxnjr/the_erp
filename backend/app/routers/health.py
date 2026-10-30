from datetime import datetime, timezone
from fastapi import APIRouter, Depends, Response, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from app.core.config import settings
from app.db.dependencies import get_db
from app.db.session import check_db_connectivity
from app.schemas.health import HealthResponse

router = APIRouter(tags=["Health"])


@router.get(
    "/health",
    response_model=HealthResponse,
    status_code=status.HTTP_200_OK,
    responses={
        200: {"description": "Application and database are fully operational"},
        503: {"description": "Application running but database is disconnected or unreachable"},
    },
    summary="Application and Database Health Check",
    description="Returns availability of the FastAPI service and connectivity to PostgreSQL.",
)
def check_health(db: Session = Depends(get_db)):
    """
    Checks backend health and database connectivity.
    Separates application availability from database status.
    Safe against credential leaks.
    """
    is_db_connected = check_db_connectivity(db)
    timestamp = datetime.now(timezone.utc)

    if is_db_connected:
        return HealthResponse(
            status="ok",
            database="connected",
            app_name=settings.APP_NAME,
            environment=settings.APP_ENV,
            timestamp=timestamp,
        )

    # Database is not connected: Return 503 degraded status
    return JSONResponse(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        content={
            "status": "degraded",
            "database": "disconnected",
            "app_name": settings.APP_NAME,
            "environment": settings.APP_ENV,
            "timestamp": timestamp.isoformat(),
        },
    )
