"""State manager for automation process"""

import threading
from datetime import datetime
_automation_state = {
    "is_running": False,
    "start_time": None,
    "stop_requested": False,
    "automation_thread": None,
    "status": "idle",
    "last_run": None,
    "summary": {
        "processed": 0,
        "successful": 0,
        "failed": 0,
        "pending": 0
    },
    "settings": {
        "retry_on_failure": True,
        "retry_interval": "15min",
        "template_id": "default",
        "sharing_option": "anyone",
        "specific_emails": []
    },
    "schedule": {
        "enabled": False,
        "frequency": "daily",
        "time": "09:00",
        "days": [],
        "lastRun": None,
        "nextRun": None
    },
    "email_queue": None,
    "scheduler_thread": None,
    "scheduler_running": False
}


def get_automation_state() -> dict:
    return _automation_state

