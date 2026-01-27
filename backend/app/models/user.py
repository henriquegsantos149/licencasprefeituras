"""
User model for authentication and authorization.
"""
from sqlalchemy import Column, String, DateTime, ForeignKey, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base


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
    
    # Role - now using foreign key to roles table
    role_id = Column(String, ForeignKey("roles.id", ondelete='RESTRICT'), nullable=False, index=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    role_obj = relationship("Role", back_populates="users", lazy="joined")
    companies = relationship("Company", back_populates="user", cascade="all, delete-orphan", lazy="dynamic")
    preferences = relationship("UserPreferences", back_populates="user", uselist=False, cascade="all, delete-orphan")
    
    @property
    def role(self):
        """Backward compatibility: return role_id as role."""
        return self.role_id
    
    def __repr__(self):
        return f"<User(id={self.id}, email={self.email}, role={self.role_id})>"
