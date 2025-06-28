import logging
from typing import List, Dict, Any, Optional
from datetime import datetime

from ..utils.db_utils import get_db_connection
from ..core.config import get_settings

logger = logging.getLogger(__name__)


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
        settings = get_settings()
        
        query = f"""
            SELECT Template_ID, Template_Name, Subject_Template, Body_Template, 
                   Created_Date, Modified_Date, Created_By, Is_Active, 
                   Category, Description, Has_Attachments, Default_Attachment_Paths 
            FROM {settings.TEMPLATE_TABLE}
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
        settings = get_settings()
        
        query = f"""
            SELECT Template_ID, Template_Name, Subject_Template, Body_Template, 
                   Created_Date, Modified_Date, Created_By, Is_Active, 
                   Category, Description, Has_Attachments, Default_Attachment_Paths 
            FROM {settings.TEMPLATE_TABLE}
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
        settings = get_settings()
        
        columns = ["Template_Name", "Subject_Template", "Body_Template", 
                  "Created_By", "Is_Active", "Category", 
                  "Description", "Has_Attachments", "Default_Attachment_Paths"]
        
        values = [template_data.get(k.lower(), None) for k in columns]
        
        placeholders = ", ".join(["?" for _ in columns])
        columns_str = ", ".join(columns)
        
        query = f"""
            INSERT INTO {settings.TEMPLATE_TABLE} ({columns_str})
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
        settings = get_settings()
        
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
            UPDATE {settings.TEMPLATE_TABLE}
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
