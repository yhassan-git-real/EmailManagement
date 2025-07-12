"""
Database repositories module - Data access layer.
"""
from .email_repository import (
    get_email_records,
    get_email_record_by_id,
    create_email_record,
    update_email_status,
    get_email_status_summary,
    get_email_records_by_status
)

from .email_record_repository import (
    get_email_records_paginated,
    get_email_record_by_id as get_email_record_by_id_with_connection,
    update_email_record,
    update_email_record_status,
    delete_email_record
)

__all__ = [
    # Email repository functions
    "get_email_records",
    "get_email_record_by_id",
    "create_email_record",
    "update_email_status",
    "get_email_status_summary",
    "get_email_records_by_status",
    
    # Email record repository functions
    "get_email_records_paginated",
    "get_email_record_by_id_with_connection",
    "update_email_record",
    "update_email_record_status",
    "delete_email_record"
]
