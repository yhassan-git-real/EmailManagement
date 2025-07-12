"""
Email Records Router - API endpoints for managing email records
"""
from fastapi import APIRouter, Depends, HTTPException, Query, Path
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr
import pyodbc
import logging
from ..core.database import get_db_connection
from ..models.email_record import EmailRecord, EmailRecordUpdate, EmailRecordStatusUpdate
from ..services.database.repositories.email_record_repository import (
    get_email_records_paginated,
    get_email_record_by_id,
    update_email_record,
    update_email_record_status,
    delete_email_record
)

# Configure logger
logger = logging.getLogger(__name__)

# Create router
router = APIRouter(
    prefix="/email/records",
    tags=["email-records"],
    responses={404: {"description": "Record not found"}},
)


@router.get("/", response_model=Dict[str, Any])
async def get_records(
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0),
    search: Optional[str] = None,
    status: Optional[str] = None,
    connection=Depends(get_db_connection)
):
    """
    Get paginated email records with optional filtering
    """
    try:
        records, total = get_email_records_paginated(connection, limit, offset, search, status)
        return {
            "success": True,
            "data": {
                "rows": records,
                "total": total
            }
        }
    except Exception as e:
        logger.error(f"Error fetching email records: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    finally:
        if connection:
            connection.close()


@router.get("/{record_id}", response_model=Dict[str, Any])
async def get_record(
    record_id: int = Path(..., title="The ID of the email record to retrieve"),
    connection=Depends(get_db_connection)
):
    """
    Get a specific email record by ID
    """
    try:
        record = get_email_record_by_id(connection, record_id)
        if not record:
            raise HTTPException(status_code=404, detail=f"Email record with ID {record_id} not found")
        
        return {
            "success": True,
            "data": record
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching email record {record_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    finally:
        if connection:
            connection.close()


@router.put("/{record_id}", response_model=Dict[str, Any])
async def update_record(
    record_data: EmailRecordUpdate,
    record_id: int = Path(..., title="The ID of the email record to update"),
    connection=Depends(get_db_connection)
):
    """
    Update an email record
    """
    try:
        # Check if record exists
        existing_record = get_email_record_by_id(connection, record_id)
        if not existing_record:
            raise HTTPException(status_code=404, detail=f"Email record with ID {record_id} not found")
        
        # Update the record
        success = update_email_record(connection, record_id, record_data)
        if not success:
            raise HTTPException(status_code=500, detail="Failed to update record")
        
        return {
            "success": True,
            "message": f"Email record {record_id} updated successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating email record {record_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    finally:
        if connection:
            connection.close()


@router.patch("/{record_id}/status", response_model=Dict[str, Any])
async def update_record_status(
    status_data: EmailRecordStatusUpdate,
    record_id: int = Path(..., title="The ID of the email record to update status"),
    connection=Depends(get_db_connection)
):
    """
    Update the status of an email record
    """
    try:
        # Check if record exists
        existing_record = get_email_record_by_id(connection, record_id)
        if not existing_record:
            raise HTTPException(status_code=404, detail=f"Email record with ID {record_id} not found")
        
        # Update the record status
        success = update_email_record_status(connection, record_id, status_data.status)
        if not success:
            raise HTTPException(status_code=500, detail="Failed to update record status")
        
        return {
            "success": True,
            "message": f"Email record {record_id} status updated to {status_data.status}"
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating email record status {record_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    finally:
        if connection:
            connection.close()


@router.delete("/{record_id}", response_model=Dict[str, Any])
async def delete_record(
    record_id: int = Path(..., title="The ID of the email record to delete"),
    connection=Depends(get_db_connection)
):
    """
    Delete an email record
    """
    try:
        # Check if record exists
        existing_record = get_email_record_by_id(connection, record_id)
        if not existing_record:
            raise HTTPException(status_code=404, detail=f"Email record with ID {record_id} not found")
        
        # Delete the record
        success = delete_email_record(connection, record_id)
        if not success:
            raise HTTPException(status_code=500, detail="Failed to delete record")
        
        return {
            "success": True,
            "message": f"Email record {record_id} deleted successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting email record {record_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    finally:
        if connection:
            connection.close()

# Create record endpoint removed
