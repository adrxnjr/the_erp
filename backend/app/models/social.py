import enum
import uuid
from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Index,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class PostType(str, enum.Enum):
    ANNOUNCEMENT = "ANNOUNCEMENT"
    ACHIEVEMENT = "ACHIEVEMENT"
    EVENT = "EVENT"
    PHOTO_GALLERY = "PHOTO_GALLERY"
    NOTICE = "NOTICE"
    AUTO_ACHIEVEMENT = "AUTO_ACHIEVEMENT"


class PostVisibility(str, enum.Enum):
    SCHOOL_WIDE = "SCHOOL_WIDE"
    CLASS_SPECIFIC = "CLASS_SPECIFIC"
    STAFF_ONLY = "STAFF_ONLY"


class ReactionType(str, enum.Enum):
    LIKE = "LIKE"
    LOVE = "LOVE"
    CLAP = "CLAP"
    WOW = "WOW"


class Post(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Social Wall Post created by staff, teachers, administrators or automated system triggers.
    """
    __tablename__ = "social_posts"

    author_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    post_type: Mapped[str] = mapped_column(
        String(50),
        default=PostType.ANNOUNCEMENT.value,
        nullable=False,
        index=True,
    )
    title: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    content: Mapped[str] = mapped_column(String(1000), nullable=False)
    image_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    visibility: Mapped[str] = mapped_column(
        String(50),
        default=PostVisibility.SCHOOL_WIDE.value,
        nullable=False,
        index=True,
    )
    target_class_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("classes.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    is_pinned: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)
    is_approved: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Relationships
    author = relationship("User", foreign_keys=[author_id], lazy="joined")
    target_class = relationship("ClassRoom", foreign_keys=[target_class_id], lazy="joined")
    reactions = relationship("PostReaction", back_populates="post", cascade="all, delete-orphan")
    comments = relationship("PostComment", back_populates="post", cascade="all, delete-orphan")
    views = relationship("PostView", back_populates="post", cascade="all, delete-orphan")


class PostReaction(Base, UUIDPrimaryKeyMixin):
    """
    Reaction on a social wall post (Like, Love, Clap, Wow).
    Constraint: One reaction per user per post.
    """
    __tablename__ = "social_post_reactions"

    post_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("social_posts.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    reaction_type: Mapped[str] = mapped_column(
        String(20),
        default=ReactionType.LIKE.value,
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        default=utc_now,
        nullable=False,
    )

    # Relationships
    post = relationship("Post", back_populates="reactions")
    user = relationship("User", foreign_keys=[user_id], lazy="joined")

    __table_args__ = (
        UniqueConstraint("post_id", "user_id", name="uq_post_user_reaction"),
    )


class PostComment(Base, UUIDPrimaryKeyMixin):
    """
    Comments on a social wall post. Only staff can comment; students/parents view read-only.
    """
    __tablename__ = "social_post_comments"

    post_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("social_posts.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    author_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    content: Mapped[str] = mapped_column(String(300), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        default=utc_now,
        nullable=False,
    )

    # Relationships
    post = relationship("Post", back_populates="comments")
    author = relationship("User", foreign_keys=[author_id], lazy="joined")


class PostView(Base, UUIDPrimaryKeyMixin):
    """
    Tracking unique views per post for engagement telemetry.
    """
    __tablename__ = "social_post_views"

    post_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("social_posts.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    viewed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        default=utc_now,
        nullable=False,
    )

    # Relationships
    post = relationship("Post", back_populates="views")
    user = relationship("User", foreign_keys=[user_id])

    __table_args__ = (
        UniqueConstraint("post_id", "user_id", name="uq_post_user_view"),
    )

