import logging
import os
from typing import List, Dict, Any, Optional
from datetime import datetime
from pathlib import Path

from ..core.config import get_settings

logger = logging.getLogger(__name__)

# Predefined templates with their file locations
TEMPLATE_MAPPINGS = {
    "default": "default_template.txt",
    "followup": "followup_template.txt",
    "escalation": "escalation_template.txt",
    "reminder": "reminder_template.txt",
    "custom": "custom_template.txt"
}


def get_email_templates(
    is_active: bool = True, 
    category: Optional[str] = None,
    limit: int = 100, 
    offset: int = 0
) -> List[Dict[str, Any]]:
    """
    Get a list of available templates from the templates directory.
    
    Returns:
        List of template dictionaries with id, name, and file path
    """
    templates = []
    settings = get_settings()
    template_dir = os.path.dirname(settings.DEFAULT_EMAIL_TEMPLATE_PATH)
    
    # Add predefined templates
    for template_id, filename in TEMPLATE_MAPPINGS.items():
        file_path = os.path.join(template_dir, filename)
        template_exists = os.path.exists(file_path)
        
        # Create template info
        template = {
            "id": template_id,
            "name": _get_template_name(template_id),
            "subject": _get_template_subject(template_id),
            "body": _get_template_preview(file_path) if template_exists else "Template file not found",
            "file_path": file_path,
            "exists": template_exists,
            "created_date": datetime.fromtimestamp(os.path.getctime(file_path)).isoformat() if template_exists else None,
            "modified_date": datetime.fromtimestamp(os.path.getmtime(file_path)).isoformat() if template_exists else None
        }
        
        templates.append(template)
    
    # Apply filtering if needed
    filtered_templates = templates
    if category:
        filtered_templates = [t for t in templates if category.lower() in t['name'].lower()]
    
    # Apply pagination
    start_idx = min(offset, len(filtered_templates))
    end_idx = min(start_idx + limit, len(filtered_templates))
    
    return filtered_templates[start_idx:end_idx]


def get_template_by_id(template_id: str) -> Optional[Dict[str, Any]]:
    """
    Get a template by its ID.
    
    Args:
        template_id: ID of the template
        
    Returns:
        Template dictionary or None if not found
    """
    settings = get_settings()
    template_dir = os.path.dirname(settings.DEFAULT_EMAIL_TEMPLATE_PATH)
    
    # If template_id is not in our predefined mappings, try to use default
    if template_id not in TEMPLATE_MAPPINGS:
        logger.warning(f"Template ID '{template_id}' not found in mappings, using default")
        template_id = "default"
    
    # Get the appropriate template file
    filename = TEMPLATE_MAPPINGS[template_id]
    file_path = os.path.join(template_dir, filename)
    
    # Check if the file exists
    if not os.path.exists(file_path):
        # If the requested template doesn't exist, fall back to default
        if template_id != "default":
            logger.warning(f"Template {template_id} not found, falling back to default")
            return get_template_by_id("default")
        else:
            logger.error(f"Default template not found at {file_path}")
            return None
    
    # Read the template content
    try:
        with open(file_path, "r", encoding="utf-8") as file:
            body_template = file.read()
            
        return {
            "id": template_id,
            "name": _get_template_name(template_id),
            "subject": _get_template_subject(template_id),
            "body_template": body_template,
            "file_path": file_path,
            "created_date": datetime.fromtimestamp(os.path.getctime(file_path)).isoformat(),
            "modified_date": datetime.fromtimestamp(os.path.getmtime(file_path)).isoformat()
        }
    except Exception as e:
        logger.error(f"Error reading template file: {str(e)}")
        return None


def create_email_template(template_data: Dict[str, Any]) -> str:
    """
    Create a new custom email template.
    
    Args:
        template_data: Dictionary with template data (name, body)
        
    Returns:
        ID of the new template
    """
    try:
        settings = get_settings()
        template_dir = os.path.dirname(settings.DEFAULT_EMAIL_TEMPLATE_PATH)
        template_id = "custom"
        file_path = os.path.join(template_dir, TEMPLATE_MAPPINGS[template_id])
        
        # Create directory if it doesn't exist
        os.makedirs(template_dir, exist_ok=True)
        
        # Write the template content
        with open(file_path, "w", encoding="utf-8") as file:
            file.write(template_data.get("body", ""))
        
        return template_id
    except Exception as e:
        logger.error(f"Error creating email template: {str(e)}")
        raise


def update_email_template(template_id: str, template_data: Dict[str, Any]) -> bool:
    """
    Update an existing template file.
    
    Args:
        template_id: ID of the template
        template_data: Dictionary with template data (body)
        
    Returns:
        True if update was successful
    """
    try:
        settings = get_settings()
        template_dir = os.path.dirname(settings.DEFAULT_EMAIL_TEMPLATE_PATH)
        
        if template_id not in TEMPLATE_MAPPINGS:
            logger.error(f"Invalid template ID: {template_id}")
            return False
        
        file_path = os.path.join(template_dir, TEMPLATE_MAPPINGS[template_id])
        
        # Create directory if it doesn't exist
        os.makedirs(template_dir, exist_ok=True)
        
        # Write the template content
        with open(file_path, "w", encoding="utf-8") as file:
            file.write(template_data.get("body", ""))
        
        return True
    except Exception as e:
        logger.error(f"Error updating email template {template_id}: {str(e)}")
        raise


def load_template_content(template_id: str) -> str:
    """
    Load template content from file.
    
    Args:
        template_id: ID of the template
    
    Returns:
        String content of the template or empty string if not found
    """
    template = get_template_by_id(template_id)
    
    if template and "body_template" in template:
        return template["body_template"]
    
    # If template not found, return empty string
    return ""


def _get_template_name(template_id: str) -> str:
    """
    Get a human-readable name for a template ID
    
    Args:
        template_id: Template ID
        
    Returns:
        Human-readable name
    """
    template_names = {
        "default": "Default Template",
        "followup": "Follow-up Template",
        "escalation": "Escalation Template",
        "reminder": "Payment Reminder Template",
        "custom": "Custom Template"
    }
    
    return template_names.get(template_id, f"Template {template_id}")


def _get_template_subject(template_id: str) -> str:
    """
    Get the subject prefix for a template ID
    
    Args:
        template_id: Template ID
        
    Returns:
        Subject prefix
    """
    subject_prefixes = {
        "default": "",
        "followup": "Follow-up: ",
        "escalation": "URGENT: ",
        "reminder": "Payment Reminder: ",
        "custom": "Custom: "
    }
    
    return subject_prefixes.get(template_id, "")


def _get_template_preview(file_path: str, max_length: int = 100) -> str:
    """
    Get a preview of the template content
    
    Args:
        file_path: Path to the template file
        max_length: Maximum length of the preview
        
    Returns:
        Template preview
    """
    try:
        if os.path.exists(file_path):
            with open(file_path, "r", encoding="utf-8") as file:
                content = file.read()
                
            if len(content) > max_length:
                return content[:max_length] + "..."
            return content
    except Exception as e:
        logger.error(f"Error reading template preview: {str(e)}")
        
    return "Error reading template"
