"""Email Service Package"""

from .core.email_sender import EmailSender
from .status.status_updater import update_email_status
from .core.attachment_manager import get_archive_path, format_size

__all__ = [
    'EmailSender',
    'update_email_status',
    'get_archive_path',
    'format_size'
]
