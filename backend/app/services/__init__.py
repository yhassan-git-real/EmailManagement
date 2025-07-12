"""
Services module for business logic implementations.

This module provides access to all refactored service layers:
- database: Database operations and repositories
- email: Email handling and sending
- storage: File and cloud storage operations
- templates: Email template management
- automation: Email automation and scheduling
"""

# Import key services for backward compatibility
from . import database
from . import email
from . import storage
from . import templates
from . import automation

# Import backward compatibility modules
from .automation.core.backward_compatibility import *
from .email.core.backward_compatibility import *

# Make key functions available at the module level
from .database import (
    get_email_records,
    get_email_record_by_id,
    get_email_status_summary
)

# This comes from multiple modules, using email.status.status_updater version as primary
from .email import update_email_status

from .templates import (
    get_email_templates,
    get_template_by_id,
    create_email_template,
    update_email_template
)

__all__ = [
    'database',
    'email', 
    'storage',
    'templates',
    'automation',
    'get_email_records',
    'get_email_record_by_id',
    'update_email_status',
    'get_email_status_summary',
    'get_email_templates',
    'get_template_by_id',
    'create_email_template',
    'update_email_template',
    # From automation backward compatibility
    'start_automation',
    'stop_automation',
    'restart_failed_emails',
    'get_automation_status',
    'get_automation_settings',
    'update_automation_settings',
    'start_scheduler',
    'stop_scheduler',
    'update_schedule_settings',
    'get_schedule_settings',
    '_validate_recipient_mapping',
    # From email backward compatibility
    'EmailSender',
    'get_archive_path',
    'format_size',
    'GMAIL_MAX_SIZE',
    'SAFE_MAX_SIZE'
]
