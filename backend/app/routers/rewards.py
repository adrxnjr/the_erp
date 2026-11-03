import io
import uuid
from typing import Any, List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import desc, select
from sqlalchemy.orm import Session

from app.core.exceptions import AppError
from app.core.permissions import get_current_user
from app.db.dependencies import get_db
from app.models.academic import ClassRoom
from app.models.rewards import (
    Badge,
    PointTransaction,
    RewardItem,
    RewardRedemption,
    StudentBadge,
    StudentPointSummary,
)
from app.models.student import Guardian, Student, StudentGuardian
from app.models.user import User
from app.schemas.rewards import (
    AwardPointsRequest,
    BadgeCreate,
    BadgeOut,
    LeaderboardEntry,
    PointTransactionOut,
    RedemptionCreate,
    RedemptionReview,
    RewardItemCreate,
    RewardItemOut,
    RewardItemUpdate,
    RewardRedemptionOut,
    StudentBadgeOut,
    StudentPointSummaryOut,
)
from app.services.rewards_service import RewardsService

router = APIRouter(prefix="/rewards", tags=["Gamified Rewards System"])


def get_target_student(
    current_user: User,
    db: Session,
    student_id_override: Optional[uuid.UUID] = None,
) -> Student:
    """
    Resolves the targeted student depending on whether current user is a Student, Parent, or Staff.
    """
    if student_id_override:
        if isinstance(student_id_override, str):
            student_id_override = uuid.UUID(student_id_override)
        student = db.execute(select(Student).where(Student.id == student_id_override)).scalar_one_or_none()
        if not student:
            raise AppError(message="Student not found.", status_code=404, error_code="NOT_FOUND")

        # If parent, verify ownership
        if current_user.portal_type == "parent":
            guardian = db.execute(select(Guardian).where(Guardian.user_id == current_user.id)).scalar_one_or_none()
            if guardian:
                linked = db.execute(
                    select(StudentGuardian).where(
                        StudentGuardian.guardian_id == guardian.id,
                        StudentGuardian.student_id == student.id,
                    )
                ).scalar_one_or_none()
                if not linked:
                    raise AppError(
                        message="Access denied: Student is not registered under your parent account.",
                        status_code=403,
                        error_code="FORBIDDEN",
                    )
        return student

    # If student portal
    if current_user.portal_type == "student":
        student = db.execute(select(Student).where(Student.user_id == current_user.id)).scalar_one_or_none()
        if not student:
            raise AppError(message="Student profile not found for account.", status_code=404, error_code="NOT_FOUND")
        return student

    # If parent portal without override, pick first child
    if current_user.portal_type == "parent":
        guardian = db.execute(select(Guardian).where(Guardian.user_id == current_user.id)).scalar_one_or_none()
        if guardian:
            linked = db.execute(
                select(StudentGuardian).where(StudentGuardian.guardian_id == guardian.id)
            ).scalars().first()
            if linked:
                student = db.execute(select(Student).where(Student.id == linked.student_id)).scalar_one_or_none()
                if student:
                    return student
        raise AppError(message="No children registered under this parent profile.", status_code=404, error_code="NOT_FOUND")

    # If staff/admin without override, return first demo student
    first_student = db.execute(select(Student)).scalars().first()
    if first_student:
        return first_student
    raise AppError(message="No student specified.", status_code=400, error_code="BAD_REQUEST")


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# STUDENT / PARENT ENDPOINTS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@router.get("/my-points", response_model=StudentPointSummaryOut)
def get_my_points(
    student_id: Optional[uuid.UUID] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Returns full student points summary, level progress, badges, and recent activity.
    """
    target_student = get_target_student(current_user, db, student_id)
    summary_data = RewardsService.get_points_summary(target_student.id, db)
    return summary_data


@router.get("/my-transactions", response_model=List[PointTransactionOut])
def get_my_transactions(
    student_id: Optional[uuid.UUID] = None,
    limit: int = 50,
    offset: int = 0,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Returns paginated points transaction history for the student.
    """
    target_student = get_target_student(current_user, db, student_id)
    txs = list(
        db.execute(
            select(PointTransaction)
            .where(PointTransaction.student_id == target_student.id)
            .order_by(desc(PointTransaction.created_at))
            .offset(offset)
            .limit(limit)
        ).scalars().all()
    )
    return txs


@router.get("/my-badges", response_model=List[StudentBadgeOut])
def get_my_badges(
    student_id: Optional[uuid.UUID] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Returns all badges earned by the student.
    """
    target_student = get_target_student(current_user, db, student_id)
    badges = list(
        db.execute(
            select(StudentBadge)
            .where(StudentBadge.student_id == target_student.id)
            .order_by(desc(StudentBadge.awarded_at))
        ).scalars().all()
    )
    return badges


@router.get("/leaderboard", response_model=List[LeaderboardEntry])
def get_leaderboard(
    class_id: Optional[uuid.UUID] = None,
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Returns leaderboard for a specific class or students in current user's grade.
    """
    if not class_id and current_user.portal_type == "student":
        student = db.execute(select(Student).where(Student.user_id == current_user.id)).scalar_one_or_none()
        if student:
            class_id = student.class_id

    return RewardsService.get_student_leaderboard(class_id=class_id, db=db, limit=limit)


@router.get("/store", response_model=List[RewardItemOut])
def get_reward_store(
    db: Session = Depends(get_db),
):
    """
    Lists all active reward items in the rewards store.
    """
    items = list(
        db.execute(
            select(RewardItem).where(RewardItem.is_active == True).order_by(RewardItem.points_cost)
        ).scalars().all()
    )
    return items


@router.post("/redeem", response_model=RewardRedemptionOut)
def redeem_reward_item(
    payload: RedemptionCreate,
    student_id: Optional[uuid.UUID] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Submits a redemption request to purchase an item with scholarship points.
    """
    target_student = get_target_student(current_user, db, student_id)
    redemption = RewardsService.redeem_reward(target_student.id, payload.reward_item_id, db)

    item = db.execute(select(RewardItem).where(RewardItem.id == redemption.reward_item_id)).scalar_one_or_none()
    return {
        "id": redemption.id,
        "student_id": redemption.student_id,
        "reward_item_id": redemption.reward_item_id,
        "points_spent": redemption.points_spent,
        "status": redemption.status,
        "requested_at": redemption.requested_at,
        "processed_at": redemption.processed_at,
        "processed_by": redemption.processed_by,
        "admin_notes": redemption.admin_notes,
        "student_name": target_student.full_name,
        "reward_item_name": item.name if item else "Reward Item",
        "reward_item_icon": item.icon_emoji if item else "🎁",
        "reward_item": item,
    }


@router.get("/my-redemptions", response_model=List[RewardRedemptionOut])
def get_my_redemptions(
    student_id: Optional[uuid.UUID] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Returns student's redemption requests and statuses.
    """
    target_student = get_target_student(current_user, db, student_id)
    redemptions = list(
        db.execute(
            select(RewardRedemption)
            .where(RewardRedemption.student_id == target_student.id)
            .order_by(desc(RewardRedemption.requested_at))
        ).scalars().all()
    )

    out = []
    for r in redemptions:
        item = db.execute(select(RewardItem).where(RewardItem.id == r.reward_item_id)).scalar_one_or_none()
        out.append({
            "id": r.id,
            "student_id": r.student_id,
            "reward_item_id": r.reward_item_id,
            "points_spent": r.points_spent,
            "status": r.status,
            "requested_at": r.requested_at,
            "processed_at": r.processed_at,
            "processed_by": r.processed_by,
            "admin_notes": r.admin_notes,
            "student_name": target_student.full_name,
            "reward_item_name": item.name if item else "Reward Item",
            "reward_item_icon": item.icon_emoji if item else "🎁",
            "reward_item": item,
        })
    return out


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# ADMIN / TEACHER ENDPOINTS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@router.post("/award", response_model=StudentPointSummaryOut)
def award_points_manual(
    payload: AwardPointsRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Manually awards points to a student with an official commendation reason.
    """
    summary = RewardsService.award_points(
        student_id=payload.student_id,
        points=payload.points,
        reason=payload.reason,
        category=payload.category or "MANUAL_BONUS",
        awarded_by=current_user.id,
        db=db,
    )
    return RewardsService.get_points_summary(payload.student_id, db)


@router.get("/redemptions", response_model=List[RewardRedemptionOut])
def get_all_redemptions(
    status_filter: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Lists all student redemption requests across the campus with optional status filtering.
    """
    query = select(RewardRedemption).order_by(desc(RewardRedemption.requested_at))
    if status_filter and status_filter.upper() != "ALL":
        query = query.where(RewardRedemption.status == status_filter.upper())

    redemptions = list(db.execute(query).scalars().all())
    out = []
    for r in redemptions:
        student = db.execute(select(Student).where(Student.id == r.student_id)).scalar_one_or_none()
        item = db.execute(select(RewardItem).where(RewardItem.id == r.reward_item_id)).scalar_one_or_none()
        out.append({
            "id": r.id,
            "student_id": r.student_id,
            "reward_item_id": r.reward_item_id,
            "points_spent": r.points_spent,
            "status": r.status,
            "requested_at": r.requested_at,
            "processed_at": r.processed_at,
            "processed_by": r.processed_by,
            "admin_notes": r.admin_notes,
            "student_name": student.full_name if student else "Student",
            "reward_item_name": item.name if item else "Reward Item",
            "reward_item_icon": item.icon_emoji if item else "🎁",
            "reward_item": item,
        })
    return out


@router.put("/redemptions/{redemption_id}", response_model=RewardRedemptionOut)
def review_redemption_request(
    redemption_id: uuid.UUID,
    payload: RedemptionReview,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Approves, rejects, or fulfills a student redemption request.
    """
    redemption = RewardsService.review_redemption(
        redemption_id=redemption_id,
        status=payload.status,
        admin_notes=payload.admin_notes,
        admin_user=current_user,
        db=db,
    )
    student = db.execute(select(Student).where(Student.id == redemption.student_id)).scalar_one_or_none()
    item = db.execute(select(RewardItem).where(RewardItem.id == redemption.reward_item_id)).scalar_one_or_none()
    return {
        "id": redemption.id,
        "student_id": redemption.student_id,
        "reward_item_id": redemption.reward_item_id,
        "points_spent": redemption.points_spent,
        "status": redemption.status,
        "requested_at": redemption.requested_at,
        "processed_at": redemption.processed_at,
        "processed_by": redemption.processed_by,
        "admin_notes": redemption.admin_notes,
        "student_name": student.full_name if student else "Student",
        "reward_item_name": item.name if item else "Reward Item",
        "reward_item_icon": item.icon_emoji if item else "🎁",
        "reward_item": item,
    }


@router.post("/store", response_model=RewardItemOut)
def create_reward_store_item(
    payload: RewardItemCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Creates a new reward catalog item in the campus rewards store.
    """
    item = RewardItem(
        id=uuid.uuid4(),
        name=payload.name,
        description=payload.description,
        icon_emoji=payload.icon_emoji,
        points_cost=payload.points_cost,
        category=payload.category,
        stock=payload.stock,
        is_active=payload.is_active,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.put("/store/{item_id}", response_model=RewardItemOut)
def update_reward_store_item(
    item_id: uuid.UUID,
    payload: RewardItemUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Updates or toggles an existing reward store item.
    """
    item = db.execute(select(RewardItem).where(RewardItem.id == item_id)).scalar_one_or_none()
    if not item:
        raise AppError(message="Reward item not found.", status_code=404, error_code="NOT_FOUND")

    if payload.name is not None:
        item.name = payload.name
    if payload.description is not None:
        item.description = payload.description
    if payload.icon_emoji is not None:
        item.icon_emoji = payload.icon_emoji
    if payload.points_cost is not None:
        item.points_cost = payload.points_cost
    if payload.category is not None:
        item.category = payload.category
    if payload.stock is not None:
        item.stock = payload.stock
    if payload.is_active is not None:
        item.is_active = payload.is_active

    db.commit()
    db.refresh(item)
    return item


@router.get("/school-leaderboard", response_model=List[LeaderboardEntry])
def get_school_leaderboard(
    limit: int = 10,
    db: Session = Depends(get_db),
):
    """
    Returns school-wide top 10 scholarship students.
    """
    return RewardsService.get_school_leaderboard(db=db, limit=limit)


@router.get("/badges", response_model=List[BadgeOut])
def list_badges(
    db: Session = Depends(get_db),
):
    """
    Lists all configured achievement badges.
    """
    return list(db.execute(select(Badge).order_by(Badge.criteria_value)).scalars().all())


@router.post("/badges", response_model=BadgeOut)
def create_badge(
    payload: BadgeCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Creates a new custom achievement badge.
    """
    existing = db.execute(select(Badge).where(Badge.name == payload.name)).scalar_one_or_none()
    if existing:
        raise AppError(message="A badge with this name already exists.", status_code=409, error_code="DUPLICATE_BADGE")

    badge = Badge(
        id=uuid.uuid4(),
        name=payload.name,
        description=payload.description,
        icon_emoji=payload.icon_emoji,
        category=payload.category,
        criteria_type=payload.criteria_type,
        criteria_value=payload.criteria_value,
        points_reward=payload.points_reward,
        is_active=payload.is_active,
    )
    db.add(badge)
    db.commit()
    db.refresh(badge)
    return badge


@router.put("/badges/{badge_id}", response_model=BadgeOut)
def update_badge(
    badge_id: uuid.UUID,
    payload: BadgeCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    badge = db.execute(select(Badge).where(Badge.id == badge_id)).scalar_one_or_none()
    if not badge:
        raise AppError(message="Badge not found.", status_code=404, error_code="NOT_FOUND")

    badge.name = payload.name
    badge.description = payload.description
    badge.icon_emoji = payload.icon_emoji
    badge.category = payload.category
    badge.criteria_type = payload.criteria_type
    badge.criteria_value = payload.criteria_value
    badge.points_reward = payload.points_reward
    badge.is_active = payload.is_active

    db.commit()
    db.refresh(badge)
    return badge


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# CERTIFICATE ENDPOINT
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@router.get("/certificate/{student_id}")
def download_achievement_certificate(
    student_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    """
    Generates and downloads a prestigious ReportLab PDF achievement certificate for the student.
    """
    if isinstance(student_id, str):
        student_id = uuid.UUID(student_id)

    student = db.execute(select(Student).where(Student.id == student_id)).scalar_one_or_none()
    if not student:
        raise AppError(message="Student not found.", status_code=404, error_code="NOT_FOUND")

    pdf_bytes = RewardsService.generate_certificate_pdf(student_id=student.id, db=db)
    filename = f"achievement_certificate_{student.admission_number}.pdf"

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename={filename}",
            "Access-Control-Expose-Headers": "Content-Disposition",
        },
    )
