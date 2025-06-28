import pyodbc
from typing import Dict, Any, Tuple, Optional
import logging
from .config import settings

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


def get_connection_string(server: Optional[str] = None, 
                         database: Optional[str] = None,
                         username: Optional[str] = None,
                         password: Optional[str] = None) -> str:
    """
    Build a connection string for SQL Server.
    Uses either provided parameters or falls back to environment variables.
    
    Args:
        server: Database server name
        database: Database name
        username: Database username
        password: Database password
        
    Returns:
        Connection string for pyodbc
    """
    # Use provided values or fallback to environment settings
    db_server = server or settings.DB_SERVER
    db_name = database or settings.DB_NAME
    db_user = username or settings.DB_USER
    db_password = password or settings.DB_PASSWORD
    db_driver = settings.DB_DRIVER
    
    # Build and return the connection string
    conn_str = (
        f"DRIVER={{{db_driver}}};"
        f"SERVER={db_server};"
        f"DATABASE={db_name};"
        f"UID={db_user};"
        f"PWD={db_password};"
        "Trusted_Connection=no;"
    )
    
    return conn_str


def test_connection(connection_params: Optional[Dict[str, Any]] = None) -> Tuple[bool, str]:
    """
    Test the database connection with the given parameters or environment defaults.
    
    Args:
        connection_params: Optional dictionary with connection parameters
            (server, database, username, password)
            
    Returns:
        Tuple of (success: bool, message: str)
    """
    try:
        # Extract parameters if provided
        server = connection_params.get("server") if connection_params else None
        database = connection_params.get("database") if connection_params else None
        username = connection_params.get("username") if connection_params else None
        password = connection_params.get("password") if connection_params else None
        
        # Get connection string
        conn_str = get_connection_string(server, database, username, password)
        
        # Attempt to establish a connection
        logger.info(f"Attempting to connect to {server or settings.DB_SERVER}/{database or settings.DB_NAME}")
        
        # Print connection string for debugging (with password masked)
        # Mask the actual password used in the connection string
        masked_password = password or settings.DB_PASSWORD
        debug_conn_str = conn_str.replace(masked_password, "********")
        logger.info(f"Using connection string: {debug_conn_str}")
        
        connection = pyodbc.connect(conn_str, timeout=5)
        
        # If we get here, connection succeeded
        cursor = connection.cursor()
        cursor.execute("SELECT @@VERSION")
        version = cursor.fetchone()[0]
        
        logger.info(f"Connected to SQL Server version: {version[:50]}...")
        
        # Close resources
        cursor.close()
        connection.close()
        
        logger.info(f"Successfully connected to {server or settings.DB_SERVER}/{database or settings.DB_NAME}")
        return True, "Successfully connected to the database."
        
    except pyodbc.Error as e:
        # Safely log error without exposing credentials
        error_msg = str(e)
        # Strip any connection string details from error message
        safe_error = error_msg.split("]")[0] + "]" if "]" in error_msg else error_msg
        
        logger.error(f"Database connection failed: {safe_error}")
        
        # Return a more detailed user-friendly message based on the error
        user = username or settings.DB_USER
        db = database or settings.DB_NAME
        srv = server or settings.DB_SERVER
        drv = settings.DB_DRIVER
        
        if "Login failed" in error_msg:
            return False, f"Connection failed: Invalid credentials for user '{user}'"
        elif "Cannot open database" in error_msg:
            return False, f"Connection failed: Database '{db}' does not exist or is not accessible"
        elif "SQL Server Network Interfaces" in error_msg or "server name" in error_msg.lower():
            return False, f"Connection failed: Could not reach the server '{srv}'. Verify the server name and port."
        elif "timeout" in error_msg.lower():
            return False, f"Connection failed: Connection timeout while connecting to '{srv}'"
        elif "driver" in error_msg.lower():
            return False, f"Connection failed: ODBC Driver issue - '{drv}' may not be installed correctly"
        else:
            return False, f"Connection failed: {safe_error}"
            
    except Exception as e:
        # Handle unexpected exceptions
        logger.error(f"Unexpected error during database connection: {str(e)}")
        return False, f"Connection failed due to an unexpected error: {str(e)}"
