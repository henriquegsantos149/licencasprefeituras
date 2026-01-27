"""
Activity management routes.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.activity import Activity
from app.schemas.activity import ActivityResponse
from app.auth import get_current_active_user
from app.models.user import User

router = APIRouter(prefix="/activities", tags=["activities"])


@router.get("/", response_model=List[ActivityResponse])
async def get_activities(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get list of available activities."""
    activities = db.query(Activity).all()
    return [ActivityResponse.model_validate(activity) for activity in activities]


@router.get("/{activity_id}", response_model=ActivityResponse)
async def get_activity(
    activity_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a specific activity by ID."""
    activity = db.query(Activity).filter(Activity.id == activity_id).first()
    if not activity:
        from fastapi import HTTPException, status
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Activity not found"
        )
    return ActivityResponse.model_validate(activity)
