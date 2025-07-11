"""Email repository for database operations"""

import logging
from typing import List, Tuple

from ....utils.db_utils import get_db_connection
from ....core.config import get_settings

logger = logging.getLogger(__name__)


def _load_emails_by_status(status) -> List[dict]:
    """Load email records from the database by status"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        settings = get_settings()
        
        query = f"""
            SELECT Email_ID, Company_Name, Email, Subject, File_Path, 
                   Email_Send_Date, Email_Status, Date, Reason 
            FROM {settings.EMAIL_TABLE}
            WHERE Email_Status = ?
            ORDER BY Email_Send_Date
        """
        
        cursor.execute(query, [status])
        
        columns = [column[0] for column in cursor.description]
        results = []
        
        for row in cursor.fetchall():
            results.append(dict(zip(columns, row)))
            
        return results
    except Exception as e:
        logger.error(f"Error loading emails with status '{status}': {str(e)}")
        return []
    finally:
        if 'conn' in locals():
            conn.close()


def _check_email_status(email_id: int) -> Tuple[bool, str]:
    """
    Check if email status is still Pending to prevent duplicate processing
    
    Args:
        email_id: The ID of the email record
        
    Returns:
        Tuple[bool, str]: (is_pending, current_status)
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        settings = get_settings()
        
        query = f"""
            SELECT Email_Status FROM {settings.EMAIL_TABLE}
            WHERE Email_ID = ?
        """
        
        cursor.execute(query, [email_id])
        result = cursor.fetchone()
        
        if not result:
            return False, "Not found"
            
        status = result[0]
        
        # Import here to avoid circular imports
        from ....models.email import EmailStatus
        return status.lower() == EmailStatus.PENDING.value.lower(), status
    except Exception as e:
        logger.error(f"Error checking email status: {str(e)}")
        return False, f"Error: {str(e)}"
    finally:
        if 'conn' in locals():
            conn.close()
