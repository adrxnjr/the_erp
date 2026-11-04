import io
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple
from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from sqlalchemy import desc, func, select
from sqlalchemy.orm import Session

from app.core.exceptions import AppError
from app.models.academic import AcademicYear, ClassRoom, Section
from app.models.attendance import StudentAttendance
from app.models.examination import Mark
from app.models.rewards import (
    Badge,
    PointTransaction,
    RewardItem,
    RewardRedemption,
    StudentBadge,
    StudentPointSummary,
)
from app.models.student import Student
from app.models.user import User
from app.services.social_service import auto_post_achievement

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# POINT AWARD RULES & CONSTANTS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
POINTS_FULL_WEEK_ATTENDANCE = 50
POINTS_EXAM_ABOVE_90 = 100
POINTS_EXAM_ABOVE_75 = 50
POINTS_EXAM_ABOVE_60 = 20
POINTS_MONTHLY_PUNCTUALITY = 75
POINTS_ZERO_DISCIPLINE_TERM = 150

# Level Thresholds
LEVEL_THRESHOLDS = {
    "BRONZE": (0, 499),
    "SILVER": (500, 999),
    "GOLD": (1000, 1999),
    "CHAMPION": (2000, float("inf")),
}


def calculate_level(total_points: int) -> Tuple[str, Optional[str], Optional[int], float]:
    """
    Returns (current_level, next_level, points_needed_for_next, progress_percent).
    """
    pts = max(0, total_points)
    if pts < 500:
        current_level = "BRONZE"
        next_level = "SILVER"
        next_level_points = 500
        progress = (pts / 500.0) * 100.0
    elif pts < 1000:
        current_level = "SILVER"
        next_level = "GOLD"
        next_level_points = 1000
        progress = ((pts - 500) / 500.0) * 100.0
    elif pts < 2000:
        current_level = "GOLD"
        next_level = "CHAMPION"
        next_level_points = 2000
        progress = ((pts - 1000) / 1000.0) * 100.0
    else:
        current_level = "CHAMPION"
        next_level = None
        next_level_points = 2000
        progress = 100.0

    return current_level, next_level, next_level_points, round(min(100.0, max(0.0, progress)), 1)


