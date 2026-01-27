"""
Pydantic schemas for activity-related operations.
"""
from pydantic import BaseModel
from typing import Optional, Dict, List


class ActivityResponse(BaseModel):
    """Schema for activity response."""
    id: str
    name: str
    category: Optional[str] = None
    risk_level: Optional[str] = None
    required_documents: Optional[List[Dict]] = None
    questions: Optional[List[Dict]] = None
    
    model_config = {"from_attributes": True}
