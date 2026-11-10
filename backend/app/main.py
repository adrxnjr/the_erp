import os
from contextlib import asynccontextmanager

os.environ.setdefault("DISABLE_SQLALCHEMY_CEXT", "1")

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
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
    id_cards_router,
    tuition_router,
    social_router,
    coordinators_router,
    rewards_router,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup actions
    setup_logging()
    logger.info("Application starting up...", app_name=settings.APP_NAME)
    from app.db.init_db import init_db

    try:
        init_db()
        logger.info("Database initialized successfully.")
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")

    yield

    # Shutdown actions
    logger.info("Application shutting down...")


def create_application() -> FastAPI:
    app = FastAPI(
        title=settings.APP_NAME,
        version="1.0.0",
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
        lifespan=lifespan,
    )

    # Attach Rate Limiter
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

    # CORS configuration - Permissive for seamless server and custom domain deployment
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS or ["*"],
        allow_origin_regex=r"^https?://.*$",
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
    app.include_router(examination_router, prefix=settings.API_V1_PREFIX)
    app.include_router(attendance_router, prefix=settings.API_V1_PREFIX)
    app.include_router(timetable_router, prefix=settings.API_V1_PREFIX)
    app.include_router(finance_router, prefix=settings.API_V1_PREFIX)
    app.include_router(reports_router, prefix=settings.API_V1_PREFIX)
    app.include_router(portal_router, prefix=settings.API_V1_PREFIX)
    app.include_router(dashboards_router, prefix=settings.API_V1_PREFIX)
    app.include_router(transport_router, prefix=settings.API_V1_PREFIX)
    app.include_router(career_router, prefix=settings.API_V1_PREFIX)
    app.include_router(id_cards_router, prefix=settings.API_V1_PREFIX)
    app.include_router(tuition_router, prefix=settings.API_V1_PREFIX)
    app.include_router(social_router, prefix=settings.API_V1_PREFIX)
    app.include_router(coordinators_router, prefix=settings.API_V1_PREFIX)
    app.include_router(rewards_router, prefix=settings.API_V1_PREFIX)
    app.include_router(rewards_router, prefix="")

    # Mount /uploads for static media (photos on social wall, etc.)
    uploads_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
    os.makedirs(os.path.join(uploads_dir, "social"), exist_ok=True)
    app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

    # Mount frontend static build if present for unified full-stack server deployment
    frontend_dist = os.path.abspath(
        os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "frontend", "dist")
    )
    if os.path.exists(frontend_dist) and os.path.exists(os.path.join(frontend_dist, "index.html")):
        assets_dir = os.path.join(frontend_dist, "assets")
        if os.path.exists(assets_dir):
            app.mount("/assets", StaticFiles(directory=assets_dir), name="frontend_assets")

        @app.get("/{full_path:path}", include_in_schema=False)
        async def serve_spa(full_path: str):
            if (
                full_path.startswith("api")
                or full_path.startswith("docs")
                or full_path.startswith("openapi.json")
                or full_path.startswith("uploads")
                or full_path.startswith("redoc")
            ):
                raise HTTPException(status_code=404, detail="Not Found")
            target_file = os.path.join(frontend_dist, full_path)
            if full_path and os.path.exists(target_file) and os.path.isfile(target_file):
                return FileResponse(target_file)
            return FileResponse(os.path.join(frontend_dist, "index.html"))
    else:
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
