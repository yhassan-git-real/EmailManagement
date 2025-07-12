"""
Connection Manager for database operations.
Handles connection pooling, validation, and retry logic.
"""
import logging
import pyodbc
import time
from typing import Dict, Any, Optional, Tuple, List
from threading import Lock
from ....utils.db_utils import get_connection_string, test_connection

logger = logging.getLogger(__name__)

class ConnectionManager:
    """Manages database connections with pooling and retry logic."""
    
    def __init__(self, max_retries: int = 3, retry_delay: float = 1.0):
        self.max_retries = max_retries
        self.retry_delay = retry_delay
        self._connection_lock = Lock()
        self._connection_cache = {}
        
    def get_connection(self, connection_params: Optional[Dict[str, Any]] = None) -> pyodbc.Connection:
        """
        Get a database connection with retry logic.
        
        Args:
            connection_params: Optional connection parameters
            
        Returns:
            Database connection
        """
        conn_str = get_connection_string(
            server=connection_params.get('server') if connection_params else None,
            database=connection_params.get('database') if connection_params else None,
            username=connection_params.get('username') if connection_params else None,
            password=connection_params.get('password') if connection_params else None
        )
        
        for attempt in range(self.max_retries + 1):
            try:
                connection = pyodbc.connect(conn_str)
                logger.debug(f"Successfully connected to database on attempt {attempt + 1}")
                return connection
            except pyodbc.Error as e:
                logger.warning(f"Connection attempt {attempt + 1} failed: {str(e)}")
                if attempt < self.max_retries:
                    time.sleep(self.retry_delay * (2 ** attempt))  # Exponential backoff
                else:
                    logger.error(f"Failed to connect after {self.max_retries + 1} attempts")
                    raise
    
    def validate_connection(self, connection: pyodbc.Connection) -> bool:
        """
        Validate if a connection is still active.
        
        Args:
            connection: Database connection to validate
            
        Returns:
            True if connection is valid, False otherwise
        """
        try:
            cursor = connection.cursor()
            cursor.execute("SELECT 1")
            cursor.fetchone()
            cursor.close()
            return True
        except Exception as e:
            logger.warning(f"Connection validation failed: {str(e)}")
            return False
    
    def execute_with_retry(self, query: str, params: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """
        Execute a query with connection retry logic.
        
        Args:
            query: SQL query to execute
            params: Optional parameters for the query
            
        Returns:
            List of dictionaries representing query results
        """
        connection = None
        try:
            connection = self.get_connection()
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
            if connection:
                connection.rollback()
            raise
        finally:
            if connection:
                connection.close()
    
    def test_connection_with_params(self, connection_params: Optional[Dict[str, Any]] = None) -> Tuple[bool, str]:
        """
        Test database connection with optional parameters.
        
        Args:
            connection_params: Optional connection parameters
            
        Returns:
            Tuple of (success: bool, message: str)
        """
        return test_connection(connection_params)

# Global connection manager instance
_connection_manager = None
_manager_lock = Lock()

def get_connection_manager() -> ConnectionManager:
    """Get the global connection manager instance."""
    global _connection_manager
    if _connection_manager is None:
        with _manager_lock:
            if _connection_manager is None:
                _connection_manager = ConnectionManager()
    return _connection_manager

def get_db_connection(connection_params: Optional[Dict[str, Any]] = None) -> pyodbc.Connection:
    """
    Get a database connection using the connection manager.
    
    Args:
        connection_params: Optional connection parameters
        
    Returns:
        Database connection
    """
    manager = get_connection_manager()
    return manager.get_connection(connection_params)
