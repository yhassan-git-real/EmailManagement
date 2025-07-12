import logging
import os
import re
from typing import Dict, List, Optional, Tuple, Any
from pathlib import Path

logger = logging.getLogger(__name__)


class TemplateValidationError(Exception):
    """Exception raised for template validation errors."""
    pass


class TemplateValidator:
    """Template validation utility class."""
    
    # Common template placeholders
    COMMON_PLACEHOLDERS = {
        "{recipient_name}": "Recipient's name",
        "{sender_name}": "Sender's name",
        "{subject}": "Email subject",
        "{date}": "Current date",
        "{time}": "Current time",
        "{company_name}": "Company name",
        "{contact_email}": "Contact email",
        "{contact_phone}": "Contact phone",
        "{amount}": "Amount",
        "{invoice_number}": "Invoice number",
        "{due_date}": "Due date",
        "{payment_link}": "Payment link",
        "{unsubscribe_link}": "Unsubscribe link"
    }
    
    @staticmethod
    def validate_template_syntax(template_content: str) -> Tuple[bool, List[str]]:
        """
        Validate template syntax and check for common issues.
        
        Args:
            template_content: Template content to validate
            
        Returns:
            Tuple of (is_valid, list_of_errors)
        """
        errors = []
        
        if not template_content or not template_content.strip():
            errors.append("Template content cannot be empty")
            return False, errors
        
        # Check for unmatched braces
        open_braces = template_content.count('{')
        close_braces = template_content.count('}')
        
        if open_braces != close_braces:
            errors.append(f"Unmatched braces: {open_braces} opening, {close_braces} closing")
        
        # Check for malformed placeholders
        placeholder_pattern = r'\{[^}]*\}'
        placeholders = re.findall(placeholder_pattern, template_content)
        
        for placeholder in placeholders:
            if not placeholder.strip('{}'):
                errors.append(f"Empty placeholder found: {placeholder}")
            elif ' ' in placeholder.strip('{}'):
                errors.append(f"Placeholder contains spaces: {placeholder}")
        
        # Check for potentially dangerous content
        dangerous_patterns = [
            r'<script[^>]*>.*?</script>',
            r'javascript:',
            r'on\w+\s*=',
            r'<iframe[^>]*>',
            r'<object[^>]*>',
            r'<embed[^>]*>'
        ]
        
        for pattern in dangerous_patterns:
            if re.search(pattern, template_content, re.IGNORECASE | re.DOTALL):
                errors.append(f"Potentially dangerous content detected: {pattern}")
        
        return len(errors) == 0, errors
    
    @staticmethod
    def validate_placeholders(template_content: str, required_placeholders: Optional[List[str]] = None) -> Tuple[bool, List[str]]:
        """
        Validate template placeholders.
        
        Args:
            template_content: Template content to validate
            required_placeholders: List of required placeholders
            
        Returns:
            Tuple of (is_valid, list_of_errors)
        """
        errors = []
        
        # Find all placeholders in the template
        placeholder_pattern = r'\{([^}]+)\}'
        found_placeholders = set(re.findall(placeholder_pattern, template_content))
        
        # Check for required placeholders
        if required_placeholders:
            missing_placeholders = []
            for req_placeholder in required_placeholders:
                placeholder_name = req_placeholder.strip('{}')
                if placeholder_name not in found_placeholders:
                    missing_placeholders.append(req_placeholder)
            
            if missing_placeholders:
                errors.append(f"Missing required placeholders: {', '.join(missing_placeholders)}")
        
        # Check for unknown placeholders (optional warning)
        unknown_placeholders = []
        for placeholder in found_placeholders:
            full_placeholder = f"{{{placeholder}}}"
            if full_placeholder not in TemplateValidator.COMMON_PLACEHOLDERS:
                unknown_placeholders.append(full_placeholder)
        
        if unknown_placeholders:
            logger.warning(f"Unknown placeholders found: {', '.join(unknown_placeholders)}")
        
        return len(errors) == 0, errors
    
    @staticmethod
    def validate_file_access(file_path: str) -> Tuple[bool, List[str]]:
        """
        Validate template file exists and is readable.
        
        Args:
            file_path: Path to template file
            
        Returns:
            Tuple of (is_valid, list_of_errors)
        """
        errors = []
        
        if not file_path:
            errors.append("File path cannot be empty")
            return False, errors
        
        path = Path(file_path)
        
        # Check if file exists
        if not path.exists():
            errors.append(f"Template file does not exist: {file_path}")
            return False, errors
        
        # Check if it's a file (not a directory)
        if not path.is_file():
            errors.append(f"Path is not a file: {file_path}")
            return False, errors
        
        # Check if file is readable
        if not os.access(file_path, os.R_OK):
            errors.append(f"Template file is not readable: {file_path}")
            return False, errors
        
        # Check file size (reasonable limit)
        try:
            file_size = path.stat().st_size
            max_size = 1024 * 1024  # 1MB
            if file_size > max_size:
                errors.append(f"Template file too large: {file_size} bytes (max: {max_size})")
        except OSError as e:
            errors.append(f"Error accessing file stats: {str(e)}")
        
        return len(errors) == 0, errors
    
    @staticmethod
    def validate_template_content_from_file(file_path: str, required_placeholders: Optional[List[str]] = None) -> Tuple[bool, List[str]]:
        """
        Validate template content from a file.
        
        Args:
            file_path: Path to template file
            required_placeholders: List of required placeholders
            
        Returns:
            Tuple of (is_valid, list_of_errors)
        """
        all_errors = []
        
        # First validate file access
        file_valid, file_errors = TemplateValidator.validate_file_access(file_path)
        if not file_valid:
            return False, file_errors
        
        # Read and validate content
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                content = file.read()
        except Exception as e:
            return False, [f"Error reading template file: {str(e)}"]
        
        # Validate syntax
        syntax_valid, syntax_errors = TemplateValidator.validate_template_syntax(content)
        if not syntax_valid:
            all_errors.extend(syntax_errors)
        
        # Validate placeholders
        placeholder_valid, placeholder_errors = TemplateValidator.validate_placeholders(content, required_placeholders)
        if not placeholder_valid:
            all_errors.extend(placeholder_errors)
        
        return len(all_errors) == 0, all_errors
    
    @staticmethod
    def get_template_info(template_content: str) -> Dict[str, Any]:
        """
        Get information about a template.
        
        Args:
            template_content: Template content
            
        Returns:
            Dictionary with template information
        """
        # Find all placeholders
        placeholder_pattern = r'\{([^}]+)\}'
        placeholders = list(set(re.findall(placeholder_pattern, template_content)))
        
        # Count characters and lines
        char_count = len(template_content)
        line_count = len(template_content.splitlines())
        
        # Check for HTML content
        html_tags = re.findall(r'<[^>]+>', template_content)
        is_html = len(html_tags) > 0
        
        return {
            "placeholders": placeholders,
            "placeholder_count": len(placeholders),
            "character_count": char_count,
            "line_count": line_count,
            "is_html": is_html,
            "html_tag_count": len(html_tags),
            "estimated_render_time": char_count / 10000.0  # Rough estimate
        }


