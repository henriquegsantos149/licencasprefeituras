"""
User management routes.
"""
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List
from app.database import get_db
from app.models.user import User
from app.models.user_preferences import UserPreferences
from app.schemas.user import UserResponse, UserUpdate, UserPreferencesUpdate
from app.auth import get_current_active_user
from app.permissions import require_admin

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/", response_model=List[UserResponse])
async def get_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Get list of users (requires ADMIN role)."""
    users = db.query(User).options(
        joinedload(User.preferences),
        joinedload(User.role_obj)
    ).offset(skip).limit(limit).all()
    return [UserResponse.model_validate(user) for user in users]


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a specific user by ID."""
    user = db.query(User).options(
        joinedload(User.preferences),
        joinedload(User.role_obj)
    ).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return UserResponse.model_validate(user)


@router.put("/me", response_model=UserResponse)
async def update_current_user(
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update current user's data."""
    update_data = user_update.model_dump(exclude_unset=True)
    
    if "endereco" in update_data and update_data["endereco"]:
        update_data["endereco"] = update_data["endereco"].model_dump() if hasattr(update_data["endereco"], "model_dump") else update_data["endereco"]
    
    for field, value in update_data.items():
        setattr(current_user, field, value)
    
    db.commit()
    db.refresh(current_user)
    # Reload preferences relationship
    db.refresh(current_user, ['preferences'])
    return UserResponse.model_validate(current_user)


@router.put("/me/preferences", response_model=UserResponse)
async def update_user_preferences(
    preferences: UserPreferencesUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update current user's preferences."""
    # Get or create UserPreferences
    if current_user.preferences is None:
        user_prefs = UserPreferences(
            id=str(uuid.uuid4()),
            user_id=current_user.id,
            dark_mode=False,
            notifications=True
        )
        db.add(user_prefs)
        current_user.preferences = user_prefs
    else:
        user_prefs = current_user.preferences
    
    # Update preferences
    prefs_data = preferences.model_dump(exclude_unset=True)
    
    # Map camelCase to snake_case
    if "darkMode" in prefs_data:
        user_prefs.dark_mode = prefs_data["darkMode"]
    if "notifications" in prefs_data:
        user_prefs.notifications = prefs_data["notifications"]
    
    # Garantir que darkMode sempre tenha um valor (padrão: False - modo claro)
    if user_prefs.dark_mode is None:
        user_prefs.dark_mode = False
    
    db.commit()
    db.refresh(current_user)
    db.refresh(user_prefs)
    return UserResponse.model_validate(current_user)


@router.get("/me/preferences", response_model=dict)
async def get_user_preferences(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get current user's preferences."""
    # Reload preferences relationship
    db.refresh(current_user, ['preferences'])
    
    if current_user.preferences is None:
        return {"darkMode": False, "notifications": True}
    
    # Convert UserPreferences to dict format
    prefs = {
        "darkMode": current_user.preferences.dark_mode if current_user.preferences.dark_mode is not None else False,
        "notifications": current_user.preferences.notifications if current_user.preferences.notifications is not None else True
    }
    
    # Garantir que darkMode sempre tenha um valor (padrão: False - modo claro)
    if prefs.get("darkMode") is None:
        prefs["darkMode"] = False
    if prefs.get("notifications") is None:
        prefs["notifications"] = True
    
    return prefs
