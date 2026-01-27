"""
Role and Permission models for database-driven access control.
"""
from sqlalchemy import Column, String, DateTime, Table, ForeignKey, Text, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

# Tabela intermediária para relacionamento N:N entre Role e Permission
role_permissions = Table(
    'role_permissions',
    Base.metadata,
    Column('role_id', String, ForeignKey('roles.id', ondelete='CASCADE'), primary_key=True),
    Column('permission_id', String, ForeignKey('permissions.id', ondelete='CASCADE'), primary_key=True)
)


class Role(Base):
    """Role model representing user roles in the system."""
    
    __tablename__ = "roles"
    
    id = Column(String, primary_key=True, index=True)  # Role ID - stored in database (no hardcoded values)
    name = Column(String, unique=True, nullable=False, index=True)  # Display name
    description = Column(Text, nullable=True)
    is_default = Column(Boolean, default=False, nullable=False)  # Default role for new users
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    permissions = relationship("Permission", secondary=role_permissions, back_populates="roles", lazy="dynamic")
    users = relationship("User", back_populates="role_obj", lazy="dynamic")
    
    def __repr__(self):
        return f"<Role(id={self.id}, name={self.name})>"


class Permission(Base):
    """Permission model representing system permissions."""
    
    __tablename__ = "permissions"
    
    id = Column(String, primary_key=True, index=True)  # e.g., 'view_own_processes'
    name = Column(String, unique=True, nullable=False, index=True)  # Display name
    description = Column(Text, nullable=True)
    category = Column(String, nullable=True)  # Permission category - stored in database
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    roles = relationship("Role", secondary=role_permissions, back_populates="permissions", lazy="dynamic")
    
    def __repr__(self):
        return f"<Permission(id={self.id}, name={self.name})>"
