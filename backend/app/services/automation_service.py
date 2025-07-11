"""Email Automation Service - Backward compatibility module"""
from .automation import (
    start_automation,
    stop_automation,
    restart_failed_emails,
    get_automation_status,
    get_automation_settings,
    update_automation_settings,
    start_scheduler,
    stop_scheduler,
    update_schedule_settings,
    get_schedule_settings,
    update_email_status,
    _validate_recipient_mapping
)

# Keep backward compatibility constants
GMAIL_MAX_SIZE = 25 * 1024 * 1024  # 25MB
SAFE_MAX_SIZE = 20 * 1024 * 1024   # 20MB (conservative limit to account for email headers)
