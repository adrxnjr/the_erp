"""
Centralized models module for School ERP.
Exports all models so Alembic's target_metadata can discover them.
"""
from app.db.base import Base
from app.models.user import Role, User, UserRole, RefreshToken
from app.models.academic import (
    AcademicYear,
    ClassRoom,
    Section,
    Subject,
    ClassSubject,
    Holiday,
    Syllabus,
)
from app.models.audit import AuditLog
from app.models.student import (
    Enquiry,
    Student,
    Guardian,
    StudentGuardian,
    StudentDocument,
    StudentStatusHistory,
)
from app.models.staff import Staff, StaffAssignment
from app.models.attendance import (
    StudentAttendance,
    StaffAttendance,
    LeaveRequest,
    AttendanceCorrectionRequest,
    AttendanceChangeHistory,
)
from app.models.timetable import Period, TimetableEntry, Substitution
from app.models.examination import (
    ExamType,
    Exam,
    ExamSubject,
    GradeScale,
    Mark,
    ExamResult,
    MarkCorrectionRequest,
)
from app.models.finance import (
    FeeHead,
    FeeStructure,
    StudentFee,
    FeeConcession,
    Payment,
    Receipt,
    FeeAdjustment,
)

from app.models.transport import (
    Vehicle,
    Driver,
    TransportRoute,
    RouteStop,
    StudentTransport,
    VehicleTrip,
    VehicleLocationPing,
    TransportAlert,
)
from app.models.career import (
    CareerField,
    CareerCourse,
    AssessmentQuestion,
    AssessmentAttempt,
    AssessmentAnswer,
    CareerRecommendation,
    CounsellorReview,
)
from app.models.tuition import (
    TuitionCenter,
    TuitionTeacher,
    TuitionBatch,
    TuitionEnquiry,
)
from app.models.social import (
    Post,
    PostReaction,
    PostComment,
    PostView,
    PostType,
    PostVisibility,
    ReactionType,
)
from app.models.coordinator import CoordinatorProfile
from app.models.rewards import (
    PointTransaction,
    StudentPointSummary,
    Badge,
    StudentBadge,
    RewardItem,
    RewardRedemption,
)

__all__ = [
    "Base",
    "Role",
    "User",
    "UserRole",
    "RefreshToken",
    "AcademicYear",
    "ClassRoom",
    "Section",
    "Subject",
    "ClassSubject",
    "Holiday",
    "AuditLog",
    "Enquiry",
    "Student",
    "Guardian",
    "StudentGuardian",
    "StudentDocument",
    "StudentStatusHistory",
    "Staff",
    "StaffAssignment",
    "StudentAttendance",
    "StaffAttendance",
    "LeaveRequest",
    "AttendanceCorrectionRequest",
    "AttendanceChangeHistory",
    "Period",
    "TimetableEntry",
    "Substitution",
    "ExamType",
    "Exam",
    "ExamSubject",
    "GradeScale",
    "Mark",
    "ExamResult",
    "MarkCorrectionRequest",
    "FeeHead",
    "FeeStructure",
    "StudentFee",
    "FeeConcession",
    "Payment",
    "Receipt",
    "FeeAdjustment",
    "Vehicle",
    "Driver",
    "TransportRoute",
    "RouteStop",
    "StudentTransport",
    "VehicleTrip",
    "VehicleLocationPing",
    "TransportAlert",
    "CareerField",
    "CareerCourse",
    "AssessmentQuestion",
    "AssessmentAttempt",
    "AssessmentAnswer",
    "CareerRecommendation",
    "CounsellorReview",
    "TuitionCenter",
    "TuitionTeacher",
    "TuitionBatch",
    "TuitionEnquiry",
    "Post",
    "PostReaction",
    "PostComment",
    "PostView",
    "PostType",
    "PostVisibility",
    "ReactionType",
    "PointTransaction",
    "StudentPointSummary",
    "Badge",
    "StudentBadge",
    "RewardItem",
    "RewardRedemption",
]
