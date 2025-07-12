"""
Email Repository - Data access layer for email records.
"""
import logging
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime

from ....utils.db_utils import get_db_connection
from ....core.config import get_settings

logger = logging.getLogger(__name__)


def get_email_records(
    status: Optional[str] = None, 
    limit: int = 100, 
    offset: int = 0
) -> Tuple[List[Dict[str, Any]], int]:
    """
    Retrieve email records with optional status filter using the stored procedure.
    
    Args:
        status: Optional status filter
        limit: Maximum number of records to return
        offset: Number of records to skip
        
    Returns:
        Tuple of (records list, total count)
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        settings = get_settings()
        
        # Use the stored procedure from the .env file
        stored_procedure = settings.SP_EMAIL_RECORDS_BY_STATUS
        
        # Execute the stored procedure with parameters
        cursor.execute(
            f"EXEC {settings.DB_SCHEMA}.{stored_procedure} @EmailStatus = ?, @Offset = ?, @Limit = ?", 
            [status if status and status != 'All' else None, offset, limit]
        )
        
        # Get the results from the first resultset
        columns = [column[0] for column in cursor.description]
        rows = cursor.fetchall()
        
        # Create a mapping from DB column names to model field names (camel case to snake case)
        column_mapping = {
            'Email_ID': 'email_id',
            'Company_Name': 'company_name',
            'Email': 'email',
            'Subject': 'subject',
            'File_Path': 'file_path',
            'Email_Send_Date': 'email_send_date',
            'Email_Status': 'email_status',
            'Date': 'date',
            'Reason': 'reason'
        }
        
        # Transform the results
        results = []
        for row in rows:
            # Create a row dict with original column names
            row_dict = dict(zip(columns, row))
            
            # Create a new dict with snake_case keys for the model
            transformed_dict = {}
            for key, value in row_dict.items():
                transformed_key = column_mapping.get(key, key.lower())
                transformed_dict[transformed_key] = value
                
            # Add the id field for frontend compatibility
            transformed_dict['id'] = transformed_dict['email_id']
                
            results.append(transformed_dict)
            
        # Get total count from the second resultset
        if cursor.nextset():
            total_count = cursor.fetchone()[0]
        else:
            total_count = len(results)
            
        return results, total_count
    except Exception as e:
        logger.error(f"Error retrieving email records: {str(e)}")
        raise
    finally:
        if 'conn' in locals():
            conn.close()


def get_email_record_by_id(email_id: int) -> Optional[Dict[str, Any]]:
    """
    Retrieve a specific email record by its ID.
    
    Args:
        email_id: ID of the email record to retrieve
        
    Returns:
        Email record as dictionary or None if not found
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
    
    Args:
        record_data: Dictionary containing email record data
        
    Returns:
        ID of the newly created record
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
    
    Args:
        email_id: ID of the email record to update
        status: New status value
        reason: Optional reason for the status change
        
    Returns:
        True if successful, False otherwise
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
    
    Returns:
        Dictionary with status counts
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
        
        results = {
            "Success": 0,
            "Pending": 0,
            "Failed": 0
        }
        
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
                # For any other status, log it for debugging
                logger.debug(f"Found unexpected status: {status_key}")
                # Add it to the results dictionary anyway
                results[status_key] = row[1]
                
        return results
    except Exception as e:
        logger.error(f"Error getting email status summary: {str(e)}")
        raise
    finally:
        if 'conn' in locals():
            conn.close()


def get_email_records_by_status(
    status: Optional[str] = None, 
    limit: int = 100, 
    offset: int = 0
) -> Dict[str, Any]:
    """
    Retrieve email records with optional status filter using stored procedure.
    Returns both the records and total count.
    
    Args:
        status: Optional status filter
        limit: Maximum number of records to return
        offset: Number of records to skip
        
    Returns:
        Dictionary with 'rows' and 'total' keys
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        settings = get_settings()
        
        # Call the stored procedure
        cursor.execute(
            "{CALL GetEmailRecordsByStatus(?, ?, ?)}",
            (status if status and status != 'All' else None, offset, limit)
        )
        
        # Get the result set with records
        columns = [column[0] for column in cursor.description]
        results = []
        
        # Create a mapping from DB column names to model field names (camel case to snake case)
        column_mapping = {
            'Email_ID': 'email_id',
            'Company_Name': 'company_name',
            'Email': 'email',
            'Subject': 'subject',
            'File_Path': 'file_path',
            'Email_Send_Date': 'email_send_date',
            'Email_Status': 'email_status',
            'Date': 'date',
            'Reason': 'reason'
        }
        
        for row in cursor.fetchall():
            # Create a row dict with original column names
            row_dict = dict(zip(columns, row))
            
            # Create a new dict with snake_case keys for the model
            transformed_dict = {}
            for key, value in row_dict.items():
                transformed_key = column_mapping.get(key, key.lower())
                transformed_dict[transformed_key] = value
                
            results.append(transformed_dict)
        
        # Move to the next result set to get total count
        cursor.nextset()
        total_count = cursor.fetchone()[0]
        
        return {
            "rows": results,
            "total": total_count
        }
    except Exception as e:
        logger.error(f"Error retrieving email records by status: {str(e)}")
        raise
    finally:
        if 'conn' in locals():
            conn.close()