def validate_template(template_id: str, template_content: Optional[str] = None, 
                     file_path: Optional[str] = None, 
                     required_placeholders: Optional[List[str]] = None) -> Dict[str, Any]:
    """
    Comprehensive template validation function.
    
    Args:
        template_id: Template identifier
        template_content: Template content (if validating content directly)
        file_path: Template file path (if validating from file)
        required_placeholders: List of required placeholders
        
    Returns:
        Dictionary with validation results
    """
    validator = TemplateValidator()
    
    if template_content:
        # Validate content directly
        syntax_valid, syntax_errors = validator.validate_template_syntax(template_content)
        placeholder_valid, placeholder_errors = validator.validate_placeholders(template_content, required_placeholders)
        
        all_errors = syntax_errors + placeholder_errors
        is_valid = len(all_errors) == 0
        
        info = validator.get_template_info(template_content)
        
    elif file_path:
        # Validate from file
        is_valid, all_errors = validator.validate_template_content_from_file(file_path, required_placeholders)
        
        if is_valid:
            try:
                with open(file_path, 'r', encoding='utf-8') as file:
                    content = file.read()
                info = validator.get_template_info(content)
            except Exception as e:
                is_valid = False
                all_errors.append(f"Error reading file for info: {str(e)}")
                info = {}
        else:
            info = {}
    else:
        return {
            "template_id": template_id,
            "is_valid": False,
            "errors": ["Either template_content or file_path must be provided"],
            "info": {}
        }
    
    return {
        "template_id": template_id,
        "is_valid": is_valid,
        "errors": all_errors,
        "info": info
    }
