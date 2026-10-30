from app.routers.health import router as health_router
from app.routers.auth import router as auth_router
from app.routers.users import router as users_router
from app.routers.academic import router as academic_router
from app.routers.students import router as students_router
from app.routers.staff import router as staff_router
from app.routers.attendance import router as attendance_router
from app.routers.timetable import router as timetable_router
from app.routers.examination import router as examination_router
from app.routers.finance import router as finance_router
from app.routers.portal import router as portal_router
from app.routers.dashboards import router as dashboards_router
from app.routers.reports import router as reports_router
from app.routers.transport import router as transport_router
from app.routers.career import router as career_router

__all__ = [
    "health_router",
    "auth_router",
    "users_router",
    "academic_router",
    "students_router",
    "staff_router",
    "attendance_router",
    "timetable_router",
    "examination_router",
    "finance_router",
    "portal_router",
    "dashboards_router",
    "reports_router",
    "transport_router",
    "career_router",
]
