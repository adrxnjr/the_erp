import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, Request, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.permissions import require_super_admin
from app.db.dependencies import get_db
from app.models.user import Role, User
from app.schemas.auth import RoleResponse, UserResponse
from app.schemas.user import RoleCreate, UserCreate, UserUpdate
from app.services.user_service import UserService

router = APIRouter(prefix="/users", tags=["User Administration"])


@router.get(
    "",
    response_model=dict,
    status_code=status.HTTP_200_OK,
    summary="List and Search Users",
)
def list_users(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    portal_type: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    current_user: User = Depends(require_super_admin),
    db: Session = Depends(get_db),
):
    users, total = UserService.list_users(
        db=db,
        page=page,
        page_size=page_size,
        search=search,
        portal_type=portal_type,
        is_active=is_active,
    )
    return {
        "items": [u.model_dump() for u in users],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size if total > 0 else 0,
    }


@router.post(
    "",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create System User",
)
def create_user(
    request: Request,
    payload: UserCreate,
    current_user: User = Depends(require_super_admin),
    db: Session = Depends(get_db),
):
    return UserService.create_user(db=db, data=payload, actor=current_user, request=request)


@router.patch(
    "/{user_id}",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Update User Status / Roles",
)
def update_user(
    user_id: uuid.UUID,
    request: Request,
    payload: UserUpdate,
    current_user: User = Depends(require_super_admin),
    db: Session = Depends(get_db),
):
    return UserService.update_user(db=db, user_id=user_id, data=payload, actor=current_user, request=request)


@router.get(
    "/roles/all",
    response_model=List[RoleResponse],
    status_code=status.HTTP_200_OK,
    summary="List System Roles",
)
def list_roles(
    current_user: User = Depends(require_super_admin),
    db: Session = Depends(get_db),
):
    roles = db.execute(select(Role).order_by(Role.name)).scalars().all()
    return [RoleResponse.model_validate(r) for r in roles]
