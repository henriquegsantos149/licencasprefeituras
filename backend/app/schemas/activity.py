"""
Pydantic schemas for activity-related operations.
"""
from pydantic import BaseModel
from typing import Optional, Dict, List


class ActivityResponse(BaseModel):
    """Schema for activity response."""
    id: str
    name: str
    group: Optional[str] = None
    category: Optional[str] = None
    risk_level: Optional[str] = None
    sort_order: Optional[int] = None
    required_documents: Optional[List[Dict]] = None
    questions: Optional[List[Dict]] = None
    
    model_config = {"from_attributes": True}
