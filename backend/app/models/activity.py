"""
Activity model for licenciamento activities/tipologias.
"""
from sqlalchemy import Column, String, JSON, Integer, Boolean
from sqlalchemy.orm import relationship
from app.database import Base


class Activity(Base):
    """Activity model representing different types of licenciamento activities."""
    
    __tablename__ = "activities"
    
    id = Column(String, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False, index=True)
    # High-level grouping used in the original hardcoded catalog
    # (Agropecuária, Indústrias, Comércio e Serviços, Obras Civis)
    group = Column("group_name", String, nullable=True)
    category = Column(String, nullable=True)
    risk_level = Column(String, nullable=True)  # Baixo, Médio, Alto, Médio/Alto
    sort_order = Column(Integer, nullable=True, index=True)
    is_active = Column(Boolean, nullable=False, default=True)
    
    # Documents required for this activity (stored as JSON)
    required_documents = Column(JSON, nullable=True)
    
    # Questions specific to this activity (stored as JSON)
    questions = Column(JSON, nullable=True)
    
    # Relationships
    processes = relationship("Process", back_populates="activity", lazy="dynamic")
    companies = relationship("Company", secondary="company_activities", back_populates="activities", lazy="dynamic")
    
    def __repr__(self):
        return f"<Activity(id={self.id}, name={self.name})>"
