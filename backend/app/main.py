import os
from contextlib import asynccontextmanager

os.environ.setdefault("DISABLE_SQLALCHEMY_CEXT", "1")

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.core.config import settings
from app.core.exceptions import register_exception_handlers
from app.core.logging import logger, setup_logging
from app.core.rate_limit import limiter
from app.routers import (
    academic_router,
    attendance_router,
    auth_router,
    dashboards_router,
    examination_router,
    finance_router,
    health_router,
    portal_router,
    reports_router,
    staff_router,
    students_router,
    timetable_router,
    users_router,
    transport_router,
    career_router,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle event handler for application startup and shutdown."""
    setup_logging()
    logger.info(f"Starting {settings.APP_NAME} in [{settings.APP_ENV}] mode...")
    logger.info(f"API documentation accessible at /docs")
    yield
    logger.info(f"Shutting down {settings.APP_NAME}...")


def create_application() -> FastAPI:
    """Application factory for the School ERP backend."""
    app = FastAPI(
        title=settings.APP_NAME,
        description=(
            "Centralized Enterprise Resource Planning (ERP) REST API for School Administration, "
            "Staff, Parents, and Students."
        ),
        version="1.0.0",
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url=f"{settings.API_V1_PREFIX}/openapi.json",
        lifespan=lifespan,
    )

    # Attach Rate Limiter
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

    # CORS configuration
    if settings.CORS_ORIGINS:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=settings.CORS_ORIGINS,
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

    # Register custom exception handlers
    register_exception_handlers(app)

    # Mount API routers under /api/v1
    app.include_router(health_router, prefix=settings.API_V1_PREFIX)
    app.include_router(auth_router, prefix=settings.API_V1_PREFIX)
    app.include_router(users_router, prefix=settings.API_V1_PREFIX)
    app.include_router(academic_router, prefix=settings.API_V1_PREFIX)
    app.include_router(students_router, prefix=settings.API_V1_PREFIX)
    app.include_router(staff_router, prefix=settings.API_V1_PREFIX)
    app.include_router(attendance_router, prefix=settings.API_V1_PREFIX)
    app.include_router(timetable_router, prefix=settings.API_V1_PREFIX)
    app.include_router(examination_router, prefix=settings.API_V1_PREFIX)
    app.include_router(finance_router, prefix=settings.API_V1_PREFIX)
    app.include_router(portal_router, prefix=settings.API_V1_PREFIX)
    app.include_router(dashboards_router, prefix=settings.API_V1_PREFIX)
    app.include_router(reports_router, prefix=settings.API_V1_PREFIX)
    app.include_router(transport_router, prefix=settings.API_V1_PREFIX)
    app.include_router(career_router, prefix=settings.API_V1_PREFIX)

    @app.get("/", tags=["Root"], include_in_schema=False)
    def root():
        return {
            "name": settings.APP_NAME,
            "version": "1.0.0",
            "docs": "/docs",
            "health": f"{settings.API_V1_PREFIX}/health",
        }

    return app


app = create_application()
