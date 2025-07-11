"""Template manager for loading and processing email templates"""

import os
import logging

from ....core.config import get_settings

logger = logging.getLogger(__name__)


def _load_default_template() -> str:
    """Load the default email template from file"""
    try:
        settings = get_settings()
        template_path = settings.DEFAULT_EMAIL_TEMPLATE_PATH
        
        if not template_path:
            logger.warning("DEFAULT_EMAIL_TEMPLATE_PATH not configured")
            return ""
        
        # Convert relative path to absolute path if needed
        if not os.path.isabs(template_path):
            # Use current working directory as base for relative paths
            template_path = os.path.join(os.getcwd(), template_path)
        
        # Normalize the path to handle any path separators correctly
        template_path = os.path.normpath(template_path)
        
        # Check if the file exists
        if not os.path.isfile(template_path):
            logger.warning(f"Default template file not found at {template_path}")
            return ""
        
        with open(template_path, "r", encoding="utf-8") as file:
            template_content = file.read()
        
        logger.info(f"Loaded default template from {template_path}")
        return template_content
    
    except Exception as e:
        logger.error(f"Error loading default template: {str(e)}")
        return ""
