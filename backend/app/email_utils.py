import pyodbc
import logging
from app.config import get_settings
from typing import List, Dict, Any, Optional
from datetime import datetime

logger = logging.getLogger(__name__)

def get_db_connection():
    """Create and return a connection to the database."""
    settings = get_settings()
    connection_string = (
        f"DRIVER={{{settings.DB_DRIVER}}};"
        f"SERVER={settings.DB_SERVER};"
        f"DATABASE={settings.DB_NAME};"
        f"UID={settings.DB_USER};"
        f"PWD={settings.DB_PASSWORD};"
        f"Trusted_Connection=no;"
    )
    return pyodbc.connect(connection_string)

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
        
        query = f"""
            SELECT Email_ID, Company_Name, Email, Subject, File_Path, 
                   Email_Send_Date, Email_Status, Date, Reason 
            FROM {get_settings().EMAIL_TABLE}
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
        
        query = f"""
            SELECT Email_ID, Company_Name, Email, Subject, File_Path, 
                   Email_Send_Date, Email_Status, Date, Reason 
            FROM {get_settings().EMAIL_TABLE}
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
        
        columns = ["Company_Name", "Email", "Subject", "File_Path", 
                  "Email_Send_Date", "Email_Status", "Reason"]
        values = [record_data.get(k.lower().replace('_', '_')) for k in columns]
        
        placeholders = ", ".join(["?" for _ in columns])
        columns_str = ", ".join(columns)
        
        query = f"""
            INSERT INTO {get_settings().EMAIL_TABLE} ({columns_str})
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
        
        query = f"""
            UPDATE {get_settings().EMAIL_TABLE}
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

# Email Templates Functions
def get_email_templates(
    is_active: bool = True, 
    category: Optional[str] = None,
    limit: int = 100, 
    offset: int = 0
) -> List[Dict[str, Any]]:
    """
    Retrieve email templates with optional filters.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        query = f"""
            SELECT Template_ID, Template_Name, Subject_Template, Body_Template, 
                   Created_Date, Modified_Date, Created_By, Is_Active, 
                   Category, Description, Has_Attachments, Default_Attachment_Paths 
            FROM {get_settings().TEMPLATE_TABLE}
            WHERE 1=1
        """
        
        params = []
        if is_active is not None:
            query += " AND Is_Active = ?"
            params.append(1 if is_active else 0)
        
        if category:
            query += " AND Category = ?"
            params.append(category)
        
        query += " ORDER BY Template_Name OFFSET ? ROWS FETCH NEXT ? ROWS ONLY"
        params.extend([offset, limit])
        
        cursor.execute(query, params)
        
        columns = [column[0] for column in cursor.description]
        results = []
        
        for row in cursor.fetchall():
            results.append(dict(zip(columns, row)))
            
        return results
    except Exception as e:
        logger.error(f"Error retrieving email templates: {str(e)}")
        raise
    finally:
        if 'conn' in locals():
            conn.close()

def get_email_template_by_id(template_id: int) -> Dict[str, Any]:
    """
    Retrieve a specific email template by its ID.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        query = f"""
            SELECT Template_ID, Template_Name, Subject_Template, Body_Template, 
                   Created_Date, Modified_Date, Created_By, Is_Active, 
                   Category, Description, Has_Attachments, Default_Attachment_Paths 
            FROM {get_settings().TEMPLATE_TABLE}
            WHERE Template_ID = ?
        """
        
        cursor.execute(query, [template_id])
        
        columns = [column[0] for column in cursor.description]
        row = cursor.fetchone()
        
        if not row:
            return None
        
        return dict(zip(columns, row))
    except Exception as e:
        logger.error(f"Error retrieving email template {template_id}: {str(e)}")
        raise
    finally:
        if 'conn' in locals():
            conn.close()

def create_email_template(template_data: Dict[str, Any]) -> int:
    """
    Create a new email template.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        columns = ["Template_Name", "Subject_Template", "Body_Template", 
                  "Created_By", "Is_Active", "Category", 
                  "Description", "Has_Attachments", "Default_Attachment_Paths"]
        
        values = [template_data.get(k.lower(), None) for k in columns]
        
        placeholders = ", ".join(["?" for _ in columns])
        columns_str = ", ".join(columns)
        
        query = f"""
            INSERT INTO {get_settings().TEMPLATE_TABLE} ({columns_str})
            VALUES ({placeholders});
            SELECT SCOPE_IDENTITY();
        """
        
        cursor.execute(query, values)
        new_id = cursor.fetchval()
        conn.commit()
        
        return new_id
    except Exception as e:
        logger.error(f"Error creating email template: {str(e)}")
        raise
    finally:
        if 'conn' in locals():
            conn.close()

def update_email_template(template_id: int, template_data: Dict[str, Any]) -> bool:
    """
    Update an existing email template.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Set Modified_Date to current time
        template_data["modified_date"] = datetime.now()
        
        set_clauses = []
        values = []
        
        for key, value in template_data.items():
            # Convert snake_case to PascalCase for SQL column names
            column_name = "".join(word.capitalize() for word in key.split("_"))
            set_clauses.append(f"{column_name} = ?")
            values.append(value)
        
        values.append(template_id)
        
        query = f"""
            UPDATE {get_settings().TEMPLATE_TABLE}
            SET {', '.join(set_clauses)}, Modified_Date = GETDATE()
            WHERE Template_ID = ?
        """
        
        cursor.execute(query, values)
        conn.commit()
        
        return cursor.rowcount > 0
    except Exception as e:
        logger.error(f"Error updating email template {template_id}: {str(e)}")
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
        
        query = f"""
            SELECT Email_Status, COUNT(*) as Count 
            FROM {get_settings().EMAIL_TABLE}
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