class RewardsService:
    @staticmethod
    def get_or_create_summary(student_id: uuid.UUID, db: Session) -> StudentPointSummary:
        if isinstance(student_id, str):
            student_id = uuid.UUID(student_id)

        summary = db.execute(
            select(StudentPointSummary).where(StudentPointSummary.student_id == student_id)
        ).scalar_one_or_none()

        if not summary:
            # Check student exists
            student = db.execute(select(Student).where(Student.id == student_id)).scalar_one_or_none()
            if not student:
                raise AppError(message="Student not found.", status_code=404, error_code="NOT_FOUND")

            summary = StudentPointSummary(
                id=uuid.uuid4(),
                student_id=student_id,
                total_points=0,
                current_level="BRONZE",
                points_this_month=0,
                points_this_term=0,
            )
            db.add(summary)
            db.flush()
        return summary

    @staticmethod
    def award_badge(student_id: uuid.UUID, badge_name: str, reason: str, db: Session):
        """
        Awards a badge to student and triggers an automatic gold achievement post on the school wall.
        """
        achievement_text = f"earning the {badge_name} badge ({reason})"
        try:
            return auto_post_achievement(student_id=student_id, achievement_text=achievement_text, db=db)
        except Exception:
            return None

    @staticmethod
    def upgrade_level(student_id: uuid.UUID, new_level: str, db: Session):
        """
        Triggers social wall announcement when student reaches GOLD or CHAMPION status.
        """
        if new_level.upper() in ("GOLD", "CHAMPION"):
            achievement_text = f"ascending to {new_level.upper()} Scholar Status in Campus Rewards!"
            try:
                return auto_post_achievement(student_id=student_id, achievement_text=achievement_text, db=db)
            except Exception:
                return None
        return None

    @staticmethod
    def award_points(
        student_id: uuid.UUID,
        points: int,
        reason: str,
        category: str = "MANUAL_BONUS",
        reference_id: Optional[str] = None,
        awarded_by: Optional[uuid.UUID] = None,
        db: Session = None,
    ) -> StudentPointSummary:
        if isinstance(student_id, str):
            student_id = uuid.UUID(student_id)
        if isinstance(awarded_by, str):
            awarded_by = uuid.UUID(awarded_by)

        summary = RewardsService.get_or_create_summary(student_id, db)
        old_level = summary.current_level

        # 1. Create PointTransaction
        tx = PointTransaction(
            id=uuid.uuid4(),
            student_id=student_id,
            points=points,
            reason=reason,
            category=category,
            reference_id=reference_id,
            awarded_by=awarded_by,
        )
        db.add(tx)

        # 2. Update StudentPointSummary
        new_total = max(0, summary.total_points + points)
        summary.total_points = new_total
        if points > 0:
            summary.points_this_month = summary.points_this_month + points
            summary.points_this_term = summary.points_this_term + points

        new_level, _, _, _ = calculate_level(new_total)
        summary.current_level = new_level
        summary.last_updated = datetime.now(timezone.utc)
        db.flush()

        # Check level up announcement
        if new_level != old_level and new_total > summary.total_points - points:
            RewardsService.upgrade_level(student_id, new_level, db)

        # 3. Check for automatic badge unlocks
        RewardsService.check_and_award_badges(student_id, db)

        db.commit()
        db.refresh(summary)
        return summary

    @staticmethod
    def check_and_award_badges(student_id: uuid.UUID, db: Session) -> List[StudentBadge]:
        if isinstance(student_id, str):
            student_id = uuid.UUID(student_id)

        summary = RewardsService.get_or_create_summary(student_id, db)

        # Get existing badge IDs for this student
        existing_badge_ids = set(
            db.execute(
                select(StudentBadge.badge_id).where(StudentBadge.student_id == student_id)
            ).scalars().all()
        )

        active_badges = list(
            db.execute(select(Badge).where(Badge.is_active == True)).scalars().all()
        )

        newly_awarded = []
        for badge in active_badges:
            if badge.id in existing_badge_ids:
                continue

            qualifies = False
            notes = None

            # Check criteria
            if badge.criteria_type == "POINTS_TOTAL":
                if summary.total_points >= badge.criteria_value:
                    qualifies = True
                    notes = f"Reached {badge.criteria_value}+ scholarship points"

            elif badge.criteria_type == "EXAM_SCORE":
                # Check student's highest exam mark
                highest_mark = db.execute(
                    select(func.max(Mark.marks_obtained)).where(Mark.student_id == student_id)
                ).scalar() or 0
                if highest_mark >= badge.criteria_value:
                    qualifies = True
                    notes = f"Achieved score of {highest_mark}% in examination"

            elif badge.criteria_type == "ATTENDANCE_STREAK":
                # Count present days
                present_count = db.execute(
                    select(func.count(StudentAttendance.id)).where(
                        StudentAttendance.student_id == student_id,
                        StudentAttendance.status == "PRESENT",
                    )
                ).scalar() or 0
                if present_count >= badge.criteria_value:
                    qualifies = True
                    notes = f"Maintained perfect attendance streak of {present_count} days"

            if qualifies:
                sb = StudentBadge(
                    id=uuid.uuid4(),
                    student_id=student_id,
                    badge_id=badge.id,
                    notes=notes or badge.description,
                )
                db.add(sb)
                newly_awarded.append(sb)

                # Award badge points reward if configured
                if badge.points_reward > 0:
                    badge_tx = PointTransaction(
                        id=uuid.uuid4(),
                        student_id=student_id,
                        points=badge.points_reward,
                        reason=f"Unlocked Badge: {badge.name}",
                        category="ACADEMIC",
                        reference_id=str(badge.id),
                    )
                    db.add(badge_tx)
                    summary.total_points += badge.points_reward
                    summary.points_this_month += badge.points_reward
                    summary.points_this_term += badge.points_reward
                    summary.current_level, _, _, _ = calculate_level(summary.total_points)

                # Announce to School Social Wall
                RewardsService.award_badge(
                    student_id=student_id,
                    badge_name=f"{badge.icon_emoji} {badge.name}",
                    reason=badge.description,
                    db=db,
                )

        if newly_awarded:
            db.flush()
        return newly_awarded

    @staticmethod
    def get_points_summary(student_id: uuid.UUID, db: Session) -> Dict[str, Any]:
        if isinstance(student_id, str):
            student_id = uuid.UUID(student_id)

        student = db.execute(select(Student).where(Student.id == student_id)).scalar_one_or_none()
        if not student:
            raise AppError(message="Student not found.", status_code=404, error_code="NOT_FOUND")

        summary = RewardsService.get_or_create_summary(student_id, db)
        current_level, next_level, next_level_pts, progress = calculate_level(summary.total_points)

        # Get student's class and section
        classroom = db.execute(
            select(ClassRoom).where(ClassRoom.id == student.class_id)
        ).scalar_one_or_none()
        section = db.execute(
            select(Section).where(Section.id == student.section_id)
        ).scalar_one_or_none()

        # Calculate ranks
        school_rank = db.execute(
            select(func.count(StudentPointSummary.id)).where(
                StudentPointSummary.total_points > summary.total_points
            )
        ).scalar() or 0
        school_rank += 1

        class_rank = 1
        if student.class_id:
            class_rank_val = db.execute(
                select(func.count(StudentPointSummary.id))
                .join(Student, Student.id == StudentPointSummary.student_id)
                .where(
                    Student.class_id == student.class_id,
                    StudentPointSummary.total_points > summary.total_points,
                )
            ).scalar() or 0
            class_rank = class_rank_val + 1

        # Earned badges
        earned_badges = list(
            db.execute(
                select(StudentBadge)
                .where(StudentBadge.student_id == student_id)
                .order_by(desc(StudentBadge.awarded_at))
            ).scalars().all()
        )

        all_badges = list(
            db.execute(select(Badge).order_by(Badge.criteria_value)).scalars().all()
        )

        # Recent transactions
        recent_txs = list(
            db.execute(
                select(PointTransaction)
                .where(PointTransaction.student_id == student_id)
                .order_by(desc(PointTransaction.created_at))
                .limit(10)
            ).scalars().all()
        )

        return {
            "student_id": student.id,
            "student_name": student.full_name,
            "admission_number": student.admission_number,
            "class_name": classroom.name if classroom else "Grade 1",
            "section_name": section.name if section else "A",
            "total_points": summary.total_points,
            "current_level": current_level,
            "next_level": next_level,
            "next_level_points": next_level_pts,
            "progress_percent": progress,
            "points_this_month": summary.points_this_month,
            "points_this_term": summary.points_this_term,
            "last_updated": summary.last_updated,
            "class_rank": class_rank,
            "school_rank": school_rank,
            "earned_badges": earned_badges,
            "all_badges": all_badges,
            "recent_transactions": recent_txs,
        }

    @staticmethod
    def get_student_leaderboard(
        class_id: Optional[uuid.UUID], db: Session, limit: int = 20
    ) -> List[Dict[str, Any]]:
        query = (
            select(StudentPointSummary, Student, ClassRoom, Section)
            .join(Student, Student.id == StudentPointSummary.student_id)
            .outerjoin(ClassRoom, ClassRoom.id == Student.class_id)
            .outerjoin(Section, Section.id == Student.section_id)
        )

        if class_id:
            if isinstance(class_id, str):
                class_id = uuid.UUID(class_id)
            query = query.where(Student.class_id == class_id)

        query = query.order_by(desc(StudentPointSummary.total_points)).limit(limit)
        results = db.execute(query).all()

        leaderboard = []
        for rank, (summary, student, classroom, section) in enumerate(results, start=1):
            # Find top badge
            top_student_badge = db.execute(
                select(StudentBadge)
                .join(Badge, Badge.id == StudentBadge.badge_id)
                .where(StudentBadge.student_id == student.id)
                .order_by(desc(Badge.points_reward))
                .limit(1)
            ).scalar_one_or_none()

            top_badge_name = top_student_badge.badge.name if top_student_badge and top_student_badge.badge else "Star Pupil"
            top_badge_icon = top_student_badge.badge.icon_emoji if top_student_badge and top_student_badge.badge else ""

            leaderboard.append({
                "rank": rank,
                "student_id": student.id,
                "student_name": student.full_name,
                "admission_number": student.admission_number,
                "class_name": classroom.name if classroom else "Grade 1",
                "section_name": section.name if section else "A",
                "total_points": summary.total_points,
                "current_level": summary.current_level,
                "top_badge_name": top_badge_name,
                "top_badge_icon": top_badge_icon,
            })
        return leaderboard

    @staticmethod
    def get_school_leaderboard(db: Session, limit: int = 10) -> List[Dict[str, Any]]:
        return RewardsService.get_student_leaderboard(class_id=None, db=db, limit=limit)

    @staticmethod
    def redeem_reward(student_id: uuid.UUID, reward_item_id: uuid.UUID, db: Session) -> RewardRedemption:
        if isinstance(student_id, str):
            student_id = uuid.UUID(student_id)
        if isinstance(reward_item_id, str):
            reward_item_id = uuid.UUID(reward_item_id)

        item = db.execute(select(RewardItem).where(RewardItem.id == reward_item_id)).scalar_one_or_none()
        if not item or not item.is_active:
            raise AppError(message="Reward item is unavailable.", status_code=400, error_code="ITEM_UNAVAILABLE")

        if item.stock == 0:
            raise AppError(message="This item is out of stock.", status_code=400, error_code="OUT_OF_STOCK")

        summary = RewardsService.get_or_create_summary(student_id, db)
        if summary.total_points < item.points_cost:
            raise AppError(
                message=f"Insufficient points. You have {summary.total_points} pts but this item costs {item.points_cost} pts.",
                status_code=400,
                error_code="INSUFFICIENT_POINTS",
            )

        # Deduct points immediately
        summary.total_points -= item.points_cost
        summary.current_level, _, _, _ = calculate_level(summary.total_points)

        # Create redemption debit transaction
        tx = PointTransaction(
            id=uuid.uuid4(),
            student_id=student_id,
            points=-item.points_cost,
            reason=f"Redeemed: {item.name}",
            category="REDEMPTION",
            reference_id=str(item.id),
        )
        db.add(tx)

        if item.stock > 0:
            item.stock -= 1

        redemption = RewardRedemption(
            id=uuid.uuid4(),
            student_id=student_id,
            reward_item_id=item.id,
            points_spent=item.points_cost,
            status="PENDING",
            requested_at=datetime.now(timezone.utc),
        )
        db.add(redemption)
        db.commit()
        db.refresh(redemption)
        return redemption

    @staticmethod
    def review_redemption(
        redemption_id: uuid.UUID,
        status: str,
        admin_notes: Optional[str],
        admin_user: User,
        db: Session,
    ) -> RewardRedemption:
        if isinstance(redemption_id, str):
            redemption_id = uuid.UUID(redemption_id)

        redemption = db.execute(
            select(RewardRedemption).where(RewardRedemption.id == redemption_id)
        ).scalar_one_or_none()
        if not redemption:
            raise AppError(message="Redemption request not found.", status_code=404, error_code="NOT_FOUND")

        # If rejected, refund points to student
        if status.upper() == "REJECTED" and redemption.status != "REJECTED":
            summary = RewardsService.get_or_create_summary(redemption.student_id, db)
            summary.total_points += redemption.points_spent
            summary.current_level, _, _, _ = calculate_level(summary.total_points)

            refund_tx = PointTransaction(
                id=uuid.uuid4(),
                student_id=redemption.student_id,
                points=redemption.points_spent,
                reason=f"Refund: Redemption request rejected ({admin_notes or 'by administrator'})",
                category="REDEMPTION",
                reference_id=str(redemption.id),
                awarded_by=admin_user.id,
            )
            db.add(refund_tx)

            # Restock item if stock was tracked
            item = db.execute(select(RewardItem).where(RewardItem.id == redemption.reward_item_id)).scalar_one_or_none()
            if item and item.stock >= 0:
                item.stock += 1

        redemption.status = status.upper()
        redemption.admin_notes = admin_notes
        redemption.processed_at = datetime.now(timezone.utc)
        redemption.processed_by = admin_user.id
        db.commit()
        db.refresh(redemption)
        return redemption

    @staticmethod
    def generate_certificate_pdf(student_id: uuid.UUID, db: Session) -> bytes:
        """
        Generates a premium ReportLab PDF achievement certificate for the student.
        Shows: Student name, current level, total points, badges earned, academic year, school name,
        and 'Issued by Principal' with date.
        """
        if isinstance(student_id, str):
            student_id = uuid.UUID(student_id)

        student = db.execute(select(Student).where(Student.id == student_id)).scalar_one_or_none()
        if not student:
            raise AppError(message="Student not found.", status_code=404, error_code="NOT_FOUND")

        summary = RewardsService.get_or_create_summary(student_id, db)
        classroom = db.execute(select(ClassRoom).where(ClassRoom.id == student.class_id)).scalar_one_or_none()
        ay = db.execute(select(AcademicYear).where(AcademicYear.is_active == True)).scalar_one_or_none()
        academic_year_name = ay.name if ay else "2026-2027 Academic Session"

        earned_badges = list(
            db.execute(
                select(Badge)
                .join(StudentBadge, StudentBadge.badge_id == Badge.id)
                .where(StudentBadge.student_id == student_id)
            ).scalars().all()
        )

        buffer = io.BytesIO()
        # Landscape orientation for certificate
        width, height = 792, 612  # Landscape letter
        p = canvas.Canvas(buffer, pagesize=(width, height))

        # Background tint
        p.setFillColor(HexColor("#F8FAFC"))
        p.rect(0, 0, width, height, fill=1, stroke=0)

        # Outer double ornamental border
        p.setStrokeColor(HexColor("#4F46E5"))  # Indigo
        p.setLineWidth(5)
        p.rect(25, 25, width - 50, height - 50, fill=0, stroke=1)

        p.setStrokeColor(HexColor("#F59E0B"))  # Gold
        p.setLineWidth(2)
        p.rect(32, 32, width - 64, height - 64, fill=0, stroke=1)

        # School Name Banner
        p.setFillColor(HexColor("#1E1B4B"))
        p.setFont("Helvetica-Bold", 26)
        p.drawCentredString(width / 2.0, height - 85, "EVER GROW INTERNATIONAL SCHOOL")

        p.setFont("Helvetica-Bold", 12)
        p.setFillColor(HexColor("#6366F1"))
        p.drawCentredString(width / 2.0, height - 108, "CAMPUS MERIT & SCHOLASTIC EXCELLENCE COUNCIL")

        # Certificate Title
        p.setFont("Helvetica-Bold", 22)
        p.setFillColor(HexColor("#D97706"))  # Warm Gold
        p.drawCentredString(width / 2.0, height - 150, "★ CERTIFICATE OF ACHIEVEMENT ★")

        p.setFont("Helvetica-Oblique", 13)
        p.setFillColor(HexColor("#475569"))
        p.drawCentredString(width / 2.0, height - 180, "This prestigious certificate is proudly presented in recognition of outstanding scholarship to:")

        # Student Name Highlight
        p.setFont("Helvetica-Bold", 30)
        p.setFillColor(HexColor("#0F172A"))
        p.drawCentredString(width / 2.0, height - 225, student.full_name.upper())

        # Enrollment Details
        class_desc = f"{classroom.name if classroom else 'Grade 1'} • Admission No: {student.admission_number} • Academic Year: {academic_year_name}"
        p.setFont("Helvetica", 12)
        p.setFillColor(HexColor("#64748B"))
        p.drawCentredString(width / 2.0, height - 250, class_desc)

        # Level Tier & Points Award Box
        level_colors = {
            "BRONZE": HexColor("#B45309"),
            "SILVER": HexColor("#64748B"),
            "GOLD": HexColor("#D97706"),
            "CHAMPION": HexColor("#7C3AED"),
        }
        accent = level_colors.get(summary.current_level, HexColor("#D97706"))

        # Achievement Stats Badge
        p.setStrokeColor(accent)
        p.setLineWidth(1.5)
        p.setFillColor(HexColor("#FFFFFF"))
        box_w, box_h = 420, 60
        box_x = (width - box_w) / 2.0
        box_y = height - 330
        p.roundRect(box_x, box_y, box_w, box_h, 8, fill=1, stroke=1)

        p.setFont("Helvetica-Bold", 14)
        p.setFillColor(accent)
        p.drawCentredString(width / 2.0, box_y + 36, f"HONOR LEVEL: {summary.current_level} SCHOLAR")

        p.setFont("Helvetica", 11)
        p.setFillColor(HexColor("#334155"))
        p.drawCentredString(width / 2.0, box_y + 16, f"Accumulated Scholarship Points: {summary.total_points:,} pts")

        # Badges Earned Section
        badge_names = [b.name for b in earned_badges[:5]]
        if not badge_names:
            badge_names = ["Campus Star Participant", "Academic Dedication"]
        badges_str = "  •  ".join(badge_names)

        p.setFont("Helvetica-Bold", 11)
        p.setFillColor(HexColor("#1E293B"))
        p.drawCentredString(width / 2.0, height - 365, "Earned Honors & Distinctions:")
        p.setFont("Helvetica", 11)
        p.setFillColor(HexColor("#4338CA"))
        p.drawCentredString(width / 2.0, height - 385, badges_str)

        # Signatures & Verification Seal
        # Left signature: House Master / Coordinator
        p.setStrokeColor(HexColor("#94A3B8"))
        p.line(90, 115, 270, 115)
        p.setFont("Helvetica-Bold", 11)
        p.setFillColor(HexColor("#0F172A"))
        p.drawString(110, 98, "Academic Coordinator")
        p.setFont("Helvetica", 9)
        p.setFillColor(HexColor("#64748B"))
        p.drawString(100, 84, "Campus Evaluation Board")

        # Center Gold Medal Seal
        p.setFillColor(HexColor("#FEF3C7"))
        p.setStrokeColor(HexColor("#F59E0B"))
        p.circle(width / 2.0, 115, 34, fill=1, stroke=1)
        p.setFont("Helvetica-Bold", 10)
        p.setFillColor(HexColor("#B45309"))
        p.drawCentredString(width / 2.0, 118, "SEAL OF")
        p.drawCentredString(width / 2.0, 106, "MERIT")

        # Right signature: Issued by Principal
        p.setStrokeColor(HexColor("#94A3B8"))
        p.line(width - 270, 115, width - 90, 115)
        p.setFont("Helvetica-Bold", 11)
        p.setFillColor(HexColor("#0F172A"))
        p.drawString(width - 250, 98, "Issued by Principal")
        p.setFont("Helvetica", 9)
        p.setFillColor(HexColor("#64748B"))
        p.drawString(width - 245, 84, f"Date: {datetime.now().strftime('%B %d, %Y')}")

        p.showPage()
        p.save()
        buffer.seek(0)
        return buffer.getvalue()
