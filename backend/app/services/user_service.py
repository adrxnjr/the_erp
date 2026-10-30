import uuid
from typing import List, Optional, Tuple
from fastapi import Request, status
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session, selectinload

from app.core.exceptions import AppError
from app.core.security import hash_password
from app.models.user import Role, User, UserRole
from app.schemas.auth import UserResponse
from app.schemas.user import UserCreate, UserUpdate
from app.services.audit_service import record_audit


class UserService:
    @staticmethod
    def is_super_admin(user: User) -> bool:
        return any(ur.role.name == "super_admin" for ur in user.user_roles if ur.role and ur.role.is_active)

    @staticmethod
    def count_active_super_admins(db: Session) -> int:
        """Counts how many active users possess the active 'super_admin' role."""
        stmt = (
            select(func.count(func.distinct(User.id)))
            .join(UserRole, User.id == UserRole.user_id)
            .join(Role, UserRole.role_id == Role.id)
            .where(
                Role.name == "super_admin",
                Role.is_active == True,
                User.is_active == True,
                User.is_locked == False,
            )
        )
        return db.execute(stmt).scalar() or 0

    @classmethod
    def list_users(
        cls,
        db: Session,
        page: int = 1,
        page_size: int = 20,
        search: Optional[str] = None,
        portal_type: Optional[str] = None,
        is_active: Optional[bool] = None,
    ) -> Tuple[List[UserResponse], int]:
        """Lists users with filtering and pagination."""
        query = select(User).options(selectinload(User.user_roles).selectinload(UserRole.role))

        if search:
            search_term = f"%{search.strip()}%"
            query = query.where(
                or_(
                    User.username.ilike(search_term),
                    User.full_name.ilike(search_term),
                    User.email.ilike(search_term),
                )
            )

        if portal_type:
            query = query.where(User.portal_type == portal_type)

        if is_active is not None:
            query = query.where(User.is_active == is_active)

        # Count total
        count_query = select(func.count()).select_from(query.subquery())
        total = db.execute(count_query).scalar() or 0

        # Paginate
        query = query.order_by(User.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
        users = db.execute(query).scalars().all()

        results = []
        for u in users:
            roles = [ur.role.name for ur in u.user_roles if ur.role and ur.role.is_active]
            results.append(
                UserResponse(
                    id=u.id,
                    username=u.username,
                    email=u.email,
                    full_name=u.full_name,
                    phone_number=u.phone_number,
                    portal_type=u.portal_type,
                    is_active=u.is_active,
                    is_locked=u.is_locked,
                    must_change_password=u.must_change_password,
                    roles=roles,
                    last_login_at=u.last_login_at,
                    created_at=u.created_at,
                )
            )

        return results, total

    @classmethod
    def create_user(
        cls,
        db: Session,
        data: UserCreate,
        actor: User,
        request: Optional[Request] = None,
    ) -> UserResponse:
        """Creates a new user and assigns verified roles."""
        # Check uniqueness
        existing = db.execute(
            select(User).where(or_(User.username == data.username, User.email == data.email))
        ).scalar_one_or_none()

        if existing:
            if existing.username == data.username:
                raise AppError(
                    message=f"Username '{data.username}' is already taken.",
                    status_code=status.HTTP_409_CONFLICT,
                    error_code="USERNAME_EXISTS",
                )
            if existing.email == data.email and data.email is not None:
                raise AppError(
                    message=f"Email '{data.email}' is already in use.",
                    status_code=status.HTTP_409_CONFLICT,
                    error_code="EMAIL_EXISTS",
                )

        # Validate roles
        roles = db.execute(select(Role).where(Role.id.in_(data.role_ids))).scalars().all()
        if len(roles) != len(data.role_ids):
            raise AppError(
                message="One or more specified role IDs do not exist.",
                status_code=status.HTTP_400_BAD_REQUEST,
                error_code="INVALID_ROLE_ID",
            )

        new_user = User(
            id=uuid.uuid4(),
            username=data.username,
            email=str(data.email) if data.email else None,
            hashed_password=hash_password(data.password),
            full_name=data.full_name,
            phone_number=data.phone_number,
            portal_type=data.portal_type,
            is_active=True,
            is_locked=False,
            must_change_password=True,
        )
        db.add(new_user)
        db.flush()

        role_names = []
        for r in roles:
            ur = UserRole(id=uuid.uuid4(), user_id=new_user.id, role_id=r.id)
            db.add(ur)
            role_names.append(r.name)

        record_audit(
            db=db,
            action="USER_CREATED",
            entity_name="users",
            record_id=str(new_user.id),
            actor_user_id=actor.id,
            new_values={
                "username": new_user.username,
                "portal_type": new_user.portal_type,
                "roles": role_names,
            },
            request=request,
        )
        db.commit()

        return UserResponse(
            id=new_user.id,
            username=new_user.username,
            email=new_user.email,
            full_name=new_user.full_name,
            phone_number=new_user.phone_number,
            portal_type=new_user.portal_type,
            is_active=new_user.is_active,
            is_locked=new_user.is_locked,
            must_change_password=new_user.must_change_password,
            roles=role_names,
            last_login_at=None,
            created_at=new_user.created_at,
        )

    @classmethod
    def update_user(
        cls,
        db: Session,
        user_id: uuid.UUID,
        data: UserUpdate,
        actor: User,
        request: Optional[Request] = None,
    ) -> UserResponse:
        """Updates user details, activation status, or assigned roles with strict super_admin protections."""
        user = db.execute(
            select(User)
            .options(selectinload(User.user_roles).selectinload(UserRole.role))
            .where(User.id == user_id)
        ).scalar_one_or_none()

        if not user:
            raise AppError(
                message=f"User with ID '{user_id}' not found.",
                status_code=status.HTTP_404_NOT_FOUND,
                error_code="USER_NOT_FOUND",
            )

        is_target_super_admin = cls.is_super_admin(user)

        # Rule: Only super_admin can modify a super_admin account
        if is_target_super_admin and not cls.is_super_admin(actor):
            raise AppError(
                message="Only super administrators can modify another super administrator account.",
                status_code=status.HTTP_403_FORBIDDEN,
                error_code="SUPER_ADMIN_PROTECTED",
            )

        # Rule: The last active super_admin cannot be deactivated or un-roled
        if is_target_super_admin:
            if data.is_active is False or (data.role_ids is not None and not any(r for r in data.role_ids if r == user_id)):
                active_count = cls.count_active_super_admins(db)
                if active_count <= 1:
                    raise AppError(
                        message="Cannot deactivate or remove the super_admin role from the last active super administrator.",
                        status_code=status.HTTP_400_BAD_REQUEST,
                        error_code="CANNOT_REMOVE_LAST_SUPER_ADMIN",
                    )

        old_values = {
            "email": user.email,
            "full_name": user.full_name,
            "is_active": user.is_active,
            "is_locked": user.is_locked,
        }

        if data.email is not None:
            user.email = str(data.email)
        if data.full_name is not None:
            user.full_name = data.full_name
        if data.phone_number is not None:
            user.phone_number = data.phone_number
        if data.is_active is not None:
            user.is_active = data.is_active
        if data.is_locked is not None:
            user.is_locked = data.is_locked
            if not data.is_locked:
                user.failed_login_attempts = 0  # Reset failed count on unlock

        # Update roles if specified
        if data.role_ids is not None:
            # Delete old roles
            for ur in list(user.user_roles):
                db.delete(ur)
            db.flush()

            roles = db.execute(select(Role).where(Role.id.in_(data.role_ids))).scalars().all()
            for r in roles:
                db.add(UserRole(id=uuid.uuid4(), user_id=user.id, role_id=r.id))

        record_audit(
            db=db,
            action="USER_UPDATED",
            entity_name="users",
            record_id=str(user.id),
            actor_user_id=actor.id,
            old_values=old_values,
            new_values={
                "email": user.email,
                "full_name": user.full_name,
                "is_active": user.is_active,
                "is_locked": user.is_locked,
            },
            request=request,
        )
        db.commit()

        # Reload
        db.refresh(user)
        role_names = [ur.role.name for ur in user.user_roles if ur.role and ur.role.is_active]

        return UserResponse(
            id=user.id,
            username=user.username,
            email=user.email,
            full_name=user.full_name,
            phone_number=user.phone_number,
            portal_type=user.portal_type,
            is_active=user.is_active,
            is_locked=user.is_locked,
            must_change_password=user.must_change_password,
            roles=role_names,
            last_login_at=user.last_login_at,
            created_at=user.created_at,
        )

    @classmethod
    def admin_reset_password(
        cls,
        db: Session,
        user_id: uuid.UUID,
        new_password: Optional[str],
        must_change_password: bool,
        actor: User,
        request: Optional[Request] = None,
    ) -> str:
        """Allows super_admin to reset any user's password."""
        user = db.execute(select(User).where(User.id == user_id)).scalar_one_or_none()
        if not user:
            raise AppError(
                message=f"User with ID '{user_id}' not found.",
                status_code=status.HTTP_404_NOT_FOUND,
                error_code="USER_NOT_FOUND",
            )

        if cls.is_super_admin(user) and not cls.is_super_admin(actor):
            raise AppError(
                message="Only super administrators can reset a super administrator password.",
                status_code=status.HTTP_403_FORBIDDEN,
                error_code="SUPER_ADMIN_PROTECTED",
            )

        generated_pwd = new_password or f"SchoolERP@{uuid.uuid4().hex[:8]}"
        user.hashed_password = hash_password(generated_pwd)
        user.must_change_password = must_change_password
        user.is_locked = False
        user.failed_login_attempts = 0

        record_audit(
            db=db,
            action="ADMIN_PASSWORD_RESET",
            entity_name="users",
            record_id=str(user.id),
            actor_user_id=actor.id,
            request=request,
        )
        db.commit()
        return generated_pwd
