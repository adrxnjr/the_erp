import os

os.environ.setdefault("DISABLE_SQLALCHEMY_CEXT", "1")

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
from app.core.config import settings
from app.core.logging import logger

is_sqlite = "sqlite" in str(settings.DATABASE_URL)

connect_args = (
    {"connect_timeout": 3}
    if "psycopg" in str(settings.DATABASE_URL)
    else ({"check_same_thread": False} if is_sqlite else {})
)

engine_kwargs = {"pool_pre_ping": True}
if not is_sqlite:
    engine_kwargs["pool_size"] = settings.DB_POOL_SIZE
    engine_kwargs["max_overflow"] = settings.DB_MAX_OVERFLOW

# Create SQLAlchemy 2.0 engine
engine = create_engine(
    str(settings.DATABASE_URL),
    connect_args=connect_args,
    **engine_kwargs,
)

# Standard sessionmaker for application workflows
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    expire_on_commit=False,
)


def check_db_connectivity(db_session: Session | None = None) -> bool:
    """
    Safely checks whether the database is responsive.
    Returns True if connected and queryable, False otherwise.
    Never raises an uncaught exception or leaks credentials.
    """
    try:
        if db_session is not None:
            db_session.execute(text("SELECT 1"))
            return True
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
            return True
    except Exception as exc:
        logger.warning(f"Database health check failed: {type(exc).__name__}")
        return False
