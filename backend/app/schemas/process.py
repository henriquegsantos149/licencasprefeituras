"""
Pydantic schemas for process-related operations.
"""
from pydantic import BaseModel, Field
from typing import Optional, Dict, List
from datetime import datetime, date
from app.models.process import ProcessStatus


class ProcessDocumentCreate(BaseModel):
    """Schema for creating a process document."""
    document_type: str
    document_name: str
    is_required: bool = True


class ProcessDocumentResponse(BaseModel):
    """Schema for process document response."""
    id: str
    process_id: str
    document_type: str
    document_name: str
    file_path: Optional[str] = None
    file_size: Optional[int] = None
    mime_type: Optional[str] = None
    is_required: bool
    is_uploaded: bool
    uploaded_at: Optional[datetime] = None
    created_at: datetime
    
    model_config = {"from_attributes": True}


class ProcessHistoryResponse(BaseModel):
    """Schema for process history response."""
    id: str
    process_id: str
    action: str
    user: str
    observation: Optional[str] = None
    extra_data: Optional[Dict] = None
    created_at: datetime
    
    model_config = {"from_attributes": True}


class ProcessCreate(BaseModel):
    """Schema for creating a new process."""
    company_id: str
    activity_id: str
    applicant_name: str
    process_data: Optional[Dict] = None


class ProcessUpdate(BaseModel):
    """Schema for updating a process."""
    status: Optional[ProcessStatus] = None
    deadline_agency: Optional[date] = None
    deadline_applicant: Optional[date] = None
    process_data: Optional[Dict] = None


class ProcessResponse(BaseModel):
    """Schema for process response."""
    id: str
    company_id: str
    activity_id: str
    applicant_name: str
    company_name: Optional[str] = None  # Company razao_social
    activity_name: Optional[str] = None
    status: ProcessStatus
    deadline_agency: Optional[date] = None
    deadline_applicant: Optional[date] = None
    process_data: Optional[Dict] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    documents: List[ProcessDocumentResponse] = []
    history: List[ProcessHistoryResponse] = []
    
    model_config = {"from_attributes": True}
    
    @classmethod
    def model_validate(cls, obj, **kwargs):
        """Override to include company name from relationship."""
        if hasattr(obj, '__dict__'):
            data = obj.__dict__.copy()
            # Extract company name from relationship
            if hasattr(obj, 'company') and obj.company:
                data['company_name'] = obj.company.razao_social
            # Extract activity name from relationship
            if hasattr(obj, 'activity') and obj.activity:
                data['activity_name'] = obj.activity.name
            return super().model_validate(data, **kwargs)
        return super().model_validate(obj, **kwargs)
