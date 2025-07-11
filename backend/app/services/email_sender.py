"""Email Sender Service - Backward compatibility module"""

from .email import EmailSender, update_email_status, get_archive_path, format_size

GMAIL_MAX_SIZE = 25 * 1024 * 1024
SAFE_MAX_SIZE = 20 * 1024 * 1024
