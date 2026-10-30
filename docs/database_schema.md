# Database Schema: School ERP System

## 1. Overview
The database engine is PostgreSQL 16. All migrations are tracked strictly through Alembic. Application tables utilize UUID primary keys, timezone-aware UTC timestamps, foreign key constraints with explicit on-delete behavior, and indexes on lookup/foreign key columns.

---

## 2. Foundational Tables (Phase 1)

### 2.1 `roles`
Defines permission levels and categories for system users.
- `id`: `UUID` (Primary Key, default: `uuid4`)
- `name`: `VARCHAR(50)` (Unique, Indexed, e.g., `super_admin`, `teacher`, `accountant`, `parent`, `student`)
- `description`: `VARCHAR(255)` (Nullable)
- `is_active`: `BOOLEAN` (Default: `true`)
- `created_at`: `TIMESTAMPTZ` (Default: `now()`)
- `updated_at`: `TIMESTAMPTZ` (Default: `now()`)

### 2.2 `users`
Central user entity for all portals (Staff, Parent, Student).
- `id`: `UUID` (Primary Key, default: `uuid4`)
- `username`: `VARCHAR(100)` (Unique, Indexed)
- `email`: `VARCHAR(255)` (Unique, Indexed, Nullable)
- `hashed_password`: `VARCHAR(255)` (Argon2 / Bcrypt hash)
- `full_name`: `VARCHAR(150)`
- `phone_number`: `VARCHAR(30)` (Nullable)
- `portal_type`: `VARCHAR(30)` (`staff` or `parent_student`)
- `is_active`: `BOOLEAN` (Default: `true`)
- `is_locked`: `BOOLEAN` (Default: `false`)
- `failed_login_attempts`: `INTEGER` (Default: `0`)
- `locked_until`: `TIMESTAMPTZ` (Nullable)
- `last_login_at`: `TIMESTAMPTZ` (Nullable)
- `must_change_password`: `BOOLEAN` (Default: `false`)
- `created_at`: `TIMESTAMPTZ` (Default: `now()`)
- `updated_at`: `TIMESTAMPTZ` (Default: `now()`)

### 2.3 `user_roles`
Junction table mapping users to roles (many-to-many).
- `id`: `UUID` (Primary Key, default: `uuid4`)
- `user_id`: `UUID` (Foreign Key -> `users.id`, ON DELETE CASCADE, Indexed)
- `role_id`: `UUID` (Foreign Key -> `roles.id`, ON DELETE CASCADE, Indexed)
- `created_at`: `TIMESTAMPTZ` (Default: `now()`)
- `updated_at`: `TIMESTAMPTZ` (Default: `now()`)
- Constraint: `UNIQUE(user_id, role_id)`

### 2.4 `academic_years`
School calendar years (e.g. 2026-2027).
- `id`: `UUID` (Primary Key, default: `uuid4`)
- `name`: `VARCHAR(50)` (Unique)
- `start_date`: `DATE`
- `end_date`: `DATE`
- `is_active`: `BOOLEAN` (Default: `false`)
- `is_closed`: `BOOLEAN` (Default: `false`)
- `created_at`: `TIMESTAMPTZ` (Default: `now()`)
- `updated_at`: `TIMESTAMPTZ` (Default: `now()`)
- Index: `UNIQUE INDEX uq_academic_years_single_active ON academic_years (is_active) WHERE is_active = true`

### 2.5 `classes`
Grade / Class offerings (e.g., Grade 1, Grade 10).
- `id`: `UUID` (Primary Key, default: `uuid4`)
- `name`: `VARCHAR(100)` (Unique)
- `level`: `INTEGER` (Default: `1`)
- `description`: `VARCHAR(255)` (Nullable)
- `is_active`: `BOOLEAN` (Default: `true`)
- `created_at`: `TIMESTAMPTZ`
- `updated_at`: `TIMESTAMPTZ`

### 2.6 `sections`
Class sections (e.g., Section A, Section B).
- `id`: `UUID` (Primary Key, default: `uuid4`)
- `class_id`: `UUID` (Foreign Key -> `classes.id`, ON DELETE CASCADE, Indexed)
- `name`: `VARCHAR(50)`
- `room_number`: `VARCHAR(50)` (Nullable)
- `capacity`: `INTEGER` (Default: `40`)
- `is_active`: `BOOLEAN` (Default: `true`)
- `created_at`: `TIMESTAMPTZ`
- `updated_at`: `TIMESTAMPTZ`
- Constraint: `UNIQUE(class_id, name)`

### 2.7 `subjects`
Curriculum course offerings.
- `id`: `UUID` (Primary Key, default: `uuid4`)
- `name`: `VARCHAR(100)`
- `code`: `VARCHAR(30)` (Unique, Indexed)
- `description`: `TEXT` (Nullable)
- `is_active`: `BOOLEAN` (Default: `true`)
- `created_at`: `TIMESTAMPTZ`
- `updated_at`: `TIMESTAMPTZ`

### 2.8 `class_subjects`
Associates subjects with classes.
- `id`: `UUID` (Primary Key, default: `uuid4`)
- `class_id`: `UUID` (Foreign Key -> `classes.id`, ON DELETE CASCADE, Indexed)
- `subject_id`: `UUID` (Foreign Key -> `subjects.id`, ON DELETE CASCADE, Indexed)
- `is_elective`: `BOOLEAN` (Default: `false`)
- `is_active`: `BOOLEAN` (Default: `true`)
- `created_at`: `TIMESTAMPTZ`
- `updated_at`: `TIMESTAMPTZ`
- Constraint: `UNIQUE(class_id, subject_id)`

### 2.9 `holidays`
School calendar holidays.
- `id`: `UUID` (Primary Key, default: `uuid4`)
- `academic_year_id`: `UUID` (Foreign Key -> `academic_years.id`, ON DELETE SET NULL, Indexed, Nullable)
- `name`: `VARCHAR(150)`
- `start_date`: `DATE`
- `end_date`: `DATE`
- `description`: `VARCHAR(255)` (Nullable)
- `created_at`: `TIMESTAMPTZ`
- `updated_at`: `TIMESTAMPTZ`

### 2.10 `audit_logs`
Immutable administrative audit log.
- `id`: `UUID` (Primary Key, default: `uuid4`)
- `actor_user_id`: `UUID` (Foreign Key -> `users.id`, ON DELETE SET NULL, Indexed, Nullable)
- `action`: `VARCHAR(100)`
- `entity_name`: `VARCHAR(100)` (Indexed)
- `record_id`: `VARCHAR(100)` (Nullable)
- `old_values`: `JSONB` (Nullable)
- `new_values`: `JSONB` (Nullable)
- `correlation_id`: `VARCHAR(100)` (Indexed, Nullable)
- `ip_address`: `VARCHAR(45)` (Nullable)
- `user_agent`: `VARCHAR(255)` (Nullable)
- `created_at`: `TIMESTAMPTZ` (Default: `now()`, Indexed)
- Indexes: `(entity_name, record_id)`, `created_at`, `actor_user_id`
