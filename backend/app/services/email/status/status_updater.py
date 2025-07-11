import logging
from datetime import datetime
from typing import Optional

from ....core.config import get_settings
from ....utils.db_utils import get_db_connection

logger = logging.getLogger(__name__)

def update_email_status(
    email_id: int, 
    status: str, 
    reason: Optional[str] = None,
    send_date: Optional[datetime] = None,
    date: Optional[datetime] = None
) -> bool:
    """Update the status of an email record in the database"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        settings = get_settings()
        
        update_fields = ["Email_Status = ?"] 
        params = [status]
        
        if reason is not None:
            update_fields.append("Reason = ?")
            params.append(reason)
            
        if send_date is not None:
            update_fields.append("Email_Send_Date = ?")
            params.append(send_date)
            
        if date is not None:
            update_fields.append("Date = ?")
            params.append(date)
            
        params.append(email_id)
        
        query = f"""
            UPDATE {settings.EMAIL_TABLE}
            SET {', '.join(update_fields)}
            WHERE Email_ID = ?
        """
        
        cursor.execute(query, params)
        conn.commit()
        
        return cursor.rowcount > 0
    except Exception as e:
        logger.error(f"Error updating email status for record {email_id}: {str(e)}")
        return False
    finally:
        if 'conn' in locals():
            conn.close()
