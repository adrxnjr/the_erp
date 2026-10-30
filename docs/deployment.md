# Deployment Guide: School ERP System

## 1. Local Deployment (Development)

### Option A: Using Docker Compose
Ensure Docker Desktop or Docker Engine is running:
```powershell
# Start PostgreSQL 16 container
docker compose up -d

# Verify container health
docker compose ps
```

### Option B: Using Local PostgreSQL (Without Docker)
1. Install PostgreSQL 16 on your Windows / Linux host.
2. Create database `school_erp_db`:
   ```sql
   CREATE DATABASE school_erp_db;
   CREATE USER postgres WITH PASSWORD 'postgres';
   GRANT ALL PRIVILEGES ON DATABASE school_erp_db TO postgres;
   ```
3. Update `backend/.env` with your host port and credentials.

### Backend Startup
```powershell
cd backend
.\.venv\Scripts\Activate.ps1
alembic upgrade head
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

---

## 2. Production Deployment Considerations

1. **Environment Variables**:
   - Set `DEBUG=False`
   - Set `APP_ENV=production`
   - Generate high-entropy `SECRET_KEY` (minimum 32 random characters).
   - Configure strict `CORS_ORIGINS` pointing strictly to school domain.

2. **Database**:
   - Managed PostgreSQL instance with automated backups and read-replicas if scaling past 3,000 students.
   - Run Alembic migrations as a pre-deploy release step:
     ```bash
     alembic upgrade head
     ```

3. **Process Supervision & ASGI**:
   - Use `uvicorn` managed under `systemd` or container orchestration (e.g., Kubernetes / Docker Swarm) with multi-worker Gunicorn/Uvicorn configuration:
     ```bash
     uvicorn app.main:app --workers 4 --host 0.0.0.0 --port 8000
     ```

4. **Reverse Proxy & HTTPS**:
   - Place Nginx, Caddy, or AWS ALB in front of the application for SSL termination, HTTP/2 or HTTP/3, and gzip/brotli compression.
