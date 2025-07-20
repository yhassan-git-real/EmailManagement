"""
Email Record Repository - Data access layer for email records management.
"""
import pyodbc
import logging
from typing import List, Dict, Any, Tuple, Optional
from ....models.email_record import EmailRecord, EmailRecordUpdate
from ....core.config import get_settings

# Configure logger
logger = logging.getLogger(__name__)

def get_email_records_paginated(
    connection: pyodbc.Connection, 
    limit: int = 10, 
    offset: int = 0,
    search: Optional[str] = None,
    status: Optional[str] = None
) -> Tuple[List[Dict[str, Any]], int]:
    """
    Get paginated email records with optional filtering
    
    Args:
        connection: Database connection
        limit: Maximum number of records to return
        offset: Number of records to skip
        search: Optional search term to filter records
        status: Optional status to filter records
        
    Returns:
        Tuple of (records list, total count)
    """
    cursor = connection.cursor()
    
    try:
        # Get settings for stored procedure names
        settings = get_settings()
        
        # Try to use stored procedure first
        try:
            logger.info(f"Attempting to get email records using stored procedure: limit={limit}, offset={offset}, search={search}, status={status}")
            
            query = f"""
            EXEC {settings.SP_EMAIL_RECORDS_GET}
                @limit = ?,
                @offset = ?,
                @search = ?,
                @status = ?
            """
            
            cursor.execute(query, [limit, offset, search, status])
            
            # First result set is the total count
            total_count = cursor.fetchval()
            
            # Move to the next result set
            cursor.nextset()
            
            # Fetch the actual records
            columns = [column[0] for column in cursor.description]
            records = []
            
            for row in cursor.fetchall():
                record = dict(zip(columns, row))
                records.append(record)
            
            logger.info(f"Retrieved {len(records)} records using stored procedure")
            return records, total_count
            
        except Exception as sp_error:
            logger.warning(f"Failed to use stored procedure for get_email_records: {str(sp_error)}. Falling back to direct SQL.")
            
            # Build the base query for counting total records
            count_sql = f"""
            SELECT COUNT(*)
            FROM {settings.EMAIL_TABLE}
            WHERE 1=1
            """
            
            # Build the main query
            query_sql = f"""
            SELECT 
                Email_ID as id, 
                Company_Name as company_name, 
                Email as email, 
                Subject as subject, 
                File_Path as file_path, 
                Email_Status as email_status, 
                Reason as reason, 
                Email_Send_Date as email_send_date, 
                Date as date
            FROM {settings.EMAIL_TABLE}
            WHERE 1=1
            """
            
            # Add search filter if provided
            params = []
            if search:
                search_condition = """
                AND (
                    Company_Name LIKE ? OR
                    Email LIKE ? OR
                    Subject LIKE ? OR
                    File_Path LIKE ?
                )
                """
                search_param = f"%{search}%"
                count_sql += search_condition
                query_sql += search_condition
                params.extend([search_param, search_param, search_param, search_param])
            
            # Add status filter if provided
            if status:
                status_condition = "AND Email_Status = ?"
                count_sql += status_condition
                query_sql += status_condition
                params.append(status)
            
            # Add ordering and pagination
            query_sql += """
            ORDER BY Date DESC
            OFFSET ? ROWS
            FETCH NEXT ? ROWS ONLY
            """
            
            # Get total count
            cursor.execute(count_sql, params)
            total_count = cursor.fetchval()
            
            # Execute the main query with pagination
            cursor.execute(query_sql, params + [offset, limit])
            
            # Convert rows to dictionaries
            columns = [column[0] for column in cursor.description]
            records = []
            
            for row in cursor.fetchall():
                record = dict(zip(columns, row))
                records.append(record)
            
            logger.info(f"Retrieved {len(records)} records using direct SQL")
            return records, total_count
    
    except Exception as e:
        logger.error(f"Database error in get_email_records_paginated: {str(e)}")
        raise
    finally:
        cursor.close()


