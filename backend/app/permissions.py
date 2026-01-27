"""
Permission system for role-based access control (database-driven).
All roles and permissions are stored in the database - no hardcoded values.
"""
from fastapi import HTTPException, status, Depends
from typing import List, Set, Optional, Optional
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.role import Role, Permission
from app.auth import get_current_active_user
from app.database import get_db


# Permission ID constants - These are just string constants for type safety
# The actual permissions must exist in the database
# These constants should match the permission IDs created in the migration
PERMISSION_IDS = {
    "VIEW_OWN_PROCESSES": "view_own_processes",
    "VIEW_ALL_PROCESSES": "view_all_processes",
    "CREATE_PROCESS": "create_process",
    "UPDATE_OWN_PROCESS": "update_own_process",
    "UPDATE_ANY_PROCESS": "update_any_process",
    "VIEW_ADMIN": "view_admin",
    "MANAGE_PROCESSES": "manage_processes",
    "MANAGE_USERS": "manage_users",
    "MANAGE_ACTIVITIES": "manage_activities",
}

# For backward compatibility, create a Permission class-like object
class Permission:
    """Permission ID constants. These must match permission IDs in the database."""
    VIEW_OWN_PROCESSES = PERMISSION_IDS["VIEW_OWN_PROCESSES"]
    VIEW_ALL_PROCESSES = PERMISSION_IDS["VIEW_ALL_PROCESSES"]
    CREATE_PROCESS = PERMISSION_IDS["CREATE_PROCESS"]
    UPDATE_OWN_PROCESS = PERMISSION_IDS["UPDATE_OWN_PROCESS"]
    UPDATE_ANY_PROCESS = PERMISSION_IDS["UPDATE_ANY_PROCESS"]
    VIEW_ADMIN = PERMISSION_IDS["VIEW_ADMIN"]
    MANAGE_PROCESSES = PERMISSION_IDS["MANAGE_PROCESSES"]
    MANAGE_USERS = PERMISSION_IDS["MANAGE_USERS"]
    MANAGE_ACTIVITIES = PERMISSION_IDS["MANAGE_ACTIVITIES"]


def get_user_permissions(user: User, db: Session) -> Set[str]:
    """Get all permissions for a user based on their role from the database."""
    # Load role
    role = db.query(Role).filter(Role.id == user.role_id).first()
    
    if not role or not role.is_active:
        return set()
    
    # Get all permission IDs for this role
    # Access permissions through the relationship (lazy="dynamic" allows querying)
    permissions = role.permissions.filter(Permission.is_active == True).all()
    
    return {perm.id for perm in permissions}


def has_permission(user: User, permission: str, db: Session) -> bool:
    """Check if a user has a specific permission (from database)."""
    user_permissions = get_user_permissions(user, db)
    return permission in user_permissions


def require_permission(permission: str):
    """Dependency to require a specific permission."""
    def permission_checker(
        current_user: User = Depends(get_current_active_user),
        db: Session = Depends(get_db)
    ) -> User:
        if not has_permission(current_user, permission, db):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission denied: {permission}"
            )
        return current_user
    return permission_checker


def require_role(required_role_ids: List[str]):
    """Dependency to require one of the specified roles (by ID from database)."""
    def role_checker(
        current_user: User = Depends(get_current_active_user),
        db: Session = Depends(get_db)
    ) -> User:
        # Reload user with role to ensure we have the latest data
        user = db.query(User).filter(User.id == current_user.id).first()
        
        if not user or user.role_id not in required_role_ids:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {required_role_ids}"
            )
        return user
    return role_checker


# Helper functions to get roles from database
def get_role_by_id(role_id: str, db: Session) -> Optional[Role]:
    """Get a role by its ID from the database."""
    return db.query(Role).filter(Role.id == role_id, Role.is_active == True).first()


def get_roles_by_permission(permission_id: str, db: Session) -> List[Role]:
    """Get all roles that have a specific permission (from database)."""
    return db.query(Role).join(
        Role.permissions
    ).filter(
        Permission.id == permission_id,
        Permission.is_active == True,
        Role.is_active == True
    ).all()


def user_has_role_with_permission(user: User, permission_id: str, db: Session) -> bool:
    """Check if user's role has a specific permission (from database)."""
    return has_permission(user, permission_id, db)


# Convenience dependencies for common role checks - all based on permissions from database
def require_licenciador_or_admin(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> User:
    """Require role that has VIEW_ADMIN permission (fetched from database)."""
    user = db.query(User).filter(User.id == current_user.id).first()
    if not user or not user_has_role_with_permission(user, Permission.VIEW_ADMIN, db):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. This endpoint requires a role with VIEW_ADMIN permission."
        )
    return user


def require_admin(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> User:
    """Require role that has MANAGE_USERS permission (fetched from database)."""
    user = db.query(User).filter(User.id == current_user.id).first()
    if not user or not user_has_role_with_permission(user, Permission.MANAGE_USERS, db):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. This endpoint requires a role with MANAGE_USERS permission."
        )
    return user


def can_access_admin(user: User, db: Session) -> bool:
    """Check if user can access admin/gestão municipal area (from database)."""
    return has_permission(user, Permission.VIEW_ADMIN, db)


def can_view_all_processes(user: User, db: Session) -> bool:
    """Check if user can view all processes (not just their own) - from database."""
    return has_permission(user, Permission.VIEW_ALL_PROCESSES, db)


def can_manage_processes(user: User, db: Session) -> bool:
    """Check if user can manage processes (update status, etc.) - from database."""
    return has_permission(user, Permission.MANAGE_PROCESSES, db)


def get_default_role(db: Session) -> Role:
    """Get the default role for new users from database."""
    role = db.query(Role).filter(Role.is_default == True, Role.is_active == True).first()
    if not role:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="No default role configured in the database. Please configure a role with is_default=True."
        )
    return role
