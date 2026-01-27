"""
Process models for licenciamento processes.
"""
from sqlalchemy import Column, String, DateTime, Date, ForeignKey, Enum as SQLEnum, JSON, Text, Integer, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from app.database import Base


class ProcessStatus(str, enum.Enum):
    """Status of a licenciamento process."""
    ABERTO = "Aberto"
    EM_ANALISE = "Em Análise"
    PENDENCIA = "Pendência"
    VISTORIA = "Vistoria"
    EMITIDO = "Emitido"
    INDEFERIDO = "Indeferido"


class Process(Base):
    """Process model representing a licenciamento process."""
    
    __tablename__ = "processes"
    
    id = Column(String, primary_key=True, index=True)
    applicant_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    activity_id = Column(String, ForeignKey("activities.id"), nullable=False, index=True)
    
    # Applicant info (denormalized for quick access)
    applicant_name = Column(String, nullable=False)
    
    # Status and workflow
    status = Column(SQLEnum(ProcessStatus), default=ProcessStatus.ABERTO, nullable=False, index=True)
    
    # Deadlines
    deadline_agency = Column(Date, nullable=True)
    deadline_applicant = Column(Date, nullable=True)
    
    # Process data (answers to activity-specific questions)
    process_data = Column(JSON, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    applicant_user = relationship("User", back_populates="processes")
    activity = relationship("Activity", back_populates="processes")
    documents = relationship("ProcessDocument", back_populates="process", cascade="all, delete-orphan")
    history = relationship("ProcessHistory", back_populates="process", cascade="all, delete-orphan", order_by="ProcessHistory.created_at")
    
    def __repr__(self):
        return f"<Process(id={self.id}, status={self.status.value}, applicant={self.applicant_name})>"


class ProcessDocument(Base):
    """Document model for process documents."""
    
    __tablename__ = "process_documents"
    
    id = Column(String, primary_key=True, index=True)
    process_id = Column(String, ForeignKey("processes.id"), nullable=False, index=True)
    
    document_type = Column(String, nullable=False)  # e.g., 'pgrs', 'sasc', 'anp'
    document_name = Column(String, nullable=False)
    file_path = Column(String, nullable=True)  # Path to stored file
    file_size = Column(Integer, nullable=True)  # File size in bytes
    mime_type = Column(String, nullable=True)
    
    is_required = Column(Boolean, default=True, nullable=False)
    is_uploaded = Column(Boolean, default=False, nullable=False)
    
    # Timestamps
    uploaded_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    process = relationship("Process", back_populates="documents")
    
    def __repr__(self):
        return f"<ProcessDocument(id={self.id}, type={self.document_type}, uploaded={self.is_uploaded})>"


class ProcessHistory(Base):
    """History model for tracking process changes."""
    
    __tablename__ = "process_history"
    
    id = Column(String, primary_key=True, index=True)
    process_id = Column(String, ForeignKey("processes.id"), nullable=False, index=True)
    
    action = Column(String, nullable=False)  # e.g., 'Protocolo Aberto', 'Mudança para Em Análise'
    user = Column(String, nullable=False)  # User who performed the action
    observation = Column(Text, nullable=True)
    
    # Additional data stored as JSON
    extra_data = Column(JSON, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    
    # Relationships
    process = relationship("Process", back_populates="history")
    
    def __repr__(self):
        return f"<ProcessHistory(id={self.id}, action={self.action}, date={self.created_at})>"
