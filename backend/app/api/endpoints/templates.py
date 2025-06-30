from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any, Optional
import logging
import os
from ...services.template_service import get_email_templates, get_template_by_id

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("")
async def get_templates(
    is_active: bool = True, 
    category: Optional[str] = None,
    limit: int = 100, 
    offset: int = 0
):
    """
    Get a list of available email templates.
    """
    try:
        templates = get_email_templates(is_active, category, limit, offset)
        return {"success": True, "templates": templates}
    except Exception as e:
        logger.error(f"Error retrieving templates: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve templates: {str(e)}")

@router.get("/{template_id}")
async def get_template(template_id: str):
    """
    Get a specific template by ID.
    """
    try:
        template = get_template_by_id(template_id)
        if not template:
            raise HTTPException(status_code=404, detail=f"Template '{template_id}' not found")
        return {"success": True, "template": template}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving template {template_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve template: {str(e)}")