def get_email_record_by_id(connection: pyodbc.Connection, record_id: int) -> Optional[Dict[str, Any]]:
    """
    Get a specific email record by ID
    
    Args:
        connection: Database connection
        record_id: ID of the email record to retrieve
        
    Returns:
        Email record as dictionary or None if not found
    """
    cursor = connection.cursor()
    
    try:
        settings = get_settings()
        query = f"""
        SELECT 
            Email_ID as id, 
            Company_Name as company_name, 
            Email as email, 
            Subject as subject, 
            File_Path as file_path, 
            Email_Status as email_status, 
            Reason as reason, 
            Email_Send_Date as email_send_date, 
            Date as date
        FROM {settings.EMAIL_TABLE}
        WHERE Email_ID = ?
        """
        
        cursor.execute(query, [record_id])
        
        row = cursor.fetchone()
        if not row:
            return None
        
        # Convert row to dictionary
        columns = [column[0] for column in cursor.description]
        record = dict(zip(columns, row))
        
        return record
    
    except Exception as e:
        logger.error(f"Database error in get_email_record_by_id: {str(e)}")
        raise
    finally:
        cursor.close()


def update_email_record(
    connection: pyodbc.Connection, 
    record_id: int, 
    record_data: EmailRecordUpdate
) -> bool:
    """
    Update an email record
    
    Args:
        connection: Database connection
        record_id: ID of the email record to update
        record_data: Updated data for the record
        
    Returns:
        True if successful, False otherwise
    """
    cursor = connection.cursor()
    
    try:
        # Convert model to dict
        data_dict = record_data.dict(exclude_unset=True)
        
        # Log what we're trying to update
        logger.info(f"Updating email record ID {record_id} with data: {data_dict}")
        
        # Get settings for stored procedure names
        settings = get_settings()
        
        # Try to use stored procedure
        try:
            query = f"""
            EXEC {settings.SP_EMAIL_RECORDS_CREATE_UPDATE}
                @id = ?,
                @company_name = ?,
                @email = ?,
                @subject = ?,
                @file_path = ?,
                @email_status = ?,
                @reason = ?,
                @email_send_date = ?
            """
            
            logger.info(f"Executing stored procedure for update with ID={record_id}")
            
            # Execute the stored procedure
            cursor.execute(query, 
                record_id,
                data_dict.get('company_name'),
                data_dict.get('email'),
                data_dict.get('subject'),
                data_dict.get('file_path'),
                data_dict.get('email_status'),
                data_dict.get('reason'),
                data_dict.get('email_send_date')
            )
            
            # Check for successful result
            row = cursor.fetchone()
            if row:
                logger.info(f"Successfully updated email record with ID: {record_id} using stored procedure")
                connection.commit()
                return True
            else:
                logger.warning("Stored procedure did not return expected result, falling back to direct SQL")
                raise Exception("Stored procedure did not return expected result")
                
        except Exception as sp_error:
            # If stored procedure fails, fall back to direct SQL
            logger.warning(f"Stored procedure call failed: {str(sp_error)}. Falling back to direct SQL.")
            
            # Start with the base query
            query = f"UPDATE {settings.EMAIL_TABLE} SET "
            
            # Build the SET clause dynamically based on provided fields
            set_clauses = []
            params = []
            
            # Map model field names to DB column names
            field_mapping = {
                'company_name': 'Company_Name',
                'email': 'Email',
                'subject': 'Subject',
                'file_path': 'File_Path',
                'email_status': 'Email_Status',
                'reason': 'Reason',
                'email_send_date': 'Email_Send_Date'
            }
            
            # Process each field if it's provided
            for field, value in data_dict.items():
                if value is not None:
                    db_field = field_mapping.get(field, field)
                    set_clauses.append(f"{db_field} = ?")
                    params.append(value)
            
            if not set_clauses:
                # No fields to update
                logger.info(f"No fields to update for record {record_id}")
                return True
            
            # Combine the SET clauses and add the WHERE condition
            query += ", ".join(set_clauses) + " WHERE Email_ID = ?"
            params.append(record_id)
            
            logger.info(f"Executing direct SQL update with fields: {', '.join(set_clauses)}")
            
            # Execute the update
            cursor.execute(query, params)
            connection.commit()
            
            # Check if a record was actually updated
            result = cursor.rowcount > 0
            logger.info(f"Update result: {result} (rowcount={cursor.rowcount})")
            return result
    
    except Exception as e:
        logger.error(f"Database error in update_email_record: {str(e)}")
        connection.rollback()
        raise
    finally:
        cursor.close()


