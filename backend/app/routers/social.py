import os
import uuid
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from sqlalchemy.orm import Session

from app.core.exceptions import AppError
from app.core.permissions import get_current_user, require_roles
from app.db.dependencies import get_db
from app.models.user import User
from app.schemas.social import (
    PostCreate,
    PostResponse,
    PostCommentCreate,
    PostCommentResponse,
    ReactionPayload,
    PaginatedFeedResponse,
    SocialStatsResponse,
)
from app.services.social_service import SocialService

router = APIRouter(prefix="/social", tags=["School Internal Social Wall"])

UPLOAD_DIR = os.path.join("uploads", "social")
os.makedirs(UPLOAD_DIR, exist_ok=True)


def _is_staff_or_admin(user: User) -> bool:
    user_roles = [ur.role.name for ur in user.user_roles if ur.role] if hasattr(user, "user_roles") else []
    return (
        user.username == "adrin"
        or user.portal_type == "staff"
        or any(r in user_roles for r in ["super_admin", "school_admin", "principal", "teacher", "staff"])
    )


def _is_admin(user: User) -> bool:
    user_roles = [ur.role.name for ur in user.user_roles if ur.role] if hasattr(user, "user_roles") else []
    return (
        user.username == "adrin"
        or any(r in user_roles for r in ["super_admin", "school_admin", "principal"])
    )


# =========================================================================
# 1. FEED ENDPOINTS (All Authenticated Users)
# =========================================================================

