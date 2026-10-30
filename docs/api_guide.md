# API Guide & Standards: School ERP System

## 1. Base URL & Versioning
All REST endpoints must be prefixed with the version identifier:
```
http://localhost:8000/api/v1
```
Interactive OpenAPI documentation is accessible at `/docs` (Swagger UI) and `/redoc`.

---

## 2. Standard Responses

### 2.1 Success Format
Single object response:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Science",
  "created_at": "2026-10-29T12:00:00Z"
}
```

### 2.2 Standard Paginated List Format
All list endpoints support pagination via `page` and `page_size` query parameters:
```json
{
  "items": [],
  "total": 120,
  "page": 1,
  "page_size": 20,
  "total_pages": 6
}
```

### 2.3 Error Responses
Errors adhere to a structured envelope and appropriate HTTP status codes:
```json
{
  "detail": {
    "code": "ENTITY_NOT_FOUND",
    "message": "Class with ID 123 not found",
    "details": null
  }
}
```

Common status codes:
- `200 OK`: Request succeeded.
- `201 Created`: Resource successfully created.
- `400 Bad Request`: Validation failure or semantic inconsistency.
- `401 Unauthorized`: Missing or invalid bearer JWT.
- `403 Forbidden`: Authenticated user lacks permission or portal mismatch.
- `404 Not Found`: Resource does not exist.
- `409 Conflict`: Unique constraint violation or state transition clash.
- `422 Unprocessable Entity`: Schema/data validation failed.
- `429 Too Many Requests`: Rate limit exceeded.
- `503 Service Unavailable`: System degraded (e.g. database down).

---

## 3. Health Check Behavior
- Endpoint: `GET /api/v1/health`
- **Connected (200 OK)**:
  ```json
  {
    "status": "ok",
    "database": "connected",
    "app_name": "School ERP System",
    "environment": "development",
    "timestamp": "2026-10-29T09:08:51Z"
  }
  ```
- **Degraded / DB Down (503 Service Unavailable)**:
  ```json
  {
    "status": "degraded",
    "database": "disconnected",
    "app_name": "School ERP System",
    "environment": "development",
    "timestamp": "2026-10-29T09:08:51Z"
  }
  ```
- **Security Rule**: Failure responses never expose database hosts, usernames, passwords, or SQL connection strings.
