"""
Template core module.

This module provides core functionality for email template management including:
- Template CRUD operations
- Template loading and caching
- Template metadata management
"""

from .template_manager import (
    TEMPLATE_MAPPINGS,
    get_email_templates,
    get_template_by_id,
    create_email_template,
    update_email_template
)

from .template_loader import (
    load_template_content,
    clear_template_cache,
    clear_metadata_cache,
    clear_all_caches,
    get_template_metadata
)

__all__ = [
    'TEMPLATE_MAPPINGS',
    'get_email_templates',
    'get_template_by_id',
    'create_email_template',
    'update_email_template',
    'load_template_content',
    'clear_template_cache',
    'clear_metadata_cache',
    'clear_all_caches',
    'get_template_metadata'
]
