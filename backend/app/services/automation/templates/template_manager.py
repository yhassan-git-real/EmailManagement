"""Template manager for loading and processing email templates"""

import os
import logging

logger = logging.getLogger(__name__)


def _load_default_template() -> str:
    """Load the default email template from file"""
    template_path = os.getenv("DEFAULT_EMAIL_TEMPLATE_PATH", "./templates/default_template.txt")
    try:
        # Convert relative path to absolute path if needed
        if not os.path.isabs(template_path):
            base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
            template_path = os.path.join(base_dir, template_path)
        
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
