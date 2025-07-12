"""
Template loading and caching utilities.

This module provides efficient template loading with caching capabilities,
metadata management, and template content preprocessing.
"""

import logging
import os
from typing import Dict, Optional
from functools import lru_cache

logger = logging.getLogger(__name__)


@lru_cache(maxsize=32)
def load_template_content(template_id: str) -> str:
    """
    Load template content from file with caching.
    
    Args:
        template_id: ID of the template
    
    Returns:
        String content of the template or empty string if not found
    """
    from .template_manager import get_template_by_id
    
    template = get_template_by_id(template_id)
    
    if template and "body_template" in template:
        return template["body_template"]
    
    # If template not found, return empty string
    return ""


def clear_template_cache():
    """Clear the template content cache."""
    load_template_content.cache_clear()


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


@lru_cache(maxsize=16)
def get_template_metadata(template_id: str) -> Dict[str, str]:
    """
    Get cached template metadata (name, subject, etc.)
    
    Args:
        template_id: Template ID
        
    Returns:
        Dictionary with template metadata
    """
    return {
        "name": _get_template_name(template_id),
        "subject": _get_template_subject(template_id)
    }


def clear_metadata_cache():
    """Clear the template metadata cache."""
    get_template_metadata.cache_clear()


def clear_all_caches():
    """Clear all template caches."""
    clear_template_cache()
    clear_metadata_cache()
