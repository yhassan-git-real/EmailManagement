"""Email Automation Service Package"""
from .core.automation_manager import (
    start_automation,
    stop_automation,
    restart_failed_emails,
    get_automation_status
)

from .core.settings_manager import (
    get_automation_settings,
    update_automation_settings
)

from .scheduling.scheduler import (
    start_scheduler,
    stop_scheduler,
    update_schedule_settings,
    get_schedule_settings
)

from .database.status_repository import (
    update_email_status
)

from .validation.mapping_validator import (
    _validate_recipient_mapping
)

__all__ = [
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
    'update_email_status',
    '_validate_recipient_mapping'
]
