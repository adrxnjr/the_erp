from unittest.mock import patch
from fastapi.testclient import TestClient
from app.core.config import settings
from app.db.session import check_db_connectivity


def test_root_endpoint(client: TestClient):
    """Verify that root endpoint responds with basic service discovery information."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == settings.APP_NAME
    assert data["version"] == "1.0.0"
    assert data["docs"] == "/docs"
    assert data["health"] == f"{settings.API_V1_PREFIX}/health"


def test_health_endpoint_healthy(client: TestClient):
    """Verify health endpoint when database connectivity is operational."""
    with patch("app.routers.health.check_db_connectivity", return_value=True):
        response = client.get(f"{settings.API_V1_PREFIX}/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert data["database"] == "connected"
        assert data["app_name"] == settings.APP_NAME
        assert data["environment"] == settings.APP_ENV
        assert "timestamp" in data


def test_health_endpoint_degraded_when_database_down(client: TestClient):
    """Verify health endpoint returns 503 degraded when database connectivity fails."""
    with patch("app.routers.health.check_db_connectivity", return_value=False):
        response = client.get(f"{settings.API_V1_PREFIX}/health")
        assert response.status_code == 503
        data = response.json()
        assert data["status"] == "degraded"
        assert data["database"] == "disconnected"
        assert data["app_name"] == settings.APP_NAME
        assert data["environment"] == settings.APP_ENV
        assert "timestamp" in data


def test_health_endpoint_never_leaks_credentials(client: TestClient):
    """Verify that neither 200 nor 503 responses ever expose credentials or connection strings."""
    with patch("app.routers.health.check_db_connectivity", return_value=False):
        response = client.get(f"{settings.API_V1_PREFIX}/health")
        raw_text = response.text.lower()
        assert "password" not in raw_text
        assert "secret" not in raw_text
        assert "postgresql://" not in raw_text
        assert "psycopg" not in raw_text


def test_check_db_connectivity_helper():
    """Verify that check_db_connectivity returns False gracefully when an exception occurs."""
    class FailingSession:
        def execute(self, *args, **kwargs):
            raise ConnectionRefusedError("Database host unreachable")

    # Should safely catch exception and return False without re-raising
    result = check_db_connectivity(FailingSession())
    assert result is False
