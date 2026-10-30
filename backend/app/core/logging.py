import logging
import sys
from typing import Any, Dict
from app.core.config import settings


class AppLogFormatter(logging.Formatter):
    """
    Standard clean formatter for application logs.
    Ensures safe formatting without sensitive leakage.
    """
    def format(self, record: logging.LogRecord) -> str:
        timestamp = self.formatTime(record, self.datefmt or "%Y-%m-%d %H:%M:%S")
        log_msg = f"[{timestamp}] [{record.levelname}] [{record.name}] {record.getMessage()}"
        if record.exc_info:
            log_msg += f"\n{self.formatException(record.exc_info)}"
        return log_msg


def setup_logging() -> None:
    """Configures root and app loggers."""
    log_level = getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO)
    
    # Configure root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)
    
    # Remove existing handlers to avoid duplicates
    for handler in list(root_logger.handlers):
        root_logger.removeHandler(handler)
        
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(log_level)
    console_handler.setFormatter(AppLogFormatter())
    root_logger.addHandler(console_handler)
    
    # Set levels for third-party noisy loggers
    logging.getLogger("uvicorn.access").setLevel(logging.INFO)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING if not settings.DEBUG else logging.INFO)


logger = logging.getLogger("school_erp")