def update_email_record_status(
    connection: pyodbc.Connection, 
    record_id: int, 
    status: str
) -> bool:
    """
    Update the status of an email record
    
    Args:
        connection: Database connection
        record_id: ID of the email record to update
        status: New status value ('Pending', 'Success', 'Failed')
        
    Returns:
        True if successful, False otherwise
    """
    cursor = connection.cursor()
    
    try:
        # Validate status
        valid_statuses = ['Pending', 'Success', 'Failed']
        if status not in valid_statuses:
            logger.error(f"Invalid status requested: {status}")
            raise ValueError(f"Invalid status: {status}. Must be one of: {', '.join(valid_statuses)}")
        
        logger.info(f"Updating status of email record ID {record_id} to '{status}'")
        
        # Get settings for stored procedure names
        settings = get_settings()
        
        # Try to use stored procedure
        try:
            query = f"""
            EXEC {settings.SP_EMAIL_RECORDS_UPDATE_STATUS} @id = ?, @status = ?
            """
            
            logger.info(f"Executing stored procedure for status update with ID={record_id}, status={status}")
            
            # Execute the stored procedure
            cursor.execute(query, record_id, status)
            
            # Check for successful result
            row = cursor.fetchone()
            if row:
                logger.info(f"Successfully updated status of email record with ID: {record_id} to '{status}' using stored procedure")
                connection.commit()
                return True
            else:
                logger.warning("Stored procedure did not return expected result, falling back to direct SQL")
                raise Exception("Stored procedure did not return expected result")
                
        except Exception as sp_error:
            # If stored procedure fails, fall back to direct SQL
            logger.warning(f"Stored procedure call failed: {str(sp_error)}. Falling back to direct SQL.")
            
            query = f"""
            UPDATE {settings.EMAIL_TABLE}
            SET Email_Status = ?
            WHERE Email_ID = ?
            """
            
            logger.info(f"Executing direct SQL status update for record ID: {record_id} to '{status}'")
            
            cursor.execute(query, [status, record_id])
            connection.commit()
            
            # Check if a record was actually updated
            result = cursor.rowcount > 0
            logger.info(f"Status update result: {result} (rowcount={cursor.rowcount})")
            return result
    
    except Exception as e:
        logger.error(f"Database error in update_email_record_status: {str(e)}")
        connection.rollback()
        raise
    finally:
        cursor.close()


def delete_email_record(connection: pyodbc.Connection, record_id: int) -> bool:
    """
    Delete an email record
    
    Args:
        connection: Database connection
        record_id: ID of the email record to delete
        
    Returns:
        True if successful, False otherwise
    """
    cursor = connection.cursor()
    
    try:
        logger.info(f"Attempting to delete email record with ID: {record_id}")
        
        # Get settings for stored procedure names
        settings = get_settings()
        
        # Try to use stored procedure
        try:
            query = f"""
            EXEC {settings.SP_EMAIL_RECORDS_DELETE} @id = ?
            """
            
            logger.info(f"Executing stored procedure for delete with ID={record_id}")
            
            # Execute the stored procedure
            cursor.execute(query, record_id)
            
            # Check for successful result
            row = cursor.fetchone()
            if row:
                logger.info(f"Successfully deleted email record with ID: {record_id} using stored procedure")
                connection.commit()
                return True
            else:
                logger.warning("Stored procedure did not return expected result, falling back to direct SQL")
                raise Exception("Stored procedure did not return expected result")
                
        except Exception as sp_error:
            # If stored procedure fails, fall back to direct SQL
            logger.warning(f"Stored procedure call failed: {str(sp_error)}. Falling back to direct SQL.")
            
            query = f"""
            DELETE FROM {settings.EMAIL_TABLE}
            WHERE Email_ID = ?
            """
            
            logger.info(f"Executing direct SQL delete for record ID: {record_id}")
            
            cursor.execute(query, [record_id])
            connection.commit()
            
            # Check if a record was actually deleted
            result = cursor.rowcount > 0
            logger.info(f"Delete result: {result} (rowcount={cursor.rowcount})")
            return result
    
    except Exception as e:
        logger.error(f"Database error in delete_email_record: {str(e)}")
        connection.rollback()
        raise
    finally:
        cursor.close()
