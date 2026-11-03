import uuid
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


class PointTransactionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    student_id: uuid.UUID
    points: int
    reason: str
    category: str
    reference_id: Optional[str] = None
    awarded_by: Optional[uuid.UUID] = None
    created_at: datetime


class BadgeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    description: str
    icon_emoji: str
    category: str
    criteria_type: str
    criteria_value: int
    points_reward: int
    is_active: bool


class StudentBadgeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    student_id: uuid.UUID
    badge_id: uuid.UUID
    awarded_at: datetime
    awarded_by: Optional[uuid.UUID] = None
    notes: Optional[str] = None
    badge: Optional[BadgeOut] = None


class StudentPointSummaryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    student_id: uuid.UUID
    total_points: int
    current_level: str
    points_this_month: int
    points_this_term: int
    last_updated: datetime
    student_name: Optional[str] = None
    admission_number: Optional[str] = None
    class_name: Optional[str] = None
    section_name: Optional[str] = None
    class_rank: Optional[int] = 1
    school_rank: Optional[int] = 1
    next_level: Optional[str] = None
    next_level_points: Optional[int] = None
    progress_percent: Optional[float] = 0.0
    earned_badges: List[StudentBadgeOut] = []
    all_badges: List[BadgeOut] = []
    recent_transactions: List[PointTransactionOut] = []


class AwardPointsRequest(BaseModel):
    student_id: uuid.UUID
    points: int = Field(..., gt=0, description="Number of points to award")
    reason: str = Field(..., min_length=2, max_length=255)
    category: Optional[str] = "MANUAL_BONUS"


class RewardItemCreate(BaseModel):
    name: str
    description: str
    icon_emoji: str = "🎁"
    points_cost: int = Field(..., gt=0)
    category: str = "PRIVILEGE"
    stock: int = -1
    is_active: bool = True


class RewardItemUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    icon_emoji: Optional[str] = None
    points_cost: Optional[int] = None
    category: Optional[str] = None
    stock: Optional[int] = None
    is_active: Optional[bool] = None


class RewardItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    description: str
    icon_emoji: str
    points_cost: int
    category: str
    stock: int
    is_active: bool
    created_at: datetime


class RedemptionCreate(BaseModel):
    reward_item_id: uuid.UUID


class RedemptionReview(BaseModel):
    status: str = Field(..., pattern="^(APPROVED|REJECTED|FULFILLED)$")
    admin_notes: Optional[str] = None


class RewardRedemptionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    student_id: uuid.UUID
    reward_item_id: uuid.UUID
    points_spent: int
    status: str
    requested_at: datetime
    processed_at: Optional[datetime] = None
    processed_by: Optional[uuid.UUID] = None
    admin_notes: Optional[str] = None
    student_name: Optional[str] = None
    reward_item_name: Optional[str] = None
    reward_item_icon: Optional[str] = None
    reward_item: Optional[RewardItemOut] = None


class BadgeCreate(BaseModel):
    name: str
    description: str
    icon_emoji: str = "🎯"
    category: str = "ACADEMIC"
    criteria_type: str = "POINTS_TOTAL"
    criteria_value: int = 0
    points_reward: int = 50
    is_active: bool = True


class LeaderboardEntry(BaseModel):
    rank: int
    student_id: uuid.UUID
    student_name: str
    admission_number: str
    class_name: Optional[str] = None
    section_name: Optional[str] = None
    total_points: int
    current_level: str
    top_badge_name: Optional[str] = None
    top_badge_icon: Optional[str] = None

