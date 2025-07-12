from fastapi import APIRouter, HTTPException, Query, Depends
from typing import List, Optional
from datetime import datetime

from ...models.email import EmailRecord, EmailStatus
from ...services.database.repositories.email_repository import (
    get_email_records,
    get_email_record_by_id, 
    update_email_status,
    get_email_status_summary
)
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/records")
async def read_email_records(
    status: Optional[str] = None,
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0)
):
    """
    Retrieve a list of email records with optional status filtering.
    Returns both the records and total count for pagination.
    """
    try:
        records, total_count = get_email_records(status, limit, offset)
        return {
            "success": True,
            "data": {
                "rows": records,
                "total": total_count
            }
        }
    except Exception as e:
        logger.error(f"Error retrieving email records: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve email records")


@router.get("/records/{email_id}", response_model=EmailRecord)
async def read_email_record(email_id: int):
    """
    Retrieve a specific email record by ID.
    """
    record = get_email_record_by_id(email_id)
    if not record:
        raise HTTPException(status_code=404, detail=f"Email record {email_id} not found")
    return record


@router.put("/records/{email_id}/status")
async def update_record_status(
    email_id: int, 
    status: EmailStatus,
    reason: Optional[str] = None
):
    """
    Update the status of an email record.
    """
    try:
        record = get_email_record_by_id(email_id)
        if not record:
            raise HTTPException(status_code=404, detail=f"Email record {email_id} not found")
        
        success = update_email_status(email_id, status.value, reason)
        if not success:
            raise HTTPException(status_code=500, detail="Failed to update email status")
        
        return {"success": True, "message": f"Email status updated to {status.value}"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating email status: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update email status")


@router.get("/status-summary")
async def get_status_summary():
    """
    Get a summary of email statuses.
    """
    try:
        summary = get_email_status_summary()
        return {
            "pending": summary.get("Pending", 0),
            "success": summary.get("Success", 0),
            "failed": summary.get("Failed", 0),
            "total": sum(summary.values()),
            "last_updated": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Error getting email status summary: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get email status summary")
