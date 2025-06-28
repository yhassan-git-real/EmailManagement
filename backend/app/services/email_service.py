import logging
from typing import List, Dict, Any, Optional
from datetime import datetime

from ..utils.db_utils import get_db_connection
from ..core.config import get_settings

logger = logging.getLogger(__name__)


# Email Records Functions
def get_email_records(
    status: Optional[str] = None, 
    limit: int = 100, 
    offset: int = 0
) -> List[Dict[str, Any]]:
    """
    Retrieve email records with optional status filter.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        settings = get_settings()
        
        query = f"""
            SELECT Email_ID, Company_Name, Email, Subject, File_Path, 
                   Email_Send_Date, Email_Status, Date, Reason 
            FROM {settings.EMAIL_TABLE}
        """
        
        params = []
        if status:
            query += " WHERE Email_Status = ?"
            params.append(status)
        
        query += " ORDER BY Email_Send_Date DESC OFFSET ? ROWS FETCH NEXT ? ROWS ONLY"
        params.extend([offset, limit])
        
        cursor.execute(query, params)
        
        columns = [column[0] for column in cursor.description]
        results = []
        
        for row in cursor.fetchall():
            results.append(dict(zip(columns, row)))
            
        return results
    except Exception as e:
        logger.error(f"Error retrieving email records: {str(e)}")
        raise
    finally:
        if 'conn' in locals():
            conn.close()


def get_email_record_by_id(email_id: int) -> Dict[str, Any]:
    """
    Retrieve a specific email record by its ID.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        settings = get_settings()
        
        query = f"""
            SELECT Email_ID, Company_Name, Email, Subject, File_Path, 
                   Email_Send_Date, Email_Status, Date, Reason 
            FROM {settings.EMAIL_TABLE}
            WHERE Email_ID = ?
        """
        
        cursor.execute(query, [email_id])
        
        columns = [column[0] for column in cursor.description]
        row = cursor.fetchone()
        
        if not row:
            return None
        
        return dict(zip(columns, row))
    except Exception as e:
        logger.error(f"Error retrieving email record {email_id}: {str(e)}")
        raise
    finally:
        if 'conn' in locals():
            conn.close()


def create_email_record(record_data: Dict[str, Any]) -> int:
    """
    Create a new email record.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        settings = get_settings()
        
        columns = ["Company_Name", "Email", "Subject", "File_Path", 
                  "Email_Send_Date", "Email_Status", "Reason"]
        values = [record_data.get(k.lower().replace('_', '_')) for k in columns]
        
        placeholders = ", ".join(["?" for _ in columns])
        columns_str = ", ".join(columns)
        
        query = f"""
            INSERT INTO {settings.EMAIL_TABLE} ({columns_str})
            VALUES ({placeholders});
            SELECT SCOPE_IDENTITY();
        """
        
        cursor.execute(query, values)
        new_id = cursor.fetchval()
        conn.commit()
        
        return new_id
    except Exception as e:
        logger.error(f"Error creating email record: {str(e)}")
        raise
    finally:
        if 'conn' in locals():
            conn.close()


def update_email_status(email_id: int, status: str, reason: Optional[str] = None) -> bool:
    """
    Update the status of an email record.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        settings = get_settings()
        
        query = f"""
            UPDATE {settings.EMAIL_TABLE}
            SET Email_Status = ?, Reason = ?
            WHERE Email_ID = ?
        """
        
        cursor.execute(query, [status, reason, email_id])
        conn.commit()
        
        return cursor.rowcount > 0
    except Exception as e:
        logger.error(f"Error updating email status for record {email_id}: {str(e)}")
        raise
    finally:
        if 'conn' in locals():
            conn.close()


def get_email_status_summary() -> Dict[str, int]:
    """
    Get a summary of email statuses.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        settings = get_settings()
        
        query = f"""
            SELECT Email_Status, COUNT(*) as Count 
            FROM {settings.EMAIL_TABLE}
            GROUP BY Email_Status
        """
        
        cursor.execute(query)
        
        results = {}
        for row in cursor.fetchall():
            # Make sure we handle case sensitivity correctly for status values
            status_key = row[0]
            if status_key.lower() == "success":
                results["Success"] = row[1]
            elif status_key.lower() == "pending":
                results["Pending"] = row[1]
            elif status_key.lower() == "failed":
                results["Failed"] = row[1]
            else:
                results[status_key] = row[1]
        
        # Ensure all statuses are present
        for status in ["Pending", "Success", "Failed"]:
            if status not in results:
                results[status] = 0
                
        return results
    except Exception as e:
        logger.error(f"Error getting email status summary: {str(e)}")
        raise
    finally:
        if 'conn' in locals():
            conn.close()
