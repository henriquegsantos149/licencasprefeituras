"""
Company model for representing empresas (pessoa jurídica).
"""
from sqlalchemy import Column, String, DateTime, ForeignKey, JSON, Table
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

# Tabela intermediária para relacionamento N:N entre Company e Activity
company_activities = Table(
    'company_activities',
    Base.metadata,
    Column('company_id', String, ForeignKey('companies.id', ondelete='CASCADE'), primary_key=True),
    Column('activity_id', String, ForeignKey('activities.id', ondelete='CASCADE'), primary_key=True)
)


class Company(Base):
    """Company model representing empresas (pessoa jurídica)."""
    
    __tablename__ = "companies"
    
    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id", ondelete='CASCADE'), nullable=False, index=True)
    
    # Company data
    razao_social = Column(String, nullable=False, index=True)
    nome_fantasia = Column(String, nullable=True)
    cnpj = Column(String(14), unique=True, nullable=False, index=True)
    inscricao_estadual = Column(String, nullable=True)
    
    # Contact info
    email = Column(String, nullable=True)
    telefone = Column(String, nullable=True)
    
    # Address fields stored as JSON
    endereco = Column(JSON, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="companies")
    activities = relationship("Activity", secondary=company_activities, back_populates="companies", lazy="dynamic")
    processes = relationship("Process", back_populates="company", lazy="dynamic")
    
    def __repr__(self):
        return f"<Company(id={self.id}, razao_social={self.razao_social}, cnpj={self.cnpj})>"
