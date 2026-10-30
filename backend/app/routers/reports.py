import uuid
from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.orm import Session

from app.core.permissions import require_roles
from app.db.dependencies import get_db
from app.models.user import User
from app.services.report_service import ReportService

router = APIRouter(prefix="/reports", tags=["Reports & Analytics"])


@router.get("/attendance/excel")
def export_attendance_excel(
    class_id: uuid.UUID = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("super_admin", "school_admin", "principal", "teacher")),
):
    xlsx_bytes = ReportService.generate_attendance_excel(db, class_id)
    return Response(
        content=xlsx_bytes,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename=attendance_{class_id}.xlsx"},
    )


@router.get("/fees/excel")
def export_fees_excel(
    academic_year_id: uuid.UUID = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("super_admin", "school_admin", "principal", "accountant")),
):
    xlsx_bytes = ReportService.generate_fees_excel(db, academic_year_id)
    return Response(
        content=xlsx_bytes,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename=fees_{academic_year_id}.xlsx"},
    )
