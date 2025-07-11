"""Settings manager for automation settings and SMTP configuration"""

import os
import logging
from typing import Dict, Any

from ....core.config import get_settings
from .state_manager import get_automation_state

logger = logging.getLogger(__name__)


def _interval_to_seconds(interval: str) -> int:
    """Convert interval string to seconds"""
    if not interval:
        return 900
        
    value = int(''.join(filter(str.isdigit, interval)))
    unit = ''.join(filter(str.isalpha, interval.lower()))
    
    if unit.startswith('s'):
        return value
    elif unit.startswith('m'):
        return value * 60
    elif unit.startswith('h'):
        return value * 60 * 60
    else:
        return 900


def _get_smtp_settings() -> Dict[str, Any]:
    """Get SMTP settings from environment variables"""
    settings = get_settings()
    env_archive_path = settings.EMAIL_ARCHIVE_PATH
    if env_archive_path and not os.path.isabs(env_archive_path):
        archive_path = os.path.join(os.getcwd(), env_archive_path)
    else:
        archive_path = env_archive_path
    
    smtp_settings = {
        "smtp_server": settings.SMTP_SERVER,
        "port": int(settings.SMTP_PORT),
        "username": settings.EMAIL_USERNAME,
        "password": settings.EMAIL_PASSWORD,
        "use_tls": settings.SMTP_TLS.lower() == "true",
        "sender_email": settings.SENDER_EMAIL,
        "archive_path": archive_path
    }
    
    logger.info(f"SMTP Settings: Server={smtp_settings['smtp_server']}, Username={smtp_settings['username']}, "
                f"Password={'*' * (len(smtp_settings['password']) if smtp_settings['password'] else 0)}, "
                f"Port={smtp_settings['port']}, TLS={smtp_settings['use_tls']}")
    
    return smtp_settings


def get_automation_settings() -> Dict[str, Any]:
    """Get current automation settings"""
    automation_state = get_automation_state()
    return {
        **automation_state["settings"],
        **_get_smtp_settings()
    }


def update_automation_settings(settings: Dict[str, Any]) -> Dict[str, Any]:
    """Update automation settings"""
    automation_state = get_automation_state()
    
    for key, value in settings.items():
        if key in automation_state["settings"]:
            automation_state["settings"][key] = value
    
    return automation_state["settings"]
