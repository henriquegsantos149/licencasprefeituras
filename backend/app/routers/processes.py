"""
Process management routes.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date, timedelta
import uuid
from app.database import get_db
from app.models.user import User
from app.models.process import Process, ProcessStatus, ProcessDocument, ProcessHistory
from app.models.activity import Activity
from app.schemas.process import (
    ProcessCreate,
    ProcessResponse,
    ProcessUpdate,
    ProcessDocumentResponse,
    ProcessHistoryResponse,
)
from app.auth import get_current_active_user

router = APIRouter(prefix="/processes", tags=["processes"])


def generate_process_id() -> str:
    """Generate a process ID in the format PROC-YYYY-NNN."""
    from datetime import datetime
    year = datetime.now().year
    # In a real scenario, you'd get the next number from the database
    # For now, using a simple UUID-based approach
    return f"PROC-{year}-{str(uuid.uuid4())[:8].upper()}"


@router.post("/", response_model=ProcessResponse, status_code=status.HTTP_201_CREATED)
async def create_process(
    process_data: ProcessCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new licenciamento process."""
    # Verify activity exists
    activity = db.query(Activity).filter(Activity.id == process_data.activity_id).first()
    if not activity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Activity not found"
        )
    
    # Create process
    process_id = generate_process_id()
    deadline_agency = date.today() + timedelta(days=30)  # Default 30 days
    
    new_process = Process(
        id=process_id,
        applicant_id=current_user.id,
        activity_id=process_data.activity_id,
        applicant_name=process_data.applicant_name or current_user.razao_social,
        status=ProcessStatus.ABERTO,
        deadline_agency=deadline_agency,
        process_data=process_data.process_data,
    )
    
    db.add(new_process)
    
    # Create initial history entry
    history_entry = ProcessHistory(
        id=str(uuid.uuid4()),
        process_id=process_id,
        action="Protocolo Gerado",
        user=current_user.razao_social,
    )
    db.add(history_entry)
    
    # Create document entries based on activity requirements
    if activity.required_documents:
        for doc in activity.required_documents:
            doc_entry = ProcessDocument(
                id=str(uuid.uuid4()),
                process_id=process_id,
                document_type=doc.get("id", ""),
                document_name=doc.get("label", ""),
                is_required=doc.get("required", True),
                is_uploaded=False,
            )
            db.add(doc_entry)
    
    db.commit()
    db.refresh(new_process)
    
    # Load relationships
    from sqlalchemy.orm import joinedload
    new_process = db.query(Process).options(joinedload(Process.activity)).filter(Process.id == process_id).first()
    
    # Create response with activity name
    process_dict = {
        **new_process.__dict__,
        "activity_name": new_process.activity.name if new_process.activity else activity.name
    }
    return ProcessResponse.model_validate(process_dict)


@router.get("/", response_model=List[ProcessResponse])
async def get_processes(
    skip: int = 0,
    limit: int = 100,
    status_filter: Optional[ProcessStatus] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get list of processes."""
    query = db.query(Process)
    
    # Filter by user role
    if current_user.role.value == "empreendedor":
        query = query.filter(Process.applicant_id == current_user.id)
    
    # Filter by status if provided
    if status_filter:
        query = query.filter(Process.status == status_filter)
    
    # Eager load relationships
    from sqlalchemy.orm import joinedload
    processes = query.options(joinedload(Process.activity)).order_by(Process.created_at.desc()).offset(skip).limit(limit).all()
    # Include activity name in response
    result = []
    for p in processes:
        process_dict = {
            **p.__dict__,
            "activity_name": p.activity.name if p.activity else None
        }
        result.append(ProcessResponse.model_validate(process_dict))
    return result


@router.get("/{process_id}", response_model=ProcessResponse)
async def get_process(
    process_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a specific process by ID."""
    from sqlalchemy.orm import joinedload
    process = db.query(Process).options(joinedload(Process.activity)).filter(Process.id == process_id).first()
    
    if not process:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Process not found"
        )
    
    # Check permissions
    if current_user.role.value == "empreendedor" and process.applicant_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this process"
        )
    
    # Include activity name in response
    process_dict = {
        **process.__dict__,
        "activity_name": process.activity.name if process.activity else None
    }
    return ProcessResponse.model_validate(process_dict)


@router.patch("/{process_id}", response_model=ProcessResponse)
async def update_process(
    process_id: str,
    process_update: ProcessUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update a process (status, deadlines, etc.)."""
    process = db.query(Process).filter(Process.id == process_id).first()
    
    if not process:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Process not found"
        )
    
    # Check permissions (only gestores/admins can update)
    if current_user.role.value == "empreendedor":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update processes"
        )
    
    # Update fields
    if process_update.status:
        old_status = process.status.value
        process.status = process_update.status
        
        # Add history entry for status change
        history_entry = ProcessHistory(
            id=str(uuid.uuid4()),
            process_id=process_id,
            action=f"Mudança para {process_update.status.value}",
            user=current_user.razao_social,
        )
        db.add(history_entry)
    
    if process_update.deadline_agency is not None:
        process.deadline_agency = process_update.deadline_agency
    
    if process_update.deadline_applicant is not None:
        process.deadline_applicant = process_update.deadline_applicant
    
    if process_update.process_data is not None:
        process.process_data = process_update.process_data
    
    db.commit()
    db.refresh(process)
    
    # Reload with relationships
    from sqlalchemy.orm import joinedload
    process = db.query(Process).options(joinedload(Process.activity)).filter(Process.id == process_id).first()
    
    # Include activity name in response
    process_dict = {
        **process.__dict__,
        "activity_name": process.activity.name if process.activity else None
    }
    return ProcessResponse.model_validate(process_dict)


@router.get("/{process_id}/history", response_model=List[ProcessHistoryResponse])
async def get_process_history(
    process_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get history for a specific process."""
    process = db.query(Process).filter(Process.id == process_id).first()
    
    if not process:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Process not found"
        )
    
    # Check permissions
    if current_user.role.value == "empreendedor" and process.applicant_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this process"
        )
    
    history = db.query(ProcessHistory).filter(
        ProcessHistory.process_id == process_id
    ).order_by(ProcessHistory.created_at.desc()).all()
    
    return [ProcessHistoryResponse.model_validate(h) for h in history]
