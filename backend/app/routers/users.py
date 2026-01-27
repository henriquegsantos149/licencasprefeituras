"""
User management routes.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.user import User
from app.schemas.user import UserResponse, UserUpdate, UserPreferencesUpdate
from app.auth import get_current_active_user

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/", response_model=List[UserResponse])
async def get_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get list of users (requires authentication)."""
    users = db.query(User).offset(skip).limit(limit).all()
    return [UserResponse.model_validate(user) for user in users]


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a specific user by ID."""
    user = db.query(User).filter(User.id == user_id).first()
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
    return UserResponse.model_validate(current_user)


@router.put("/me/preferences", response_model=UserResponse)
async def update_user_preferences(
    preferences: UserPreferencesUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update current user's preferences."""
    # Initialize preferences if None
    if current_user.preferences is None:
        current_user.preferences = {"darkMode": False, "notifications": True}
    
    # Update preferences
    prefs_data = preferences.model_dump(exclude_unset=True)
    for key, value in prefs_data.items():
        current_user.preferences[key] = value
    
    # Garantir que darkMode sempre tenha um valor (padrão: False - modo claro)
    if "darkMode" not in current_user.preferences:
        current_user.preferences["darkMode"] = False
    
    db.commit()
    db.refresh(current_user)
    return UserResponse.model_validate(current_user)


@router.get("/me/preferences", response_model=dict)
async def get_user_preferences(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get current user's preferences."""
    if current_user.preferences is None:
        return {"darkMode": False, "notifications": True}
    # Garantir que darkMode sempre tenha um valor (padrão: False - modo claro)
    prefs = current_user.preferences.copy() if current_user.preferences else {}
    if "darkMode" not in prefs:
        prefs["darkMode"] = False
    if "notifications" not in prefs:
        prefs["notifications"] = True
    return prefs
