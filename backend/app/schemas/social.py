import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class PostCreate(BaseModel):
    post_type: str = Field(default="ANNOUNCEMENT", description="ANNOUNCEMENT, ACHIEVEMENT, EVENT, PHOTO_GALLERY, NOTICE, AUTO_ACHIEVEMENT")
    title: Optional[str] = Field(None, max_length=255)
    content: str = Field(..., max_length=1000)
    visibility: str = Field(default="SCHOOL_WIDE", description="SCHOOL_WIDE, CLASS_SPECIFIC, STAFF_ONLY")
    target_class_id: Optional[uuid.UUID] = None
    image_url: Optional[str] = None


class PostCommentCreate(BaseModel):
    content: str = Field(..., max_length=300)


class PostCommentResponse(BaseModel):
    id: uuid.UUID
    post_id: uuid.UUID
    author_id: uuid.UUID
    author_name: str
    author_role: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True


class ReactionPayload(BaseModel):
    reaction_type: str = Field(..., description="LIKE, LOVE, CLAP, WOW")


class PostResponse(BaseModel):
    id: uuid.UUID
    author_id: uuid.UUID
    author_name: str
    author_role: str
    author_avatar: Optional[str] = None
    post_type: str
    title: Optional[str] = None
    content: str
    image_url: Optional[str] = None
    visibility: str
    target_class_id: Optional[uuid.UUID] = None
    target_class_name: Optional[str] = None
    is_pinned: bool
    is_approved: bool
    created_at: datetime
    updated_at: datetime
    reactions_count: Dict[str, int] = {"LIKE": 0, "LOVE": 0, "CLAP": 0, "WOW": 0}
    total_reactions: int = 0
    user_reaction: Optional[str] = None
    comments_count: int = 0
    views_count: int = 0
    top_comment: Optional[PostCommentResponse] = None

    class Config:
        from_attributes = True


class PaginatedFeedResponse(BaseModel):
    items: List[PostResponse]
    total: int
    page: int
    page_size: int
    has_more: bool


class SocialStatsResponse(BaseModel):
    total_posts: int
    total_reactions: int
    active_users_month: int
    pending_approval_count: int