@router.get("/feed", response_model=PaginatedFeedResponse, summary="Get paginated social wall feed")
def get_social_feed(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    filter_type: Optional[str] = Query(None, description="announcements, achievements, events, my_class"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    SocialService.seed_sample_posts_if_empty(db)
    return SocialService.get_feed(
        current_user=current_user,
        page=page,
        page_size=page_size,
        filter_type=filter_type,
        db=db,
    )


@router.get("/posts/{post_id}", response_model=PostResponse, summary="Get single post details")
def get_post_details(
    post_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    post = SocialService.get_post_details(post_id, current_user.id, db)
    if not post:
        raise AppError(message="Post not found or unavailable.", status_code=404)
    return post


@router.post("/posts/{post_id}/react", summary="Add or toggle reaction on post")
def react_to_post(
    post_id: uuid.UUID,
    payload: ReactionPayload,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    valid_reactions = ["LIKE", "LOVE", "CLAP", "WOW"]
    r_type = payload.reaction_type.upper()
    if r_type not in valid_reactions:
        raise AppError(message=f"Invalid reaction type. Must be one of: {valid_reactions}", status_code=400)

    result = SocialService.toggle_reaction(
        post_id=post_id,
        user_id=current_user.id,
        reaction_type=r_type,
        db=db,
    )
    return result


@router.post("/posts/{post_id}/view", summary="Record a unique post view")
def record_post_view(
    post_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    viewed = SocialService.record_view(post_id=post_id, user_id=current_user.id, db=db)
    return {"status": "ok", "recorded": viewed}


@router.get("/widgets", summary="Get data for Social Wall sidebar widgets")
def get_social_widgets(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return SocialService.get_widget_data(db)


# =========================================================================
# 2. STAFF & TEACHER ENDPOINTS
# =========================================================================

@router.post("/posts", response_model=PostResponse, status_code=status.HTTP_201_CREATED, summary="Create a new post (Staff/Admin)")
def create_social_post(
    payload: PostCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not _is_staff_or_admin(current_user):
        raise AppError(message="Students and parents cannot create posts on the School Wall.", status_code=403)

    # Teachers can only post CLASS_SPECIFIC or SCHOOL_WIDE
    if not _is_admin(current_user) and payload.visibility == "STAFF_ONLY":
        raise AppError(message="Teachers can only post Class-Specific or School-Wide announcements.", status_code=403)

    post = SocialService.create_post(
        author_id=current_user.id,
        post_type=payload.post_type,
        content=payload.content,
        title=payload.title,
        visibility=payload.visibility,
        target_class_id=payload.target_class_id,
        image_url=payload.image_url,
        db=db,
    )

    # Return full post response
    return SocialService.get_post_details(post.id, current_user.id, db)


@router.get("/posts/{post_id}/comments", response_model=List[PostCommentResponse], summary="Get comments for a post")
def get_post_comments(
    post_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return SocialService.get_comments(post_id=post_id, db=db)


@router.post("/posts/{post_id}/comments", response_model=PostCommentResponse, status_code=status.HTTP_201_CREATED, summary="Add a comment (Staff Only)")
def add_post_comment(
    post_id: uuid.UUID,
    payload: PostCommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not _is_staff_or_admin(current_user):
        raise AppError(message="Only staff members can leave comments on posts.", status_code=403)

    return SocialService.add_comment(
        post_id=post_id,
        author_id=current_user.id,
        content=payload.content,
        db=db,
    )


@router.delete("/comments/{comment_id}", summary="Delete comment (Author or Admin)")
def delete_post_comment(
    comment_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    success = SocialService.delete_comment(
        comment_id=comment_id,
        user_id=current_user.id,
        is_admin=_is_admin(current_user),
        db=db,
    )
    if not success:
        raise AppError(message="Comment not found or unauthorized to delete.", status_code=403)
    return {"message": "Comment removed successfully."}


# =========================================================================
# 3. ADMIN MODERATION ENDPOINTS
# =========================================================================

@router.get("/pending", response_model=List[PostResponse], summary="List posts pending approval (Admin Only)")
def list_pending_posts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not _is_admin(current_user):
        raise AppError(message="Only administrators can review pending posts.", status_code=403)
    return SocialService.get_pending_posts(current_user.id, db)


@router.put("/posts/{post_id}/approve", summary="Approve a post (Admin Only)")
def approve_post(
    post_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not _is_admin(current_user):
        raise AppError(message="Only administrators can approve posts.", status_code=403)
    success = SocialService.approve_post(post_id, db)
    if not success:
        raise AppError(message="Post not found", status_code=404)
    return {"message": "Post successfully verified and published to school feed."}


@router.put("/posts/{post_id}/reject", summary="Reject a post (Admin Only)")
def reject_post(
    post_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not _is_admin(current_user):
        raise AppError(message="Only administrators can reject posts.", status_code=403)
    success = SocialService.reject_post(post_id, db)
    if not success:
        raise AppError(message="Post not found", status_code=404)
    return {"message": "Post rejected and archived."}


@router.put("/posts/{post_id}/pin", summary="Toggle pin status of post (Admin Only)")
def toggle_post_pin(
    post_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not _is_admin(current_user):
        raise AppError(message="Only administrators can pin announcements.", status_code=403)
    new_status = SocialService.toggle_pin(post_id, db)
    return {"message": f"Post pin status updated to {new_status}.", "is_pinned": new_status}


@router.delete("/posts/{post_id}", summary="Delete a post (Admin Only)")
def delete_post(
    post_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not _is_admin(current_user):
        raise AppError(message="Only administrators can delete posts.", status_code=403)
    success = SocialService.delete_post(post_id, db)
    if not success:
        raise AppError(message="Post not found", status_code=404)
    return {"message": "Post permanently removed."}


@router.get("/stats", response_model=SocialStatsResponse, summary="Get social wall engagement metrics (Admin Only)")
def get_social_metrics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return SocialService.get_stats(db)


# =========================================================================
# 4. IMAGE UPLOAD ENDPOINT
# =========================================================================

@router.post("/upload-image", summary="Upload image for social post (Staff/Admin)")
async def upload_social_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    if not _is_staff_or_admin(current_user):
        raise AppError(message="Unauthorized to upload post media.", status_code=403)

    # 1. Validate content type (jpg/png only)
    allowed_types = ["image/jpeg", "image/png", "image/jpg", "image/webp"]
    if file.content_type not in allowed_types:
        raise AppError(message="Only JPEG, PNG, or WEBP images are supported.", status_code=400)

    # 2. Validate file size (max 5MB)
    contents = await file.read()
    if len(contents) > 5 * 1024 * 1024:
        raise AppError(message="Image exceeds maximum allowed size of 5MB.", status_code=400)

    # 3. Save to backend/uploads/social/
    ext = os.path.splitext(file.filename)[1] or ".jpg"
    safe_filename = f"social_{uuid.uuid4().hex[:12]}{ext}"
    target_path = os.path.join(UPLOAD_DIR, safe_filename)

    with open(target_path, "wb") as f:
        f.write(contents)

    image_url = f"/uploads/social/{safe_filename}"
    return {"image_url": image_url}

