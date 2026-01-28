"""
Activity management routes.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.activity import Activity
from app.schemas.activity import ActivityResponse

router = APIRouter(prefix="/activities", tags=["activities"])


@router.get("/", response_model=List[ActivityResponse])
async def get_activities(
    db: Session = Depends(get_db),
):
    """Get list of available activities.

    This endpoint is intentionally public so the "Novo Processo" form can
    populate the activities dropdown without requiring authentication.
    """
    activities = db.query(Activity).all()
    return [ActivityResponse.model_validate(activity) for activity in activities]


@router.get("/{activity_id}", response_model=ActivityResponse)
async def get_activity(
    activity_id: str,
    db: Session = Depends(get_db),
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
