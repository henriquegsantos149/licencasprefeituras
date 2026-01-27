"""
Pydantic schemas for user-related operations.
"""
from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional, Dict
from datetime import datetime
from app.models.user import UserRole


class Address(BaseModel):
    """Address schema."""
    cep: Optional[str] = None
    logradouro: Optional[str] = None
    numero: Optional[str] = None
    complemento: Optional[str] = None
    bairro: Optional[str] = None
    cidade: Optional[str] = None
    uf: Optional[str] = None


class UserCreate(BaseModel):
    """Schema for user registration."""
    razao_social: str = Field(..., min_length=1)
    nome_fantasia: Optional[str] = None
    cnpj: str = Field(..., min_length=14, max_length=18)
    inscricao_estadual: Optional[str] = None
    email: EmailStr
    telefone: Optional[str] = None
    password: str = Field(..., min_length=6)
    confirm_password: str = Field(..., min_length=6)
    endereco: Optional[Address] = None
    role: UserRole = UserRole.EMPREENDEDOR
    
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


class UserLogin(BaseModel):
    """Schema for user login."""
    email: EmailStr
    password: str


class UserPreferences(BaseModel):
    """Schema for user preferences."""
    darkMode: bool = False
    notifications: bool = True


class UserResponse(BaseModel):
    """Schema for user response (without password)."""
    id: str
    razao_social: str
    nome_fantasia: Optional[str]
    cnpj: str
    inscricao_estadual: Optional[str]
    email: str
    telefone: Optional[str]
    endereco: Optional[Dict] = None
    preferences: Optional[Dict] = None
    role: UserRole
    created_at: datetime
    
    model_config = {"from_attributes": True}
    
    @classmethod
    def model_validate(cls, obj, **kwargs):
        """Override to convert UserPreferences relationship to dict format."""
        # Convert the object to dict first
        if hasattr(obj, '__dict__'):
            data = obj.__dict__.copy()
            # Convert UserPreferences relationship to dict
            if hasattr(obj, 'preferences') and obj.preferences:
                data['preferences'] = {
                    'darkMode': obj.preferences.dark_mode,
                    'notifications': obj.preferences.notifications
                }
            elif hasattr(obj, 'preferences') and obj.preferences is None:
                # Default preferences if not set
                data['preferences'] = {
                    'darkMode': False,
                    'notifications': True
                }
            return super().model_validate(data, **kwargs)
        return super().model_validate(obj, **kwargs)


class UserUpdate(BaseModel):
    """Schema for updating user data."""
    razao_social: Optional[str] = None
    nome_fantasia: Optional[str] = None
    telefone: Optional[str] = None
    endereco: Optional[Address] = None


class UserPreferencesUpdate(BaseModel):
    """Schema for updating user preferences."""
    darkMode: Optional[bool] = None
    notifications: Optional[bool] = None


class Token(BaseModel):
    """Schema for authentication token."""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
