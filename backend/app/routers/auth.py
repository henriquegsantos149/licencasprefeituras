"""
Authentication routes (login, register).
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_
import uuid
from app.database import get_db
from app.models.user import User
from app.models.user_preferences import UserPreferences
from app.schemas.user import UserCreate, UserLogin, UserResponse, Token
from app.auth import (
    verify_password,
    get_password_hash,
    create_access_token,
    get_current_active_user,
)
from datetime import timedelta
from app.config import settings

router = APIRouter(prefix="/auth", tags=["authentication"])


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user."""
    # Check if user with email or CNPJ already exists
    existing_user = db.query(User).filter(
        or_(
            User.email == user_data.email.lower(),
            User.cnpj == user_data.cnpj
        )
    ).first()
    
    if existing_user:
        if existing_user.email == user_data.email.lower():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        if existing_user.cnpj == user_data.cnpj:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="CNPJ already registered"
            )
    
    # Validate password confirmation
    if user_data.password != user_data.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match"
        )
    
    # Create new user
    user_id = str(uuid.uuid4())
    hashed_password = get_password_hash(user_data.password)
    
    new_user = User(
        id=user_id,
        razao_social=user_data.razao_social,
        nome_fantasia=user_data.nome_fantasia or user_data.razao_social,
        cnpj=user_data.cnpj,
        inscricao_estadual=user_data.inscricao_estadual,
        email=user_data.email.lower(),
        telefone=user_data.telefone,
        password_hash=hashed_password,
        endereco=user_data.endereco.dict() if user_data.endereco else None,
        role=user_data.role,
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Create default preferences for new user
    user_prefs = UserPreferences(
        id=str(uuid.uuid4()),
        user_id=new_user.id,
        dark_mode=False,
        notifications=True
    )
    db.add(user_prefs)
    db.commit()
    db.refresh(new_user)
    
    # Reload with preferences
    new_user = db.query(User).options(joinedload(User.preferences)).filter(User.id == new_user.id).first()
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": new_user.id},
        expires_delta=access_token_expires
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(new_user)
    )


@router.post("/login", response_model=Token)
async def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """Login and get access token."""
    user = db.query(User).options(joinedload(User.preferences)).filter(User.email == credentials.email.lower()).first()
    
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create default preferences if user doesn't have any
    if user.preferences is None:
        user_prefs = UserPreferences(
            id=str(uuid.uuid4()),
            user_id=user.id,
            dark_mode=False,
            notifications=True
        )
        db.add(user_prefs)
        db.commit()
        db.refresh(user, ['preferences'])
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.id},
        expires_delta=access_token_expires
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get current user information."""
    # Reload with preferences
    user = db.query(User).options(joinedload(User.preferences)).filter(User.id == current_user.id).first()
    return UserResponse.model_validate(user)
