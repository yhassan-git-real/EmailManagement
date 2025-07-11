"""
Status repository for status-related database operations
"""

import logging
from typing import Optional

from ....utils.db_utils import get_db_connection
from ....core.config import get_settings

logger = logging.getLogger(__name__)


def update_email_status(email_id: int, status: str, reason: Optional[str] = None) -> bool:
    """
    Update the status of an email record
    
    Args:
        email_id: ID of the email record
        status: New status value
        reason: Optional reason for the status update (e.g., error message)
    
    Returns:
        bool: True if update was successful
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        settings = get_settings()
        
        update_query = f"""
            UPDATE {settings.EMAIL_TABLE}
            SET Email_Status = ?, Reason = ?
            WHERE Email_ID = ?
        """
        
        cursor.execute(update_query, [status, reason, email_id])
        conn.commit()
        
        return cursor.rowcount > 0
        
    except Exception as e:
        logger.error(f"Error updating email status: {str(e)}")
        return False
    finally:
        if 'conn' in locals():
            conn.close()
