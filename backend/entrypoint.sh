#!/bin/sh
set -e

echo "Applying database migrations..."
alembic upgrade head

# Determine worker count based on CPU or environment variable (default: 4 workers)
WORKERS=${WEB_CONCURRENCY:-${WORKERS:-4}}

echo "Starting FastAPI School ERP with $WORKERS worker processes..."
exec gunicorn app.main:app \
    --workers "$WORKERS" \
    --worker-class uvicorn.workers.UvicornWorker \
    --bind 0.0.0.0:8000 \
    --timeout 120 \
    --keep-alive 5 \
    --access-logfile - \
    --error-logfile -
