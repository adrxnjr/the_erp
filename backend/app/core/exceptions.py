from typing import Any, Dict, Optional
from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.core.logging import logger


class AppException(Exception):
    """Base application exception."""
    def __init__(
        self,
        message: str,
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
        code: Optional[str] = None,
        error_code: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
    ):
        self.message = message
        self.status_code = status_code
        self.code = error_code or code or "INTERNAL_SERVER_ERROR"
        self.details = details or {}
        super().__init__(message)


AppError = AppException


class NotFoundException(AppException):
    def __init__(self, message: str = "Resource not found", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            message=message,
            status_code=status.HTTP_404_NOT_FOUND,
            code="NOT_FOUND",
            details=details,
        )


class ConflictException(AppException):
    def __init__(self, message: str = "Resource already exists or conflict occurred", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            message=message,
            status_code=status.HTTP_409_CONFLICT,
            code="CONFLICT",
            details=details,
        )


class UnauthorizedException(AppException):
    def __init__(self, message: str = "Authentication required", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            message=message,
            status_code=status.HTTP_401_UNAUTHORIZED,
            code="UNAUTHORIZED",
            details=details,
        )


class ForbiddenException(AppException):
    def __init__(self, message: str = "Insufficient permissions", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            message=message,
            status_code=status.HTTP_403_FORBIDDEN,
            code="FORBIDDEN",
            details=details,
        )


class BadRequestException(AppException):
    def __init__(self, message: str = "Invalid request payload or parameters", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            message=message,
            status_code=status.HTTP_400_BAD_REQUEST,
            code="BAD_REQUEST",
            details=details,
        )


class DatabaseUnavailableException(AppException):
    def __init__(self, message: str = "Database connection unavailable"):
        super().__init__(
            message=message,
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            code="DATABASE_UNAVAILABLE",
        )


def register_exception_handlers(app: FastAPI) -> None:
    """Registers standard structured JSON exception handlers on the FastAPI app."""

    @app.exception_handler(AppException)
    async def app_exception_handler(request: Request, exc: AppException):
        logger.warning(
            f"AppException: [{exc.code}] {exc.message} - Path: {request.url.path}"
        )
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "error": {
                    "code": exc.code,
                    "message": exc.message,
                    "details": exc.details,
                }
            },
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        logger.info(f"Validation error on {request.url.path}: {exc.errors()}")
        clean_errors = []
        for err in exc.errors():
            clean_errors.append({
                "field": ".".join(str(loc) for loc in err.get("loc", [])),
                "message": err.get("msg", "Invalid value"),
                "type": err.get("type", "value_error"),
            })
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={
                "error": {
                    "code": "VALIDATION_ERROR",
                    "message": "Input validation failed",
                    "details": {"errors": clean_errors},
                }
            },
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception):
        logger.error(
            f"Unhandled exception on {request.url.path}: {str(exc)}",
            exc_info=True,
        )
        # Never leak traceback or DB connection details to users in responses
        message = "An unexpected internal server error occurred."
        if settings.DEBUG and settings.APP_ENV != "production":
            details = {"exception_type": type(exc).__name__, "hint": str(exc)}
        else:
            details = {}

        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "error": {
                    "code": "INTERNAL_SERVER_ERROR",
                    "message": message,
                    "details": details,
                }
            },
        )
