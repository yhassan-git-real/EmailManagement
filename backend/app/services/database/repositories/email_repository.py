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


def get_dashboard_metrics(start_date: Optional[datetime] = None, end_date: Optional[datetime] = None) -> Dict[str, Any]:
    """
    Get dashboard metrics with optional date range filtering.
    
    Args:
        start_date: Optional start date for filtering
        end_date: Optional end date for filtering
        
    Returns:
        Dictionary with dashboard metrics and trends
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        settings = get_settings()
        
        # Build date filter condition
        date_filter = ""
        params = []
        
        if start_date and end_date:
            date_filter = "WHERE Date BETWEEN ? AND ?"
            params = [start_date, end_date]
        elif start_date:
            date_filter = "WHERE Date >= ?"
            params = [start_date]
        elif end_date:
            date_filter = "WHERE Date <= ?"
            params = [end_date]
        
        # Get status summary for the date range
        status_query = f"""
            SELECT Email_Status, COUNT(*) as Count 
            FROM {settings.EMAIL_TABLE}
            {date_filter}
            GROUP BY Email_Status
        """
        
        cursor.execute(status_query, params)
        
        status_results = {
            "Success": 0,
            "Pending": 0,
            "Failed": 0
        }
        
        total_count = 0
        for row in cursor.fetchall():
            status_key = row[0]
            count = row[1]
            total_count += count
            
            if status_key.lower() == "success":
                status_results["Success"] = count
            elif status_key.lower() == "pending":
                status_results["Pending"] = count
            elif status_key.lower() == "failed":
                status_results["Failed"] = count
        
        # Calculate metrics
        delivery_rate = 0
        bounce_rate = 0
        
        if total_count > 0:
            delivery_rate = (status_results["Success"] / total_count) * 100
            bounce_rate = (status_results["Failed"] / total_count) * 100
        
        # Get average processing time using only the Date column
        time_query = f"""
            SELECT 
                AVG(DATEDIFF(SECOND, Date, GETDATE())) as AvgProcessingTime
            FROM {settings.EMAIL_TABLE}
            WHERE Email_Status IN ('Success', 'Failed')
        """
        
        # Add date filter to the query if provided
        if date_filter:
            time_query = time_query.replace('WHERE', 'WHERE ' + date_filter.replace('WHERE', '') + ' AND')
        
        cursor.execute(time_query, params)
        avg_time_row = cursor.fetchone()
        
        # Provide a default value if NULL is returned
        avg_processing_time = avg_time_row[0] if avg_time_row and avg_time_row[0] is not None else 0
        
        # Log the result for debugging
        logger.debug(f"Average processing time query result: {avg_time_row}")
        
        # Get daily trends for the last 7 days or specified date range
        # Adjust the WHERE clause for trend query based on date filter
        if date_filter:
            # If there's already a date filter, don't add the default 7 days
            trend_where = date_filter
        else:
            trend_where = "WHERE Date >= DATEADD(day, -7, GETDATE())"
            
        trend_query = """
            SELECT 
                CONVERT(date, Date) as Day,
                Email_Status,
                COUNT(*) as Count
            FROM {0}
            {1}
            GROUP BY CONVERT(date, Date), Email_Status
            ORDER BY Day
        """.format(settings.EMAIL_TABLE, trend_where)
        
        cursor.execute(trend_query, params)
        
        trend_data = {}
        for row in cursor.fetchall():
            day = row[0].strftime('%Y-%m-%d')
            status = row[1]
            count = row[2]
            
            if day not in trend_data:
                trend_data[day] = {"Success": 0, "Failed": 0, "Pending": 0}
                
            if status.lower() == "success":
                trend_data[day]["Success"] = count
            elif status.lower() == "failed":
                trend_data[day]["Failed"] = count
            elif status.lower() == "pending":
                trend_data[day]["Pending"] = count
        
        # Format trend data for frontend
        days = sorted(trend_data.keys())
        formatted_trends = {
            "labels": days,
            "sent": [trend_data[day]["Success"] for day in days],
            "failed": [trend_data[day]["Failed"] for day in days],
            "pending": [trend_data[day]["Pending"] for day in days]
        }
        
        # Calculate weekly change percentage
        weekly_change = "0%"
        if len(days) >= 2:
            first_day_total = sum(trend_data[days[0]].values())
            last_day_total = sum(trend_data[days[-1]].values())
            
            if first_day_total > 0:
                change_pct = ((last_day_total - first_day_total) / first_day_total) * 100
                weekly_change = f"{'+' if change_pct >= 0 else ''}{change_pct:.1f}%"
        
        return {
            "metrics": {
                "totalSent": total_count,
                "weeklyChange": weekly_change,
                "deliveryRate": f"{delivery_rate:.1f}%",
                "bounceRate": f"{bounce_rate:.1f}%",
                "processingTime": f"{avg_processing_time:.1f}s"
            },
            "statusSummary": {
                "pending": status_results["Pending"],
                "success": status_results["Success"],
                "failed": status_results["Failed"],
                "total": total_count
            },
            "trends": formatted_trends,
            "last_updated": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Error getting dashboard metrics: {str(e)}")
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
