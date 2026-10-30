# Ever Grow Schools ERP — Windows Desktop Application & Online Cloud Architecture Guide

This guide explains how to develop, test, package, and deploy the **Ever Grow Schools ERP** professional Windows Desktop application and connect it to a centralized online PostgreSQL database.

---

## 1. System Architecture Overview

```
┌────────────────────────────────────────────────────────┐
│  Client Workstations (Principal, Admin, Teachers)       │
│                                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Windows Desktop Application (.exe / Electron)     │  │
│  │  - Context Isolation: ON                         │  │
│  │  - Node Integration: OFF                         │  │
│  │  - Secure Preload Bridge                         │  │
│  │  - React 19 + TypeScript + Tailwind CSS UI       │  │
│  │  - Dynamic Server Endpoint Configurator          │  │
│  └────────────────────────┬─────────────────────────┘  │
└───────────────────────────┼────────────────────────────┘
                            │
               Secure HTTPS REST API (Port 443)
                            │
┌───────────────────────────▼────────────────────────────┐
│  Online Cloud Infrastructure (Render / AWS / VPS)       │
│                                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │ FastAPI Backend (Python 3.13 / Uvicorn)          │  │
│  │  - JWT Bearer Authentication (HS256)             │  │
│  │  - SlowAPI Rate Limiting & Audit Logging         │  │
│  │  - ReportLab PDF & Excel Generators              │  │
│  └────────────────────────┬─────────────────────────┘  │
│                           │ SQLAlchemy 2.0 (psycopg)   │
│  ┌────────────────────────▼─────────────────────────┐  │
│  │ Managed PostgreSQL 16 Database                   │  │
│  │  - Shared persistent database across campus      │  │
│  │  - Alembic Schema Migrations                     │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

---

## 2. Side-by-Side Development (Web & Desktop)

You can develop and update both the web version and the desktop application side-by-side from the same repository:

| Command | Target | Description |
| :--- | :--- | :--- |
| `npm run dev` | **Web** | Starts the Vite React dev server at `http://localhost:5173` |
| `npm run desktop:dev` | **Desktop** | Starts Vite and opens the native Windows Electron window with hot-reload |
| `npm run backend` | **Backend** | Starts the FastAPI server at `http://localhost:8000` |
| `npm run build` | **Web Build** | Compiles production bundle to `frontend/dist` |
| `npm run desktop:pack` | **Desktop Unpacked** | Creates unpacked Windows desktop app folder (`dist-electron/win-unpacked`) |
| `npm run desktop:build` | **Windows Installer** | Builds complete Windows Setup installer (`dist-electron/Ever Grow Schools ERP Setup 1.0.0.exe`) |

---

## 3. Building the Windows Desktop Installer

To produce the installable Windows executable:

```powershell
npm run desktop:build
```

### Output Artifacts:
- **Installer Executable**: `dist-electron/Ever Grow Schools ERP Setup 1.0.0.exe`
- **Unpacked App (Direct Run)**: `dist-electron/win-unpacked/Ever Grow Schools ERP.exe`

### Windows Installation Features:
- **Interactive Wizard**: Destination directory selection.
- **Desktop Shortcut**: Automatically places a branded shortcut on the user's Desktop.
- **Start Menu**: Adds "Ever Grow Schools ERP" to Windows Start Menu.
- **Clean Uninstaller**: Standard Windows Control Panel uninstaller included.

---

## 4. Connecting to an Online PostgreSQL Database

### Step A: Set up Online PostgreSQL
You can use any managed PostgreSQL 15/16 provider (Supabase, Neon, AWS RDS, DigitalOcean, Railway, or an on-premise Linux server).

Note your connection string:
```
postgresql+psycopg://<user>:<password>@<db-host>:5432/<database_name>
```

### Step B: Deploy Backend API
1. Copy `backend/.env.production.example` to `backend/.env.production` on your server.
2. Set your production secrets:
   ```ini
   DATABASE_URL=postgresql+psycopg://school_user:SecretPass123@db.example.com:5432/school_erp_db
   SECRET_KEY=generate-a-strong-random-key-here
   CORS_ORIGINS=https://app.yourdomain.com,null,file://
   ```
3. Run migrations on the remote database:
   ```bash
   alembic upgrade head
   ```
4. Seed initial demo data / super admin:
   ```bash
   python scripts/init_demo_data.py
   python scripts/create_adrin_user.py
   ```
5. Run using Docker Compose:
   ```bash
   docker-compose up -d --build
   ```

### Step C: Connect Desktop App to Online Backend
1. Launch the **Ever Grow Schools ERP** desktop application.
2. On the Login Screen, click **"Configure Server Endpoint"** at the bottom.
3. Enter your online backend URL (e.g. `https://api.your-school.com/api/v1`).
4. Click **"Save & Connect"**. The desktop app will remember this server and connect to your online PostgreSQL database!

---

## 5. Security Architecture

1. **Zero Credential Bundling**:
   - Database credentials, passwords, and JWT signing keys remain exclusively on the backend server.
   - The desktop client stores only the user's temporary JWT access token in isolated client storage.

2. **Electron Hardening**:
   - `nodeIntegration: false` — Renderer process cannot access native OS or filesystem directly.
   - `contextIsolation: true` — JavaScript context in renderer is isolated from Electron's main process.
   - `sandbox: true` — Chromium process sandbox active.
   - External links (`https:`, `mailto:`) automatically open in the user's default browser (e.g. Chrome, Edge), preventing window hijacking.

---

## 6. Automated Testing

To verify backend tests:
```powershell
cd backend
$env:DISABLE_SQLALCHEMY_CEXT="1"
.\.venv\Scripts\pytest.exe -v
```
All 34 automated unit and integration tests validate authentication, permissions, attendance, examination, and report generation.
