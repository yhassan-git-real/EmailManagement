"""
Database - Module for database connection handling
"""
import pyodbc
from ..utils.db_utils import get_connection_string

def get_db_connection():
    """Create and return a connection to the database."""
    conn_str = get_connection_string()
    return pyodbc.connect(conn_str)
