# School ERP Management System

A centralized, production-oriented Enterprise Resource Planning (ERP) web application designed for a single school campus serving 1,000–3,000 students.

The system is built on a modular architecture separating models, schemas, routers, services, dependencies, and audit logging, backed by PostgreSQL and managed by Alembic migrations with a modern React + TypeScript + Tailwind CSS frontend.

---

## Technology Stack

- **Backend Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python 3.13 / ASGI)
- **Database ORM**: [SQLAlchemy 2.0](https://www.sqlalchemy.org/)
- **Database**: PostgreSQL 16 (accessed via `psycopg` v3)
- **Migrations**: [Alembic](https://alembic.sqlalchemy.org/)
- **Validation & Settings**: [Pydantic v2](https://docs.pydantic.dev/) and `pydantic-settings`
- **Security**: JWT Access/Refresh tokens, bcrypt password hashing, SlowAPI rate limiting
- **Document & Spreadsheet Generation**: ReportLab (PDFs), OpenPyXL (Excel `.xlsx`)
- **Frontend**: Vite + React 19 + TypeScript + Tailwind CSS + Lucide Icons
- **Testing**: [pytest](https://pytest.org/) and FastAPI `TestClient` (HTTPX)

---

## Project Structure

```
project for school/
├── .gitignore
├── docker-compose.yml              # PostgreSQL, Backend & Frontend container stack
├── PROJECT_STATUS.md               # Master 10-phase tracking document
├── README.md                       # Main project documentation
├── docs/                           # Architecture, schema, permissions, deployment docs
├── backend/
│   ├── app/
│   │   ├── main.py                 # FastAPI application factory
│   │   ├── core/                   # Security, permissions, rate-limiting, config
│   │   ├── models/                 # Users, Academic, Students, Staff, Attendance, Timetable, Exams, Finance
│   │   ├── schemas/                # Pydantic v2 validation contracts
│   │   ├── services/               # Business logic & domain services
│   │   └── routers/                # REST API route controllers
│   ├── alembic/                    # Database migrations
│   └── tests/                      # 34 automated unit & integration tests
└── frontend/
    ├── src/
    │   ├── api/                    # Axios client with interceptors
    │   ├── context/                # AuthContext & session state
    │   ├── components/             # Navbar, Sidebar, Layout shell
    │   └── pages/                  # Login, Public Enquiry, Dashboard, Students, Attendance, Timetable, Exams, Fees, Reports
    └── dist/                       # Built production bundle
```

---

## How to Run

### Option 1: Docker Compose (Full Stack)
```bash
docker-compose up --build -d
```
- Frontend UI: `http://localhost`
- Backend API Docs: `http://localhost:8000/docs`
- PostgreSQL: `localhost:5432`

---

### Option 2: Local Development

#### 1. Start Database
```bash
docker-compose up -d postgres
```

#### 2. Start Backend API
```powershell
cd backend
$env:DISABLE_SQLALCHEMY_CEXT="1"
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --port 8000
```
- Interactive Swagger UI: `http://127.0.0.1:8000/docs`
- Health check: `http://127.0.0.1:8000/api/v1/health`

#### 3. Start Frontend UI
```powershell
cd frontend
npm run dev
```
- Access application: `http://localhost:5173`

---

## Demo Credentials

| Role | Portal Tab | Username | Password | Notes |
|---|---|---|---|---|
| **Super Admin** | Staff Portal | `adrin` | `123` | Personal Super Admin account |
| **Super Admin** | Staff Portal | `superadmin_test` | `123` | System oversight demo account |
| **Principal** | Staff Portal | `staff1` | `123` | Principal management portal |
| **Teacher** | Staff Portal | `staff3` | `123` | Teaching & attendance management |
| **Parent** | Parent Portal | `parent_doe` or `parent1` | `123` | Parent & student monitoring |
| **Student** | Student Portal | `student1` | `123` | Student portal & timetable/exam view |

> **Note:** The password for **all accounts** across the system is set to **`123`**.

---

## Running Automated Tests

```powershell
cd backend
$env:DISABLE_SQLALCHEMY_CEXT="1"
.\.venv\Scripts\pytest.exe -v
```
All 34 tests execute against in-memory SQLite with 100% pass rate.
