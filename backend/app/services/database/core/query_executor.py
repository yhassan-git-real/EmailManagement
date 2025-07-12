"""
Query execution utilities for database operations.

This module provides utilities for executing SQL queries with proper error handling
and result formatting. It serves as a simple interface for database operations.
"""

import logging
import pyodbc
from typing import Dict, Any, Optional, List
from ....utils.db_utils import get_connection_string

logger = logging.getLogger(__name__)

def execute_query(query: str, params: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
    """
    Execute a SQL query and return results as a list of dictionaries.

    Args:
        query: SQL query to execute
        params: Optional parameters for the query

    Returns:
        List of dictionaries representing query results
    """
    try:
        conn_str = get_connection_string()
        connection = pyodbc.connect(conn_str)
        cursor = connection.cursor()

        if params:
            cursor.execute(query, params)
        else:
            cursor.execute(query)

        # If the cursor has results, fetch them
        if cursor.description:
            columns = [column[0] for column in cursor.description]
            results = [dict(zip(columns, row)) for row in cursor.fetchall()]
            return results

        connection.commit()
        return []

    except pyodbc.Error as e:
        logger.error(f"Database query error: {str(e)}")
        raise
    finally:
        if 'connection' in locals():
            connection.close()
