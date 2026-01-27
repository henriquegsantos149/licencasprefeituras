"""
User model for authentication and authorization.
"""
from sqlalchemy import Column, String, DateTime, Enum as SQLEnum, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from app.database import Base


class UserRole(str, enum.Enum):
    """User roles in the system."""
    EMPREENDEDOR = "empreendedor"
    GESTOR = "gestor"
    ADMIN = "admin"


class User(Base):
    """User model representing empreendedores and gestores."""
    
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, index=True)
    razao_social = Column(String, nullable=False, index=True)
    nome_fantasia = Column(String, nullable=True)
    cnpj = Column(String(14), unique=True, nullable=False, index=True)
    inscricao_estadual = Column(String, nullable=True)
    email = Column(String, unique=True, nullable=False, index=True)
    telefone = Column(String, nullable=True)
    password_hash = Column(String, nullable=False)
    
    # Address fields stored as JSON
    endereco = Column(JSON, nullable=True)
    
    # User preferences stored as JSON (darkMode, notifications, etc.)
    preferences = Column(JSON, nullable=True, default=lambda: {"darkMode": False, "notifications": True})
    
    # Role and permissions
    role = Column(SQLEnum(UserRole), default=UserRole.EMPREENDEDOR, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    processes = relationship("Process", back_populates="applicant_user", lazy="dynamic")
    
    def __repr__(self):
        return f"<User(id={self.id}, email={self.email}, role={self.role.value})>"
