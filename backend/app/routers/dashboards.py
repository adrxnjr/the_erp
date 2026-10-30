from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.permissions import get_current_user, require_roles
from app.db.dependencies import get_db
from app.models.user import User
from app.services.dashboard_service import DashboardService

router = APIRouter(prefix="/dashboards", tags=["Dashboards"])


@router.get("/principal")
def get_principal_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("super_admin", "school_admin", "principal")),
):
    return DashboardService.get_principal_dashboard(db)


@router.get("/teacher")
def get_teacher_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("super_admin", "school_admin", "teacher")),
):
    return DashboardService.get_teacher_dashboard(db, current_user)


@router.get("/accountant")
def get_accountant_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("super_admin", "school_admin", "accountant")),
):
    return DashboardService.get_accountant_dashboard(db)


@router.get("/admin")
def get_admin_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("super_admin", "school_admin")),
):
    return DashboardService.get_admin_dashboard(db)


@router.get("/admin-operations")
def get_admin_operations(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("super_admin", "school_admin", "principal", "teacher")),
):
    """
    Campus operations dashboard for School Admin, Principal, and Super Admin:
    - Headcounts (Students, Teachers, Admin staff, Support staff)
    - Total institutional student attendance rate & today's roll-call
    - Low attendance radar (<75% statutory warning list)
    - Staff attendance roster
    """
    return DashboardService.get_admin_operations(db)


@router.get("/super-admin")
def get_super_admin_governance(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("super_admin", "school_admin")),
):
    """
    Executive governance dashboard for Super Admin:
    - Operational summary
    - Institutional loans & debt service portfolio
    - Accounts payable vendor bills
    - Staff workforce productivity & attendance
    """
    return DashboardService.get_super_admin_governance(db)


@router.post("/super-admin/pay-bill")
def pay_vendor_bill(
    payload: dict,
    current_user: User = Depends(require_roles("super_admin", "school_admin")),
):
    """
    Authorize and pay a vendor bill
    """
    bill_id = payload.get("bill_id", "")
    return DashboardService.pay_vendor_bill(bill_id)


@router.post("/staff-attendance/mark")
def mark_staff_attendance(
    payload: dict,
    current_user: User = Depends(require_roles("super_admin", "school_admin", "principal")),
):
    """
    Record or update daily staff attendance status (accessible to Admin & Super Admin)
    """
    staff_id = payload.get("staff_id", "")
    status = payload.get("status", "present")
    remarks = payload.get("remarks", "")
    return DashboardService.mark_staff_attendance(staff_id, status, remarks)

