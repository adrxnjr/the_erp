# System Architecture: School ERP Management System

## 1. Overview
The School ERP system is a production-oriented, modular multi-tenant web application architected for single-campus schools serving 1,000–3,000 students. The system prioritizes data integrity, non-repudiation, strict authorization boundaries, and auditable transactions.

## 2. Core Architectural Layers

```
                               ┌──────────────────────────┐
                               │  Vite + React Frontend   │
                               └────────────┬─────────────┘
                                            │ HTTP / JSON
                                            ▼
                               ┌──────────────────────────┐
                               │ FastAPI Application Core │
                               └────────────┬─────────────┘
                                            │
               ┌────────────────────────────┼────────────────────────────┐
               │                            │                            │
               ▼                            ▼                            ▼
      ┌─────────────────┐          ┌─────────────────┐          ┌─────────────────┐
      │ Routers (API)   │          │ Middleware      │          │ Exceptions      │
      │ /api/v1/*       │          │ CORS, Auth      │          │ Handlers & Logs │
      └────────┬────────┘          └─────────────────┘          └─────────────────┘
               │
               ▼
      ┌─────────────────┐
      │ Dependencies    │ ─── RBAC, Token Validation, DB Sessions
      └────────┬────────┘
               │
               ▼
      ┌─────────────────┐
      │ Service Layer   │ ─── Business Rules, Transitions, Idempotency
      └────────┬────────┘
               │
               ▼
      ┌─────────────────┐
      │ Repositories    │ ─── Data Access & Safe Query Aggregation
      └────────┬────────┘
               │
               ▼
      ┌─────────────────┐
      │ SQLAlchemy ORM  │ ─── Declarative Models, Mixins, Validation
      └────────┬────────┘
               │
               ▼
      ┌─────────────────┐
      │ PostgreSQL 16   │ ─── Constraints, Indexes, JSONB Deltas
      └─────────────────┘
```

### 2.1 Backend Layers
- **Routers (`app/routers/`)**: Handle HTTP request routing, path parameter extraction, query parameter parsing, and schema validation. Routers delegate logic to dependencies and services.
- **Dependencies (`app/dependencies/`, `app/db/dependencies.py`)**: Reusable FastAPI dependencies providing transactional database sessions, current authenticated user resolution, portal validation, and fine-grained RBAC permission guards.
- **Services (`app/services/`)**: Encapsulate all business logic, workflow state machines (admissions, attendance locking, examination result approval, financial transactions), and audit logging triggers.
- **Repositories (`app/repositories/`)**: Abstract database queries, preventing N+1 queries through explicit joins/eager loading, and standardizing pagination, filtering, and sorting.
- **Models (`app/models/`)**: Declarative SQLAlchemy 2.0 ORM entities mapped to PostgreSQL tables with explicit primary keys, foreign keys, cascade rules, and check constraints.
- **Schemas (`app/schemas/`)**: Pydantic v2 data transfer objects enforcing incoming request validation and sanitized response serialization.

## 3. Data Integrity & Invariants
1. **Never Hard Delete**: Soft-deletes are enforced via `is_active`, `is_closed`, `status`, or archival records.
2. **One Active Academic Year**: Enforced via partial unique index (`uq_academic_years_single_active` on `is_active` where `is_active = true`).
3. **Decimal Arithmetic**: All monetary values use PostgreSQL `NUMERIC` and Python `Decimal` to eliminate floating-point rounding errors.
4. **Idempotency**: Financial payments and state transitions enforce idempotency keys to prevent duplicate entries.
5. **Immutable Audit Logs**: Sensitive operations write before/after JSONB snapshots to `audit_logs` without storing passwords or tokens.
