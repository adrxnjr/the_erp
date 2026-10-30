from app.core.config import Settings


def test_settings_default_values():
    """Verify application configuration default settings."""
    settings = Settings()
    assert settings.APP_NAME == "Ever Grow Schools ERP"
    assert settings.API_V1_PREFIX == "/api/v1"
    assert settings.ALGORITHM == "HS256"
    assert settings.ACCESS_TOKEN_EXPIRE_MINUTES == 30
    assert settings.REFRESH_TOKEN_EXPIRE_DAYS == 7


def test_cors_origins_parsing():
    """Verify comma-separated and list CORS parsing."""
    settings_comma = Settings(CORS_ORIGINS="http://localhost:3000,http://localhost:5173")
    assert "http://localhost:3000" in settings_comma.CORS_ORIGINS
    assert "http://localhost:5173" in settings_comma.CORS_ORIGINS

    settings_list = Settings(CORS_ORIGINS=["http://test.local"])
    assert settings_list.CORS_ORIGINS == ["http://test.local"]


def test_database_url_assembly():
    """Verify DATABASE_URL generation from individual parameters when not explicitly set."""
    settings = Settings(
        DATABASE_URL=None,
        POSTGRES_USER="testuser",
        POSTGRES_PASSWORD="testpassword",
        POSTGRES_SERVER="db.internal",
        POSTGRES_PORT=5433,
        POSTGRES_DB="test_erp_db",
    )
    assert settings.DATABASE_URL == "postgresql+psycopg://testuser:testpassword@db.internal:5433/test_erp_db"
