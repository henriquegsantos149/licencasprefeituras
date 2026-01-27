"""
Pydantic schemas for role and permission operations.
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class PermissionResponse(BaseModel):
    """Schema for permission response."""
    id: str
    name: str
    description: Optional[str] = None
    category: Optional[str] = None
    is_active: bool
    created_at: datetime
    
    model_config = {"from_attributes": True}


class RoleResponse(BaseModel):
    """Schema for role response."""
    id: str
    name: str
    description: Optional[str] = None
    is_default: bool
    is_active: bool
    permissions: List[PermissionResponse] = []
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    model_config = {"from_attributes": True}


class RoleCreate(BaseModel):
    """Schema for creating a role."""
    id: str = Field(..., min_length=1)
    name: str = Field(..., min_length=1)
    description: Optional[str] = None
    is_default: bool = False
    permission_ids: Optional[List[str]] = None


class RoleUpdate(BaseModel):
    """Schema for updating a role."""
    name: Optional[str] = None
    description: Optional[str] = None
    is_default: Optional[bool] = None
    is_active: Optional[bool] = None
    permission_ids: Optional[List[str]] = None


class PermissionCreate(BaseModel):
    """Schema for creating a permission."""
    id: str = Field(..., min_length=1)
    name: str = Field(..., min_length=1)
    description: Optional[str] = None
    category: Optional[str] = None


class PermissionUpdate(BaseModel):
    """Schema for updating a permission."""
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    is_active: Optional[bool] = None
