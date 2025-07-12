"""
Email Template Service Module.

This module provides a comprehensive email template management system including:
- Template CRUD operations
- Template loading and caching
- Template validation
- Template metadata management

The module is organized into:
- core: Core template management functionality
- validation: Template validation utilities
"""

# Core template management
from .core import (
    TEMPLATE_MAPPINGS,
    get_email_templates,
    get_template_by_id,
    create_email_template,
    update_email_template,
    load_template_content,
    clear_template_cache,
    clear_metadata_cache,
    clear_all_caches,
    get_template_metadata
)

# Template validation
from .validation import (
    TemplateValidator,
    TemplateValidationError,
    validate_template
)

# Public API - these are the functions that external modules should use
__all__ = [
    # Core template functions
    'TEMPLATE_MAPPINGS',
    'get_email_templates',
    'get_template_by_id',
    'create_email_template',
    'update_email_template',
    'load_template_content',
    
    # Cache management
    'clear_template_cache',
    'clear_metadata_cache',
    'clear_all_caches',
    'get_template_metadata',
    
    # Template validation
    'TemplateValidator',
    'TemplateValidationError',
    'validate_template'
]
