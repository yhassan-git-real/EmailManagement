"""
Database service module - Centralized database operations.

This module provides a unified interface for all database operations,
maintaining backward compatibility with the existing API.
"""

# Import core database functionality
from .core import (
    execute_query,
    ConnectionManager,
    get_connection_manager,
    get_db_connection
)

# Import repository functions
from .repositories import (
    # Email repository functions
    get_email_records,
    get_email_record_by_id,
    create_email_record,
    update_email_status,
    get_email_status_summary,
    get_email_records_by_status,
    
    # Email record repository functions
    get_email_records_paginated,
    get_email_record_by_id_with_connection,
    update_email_record,
    update_email_record_status,
    delete_email_record
)

# Export all public functions to maintain current API
__all__ = [
    # Core functions
    "execute_query",
    "ConnectionManager",
    "get_connection_manager",
    "get_db_connection",
    
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
