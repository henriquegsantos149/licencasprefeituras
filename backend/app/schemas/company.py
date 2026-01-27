"""
Pydantic schemas for company-related operations.
"""
from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional, Dict, List
from datetime import datetime


class Address(BaseModel):
    """Address schema."""
    cep: Optional[str] = None
    logradouro: Optional[str] = None
    numero: Optional[str] = None
    complemento: Optional[str] = None
    bairro: Optional[str] = None
    cidade: Optional[str] = None
    uf: Optional[str] = None


class CompanyCreate(BaseModel):
    """Schema for creating a company."""
    razao_social: str = Field(..., min_length=1)
    nome_fantasia: Optional[str] = None
    cnpj: str = Field(..., min_length=14, max_length=18)
    inscricao_estadual: Optional[str] = None
    email: Optional[EmailStr] = None
    telefone: Optional[str] = None
    endereco: Optional[Address] = None
    activity_ids: Optional[List[str]] = None  # List of activity IDs to associate
    
    @field_validator('cnpj')
    @classmethod
    def validate_cnpj(cls, v):
        """Clean CNPJ by removing non-numeric characters."""
        return ''.join(filter(str.isdigit, v))
    
    @field_validator('telefone')
    @classmethod
    def validate_telefone(cls, v):
        """Clean phone by removing non-numeric characters."""
        if v:
            return ''.join(filter(str.isdigit, v))
        return v


class CompanyUpdate(BaseModel):
    """Schema for updating company data."""
    razao_social: Optional[str] = None
    nome_fantasia: Optional[str] = None
    inscricao_estadual: Optional[str] = None
    email: Optional[EmailStr] = None
    telefone: Optional[str] = None
    endereco: Optional[Address] = None


class CompanyResponse(BaseModel):
    """Schema for company response."""
    id: str
    user_id: str
    razao_social: str
    nome_fantasia: Optional[str]
    cnpj: str
    inscricao_estadual: Optional[str]
    email: Optional[str]
    telefone: Optional[str]
    endereco: Optional[Dict] = None
    activity_ids: Optional[List[str]] = None  # List of associated activity IDs
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    model_config = {"from_attributes": True}
    
    @classmethod
    def model_validate(cls, obj, **kwargs):
        """Override to include activity IDs from relationship."""
        if hasattr(obj, '__dict__'):
            data = obj.__dict__.copy()
            # Extract activity IDs from relationship
            if hasattr(obj, 'activities') and obj.activities:
                if hasattr(obj.activities, 'all'):
                    # If it's a dynamic relationship
                    activities = obj.activities.all()
                    data['activity_ids'] = [act.id for act in activities]
                else:
                    # If it's a list
                    data['activity_ids'] = [act.id for act in obj.activities]
            else:
                data['activity_ids'] = []
            return super().model_validate(data, **kwargs)
        return super().model_validate(obj, **kwargs)


class CompanyActivityAssociation(BaseModel):
    """Schema for associating activities with a company."""
    activity_ids: List[str] = Field(..., min_items=1)
