"""Email Sender Service - Backward compatibility module"""

from .email_sender import EmailSender
from ..status.status_updater import update_email_status
from .attachment_manager import get_archive_path, format_size

# Backward compatibility constants
GMAIL_MAX_SIZE = 25 * 1024 * 1024  # 25MB
SAFE_MAX_SIZE = 20 * 1024 * 1024   # 20MB (conservative limit)
