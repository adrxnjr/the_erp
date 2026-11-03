from typing import List, Union
from pydantic import AnyHttpUrl, PostgresDsn, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(".env", "backend/.env", "../backend/.env"),
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    # General
    APP_NAME: str = "Ever Grow Schools ERP"
    APP_ENV: str = "development"
    DEBUG: bool = True
    API_V1_PREFIX: str = "/api/v1"

    # Security
    SECRET_KEY: str = "school-erp-insecure-development-secret-key-change-in-production-min-32-chars"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    @field_validator("SECRET_KEY", mode="after")
    @classmethod
    def validate_secret_key(cls, v: str, info) -> str:
        app_env = info.data.get("APP_ENV", "development")
        if app_env and app_env.lower() == "production":
            if (
                not v
                or len(v) < 32
                or "insecure" in v.lower()
                or "change-in-production" in v.lower()
                or v == "school-erp-insecure-development-secret-key-change-in-production-min-32-chars"
            ):
                raise ValueError(
                    "CRITICAL SECURITY ABORT: In production environment (APP_ENV=production), "
                    "SECRET_KEY must be a cryptographically secure random string with at least 32 characters, "
                    "and cannot use default development keys."
                )
        return v

    # Database
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "school_erp_db"
    DATABASE_URL: str | None = None

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def assemble_db_connection(cls, v: str | None, info) -> str:
        import os
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        default_sqlite = os.path.join(base_dir, "school_erp.db")

        if isinstance(v, str) and v.strip():
            url = v.strip()
            if url.startswith("sqlite:///") and "school_erp.db" in url:
                if os.path.exists(default_sqlite):
                    return f"sqlite:///{default_sqlite.replace('\\', '/')}"
            return url

        # If DATABASE_URL is not provided or empty, check if local SQLite db exists
        if os.path.exists(default_sqlite):
            return f"sqlite:///{default_sqlite.replace('\\', '/')}"

        data = info.data
        user = data.get("POSTGRES_USER", "postgres")
        password = data.get("POSTGRES_PASSWORD", "postgres")
        server = data.get("POSTGRES_SERVER", "localhost")
        port = data.get("POSTGRES_PORT", 5432)
        db = data.get("POSTGRES_DB", "school_erp_db")
        return f"postgresql+psycopg://{user}:{password}@{server}:{port}/{db}"

    # CORS
    CORS_ORIGINS: Union[List[str], str] = ["http://localhost:5173", "http://127.0.0.1:5173"]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            if v.startswith("[") and v.endswith("]"):
                # Handle JSON array string
                import json
                try:
                    return json.loads(v)
                except Exception:
                    pass
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        elif isinstance(v, list):
            return v
        return []

    # File Storage
    UPLOAD_DIR: str = "./uploads"
    REPORT_DIR: str = "./reports"
    MAX_UPLOAD_SIZE_MB: int = 10

    # Redis & Caching / Rate Limiting (optional in dev, recommended for multi-worker production)
    REDIS_URL: str | None = None

    # Logging
    LOG_LEVEL: str = "INFO"


settings = Settings()
