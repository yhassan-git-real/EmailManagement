"""
Base repository class with common database patterns.

This module provides a base class for repositories with common functionality
including connection handling, error logging, and transaction management.
"""

import logging
import sqlite3
from abc import ABC, abstractmethod
from contextlib import contextmanager
from typing import Any, Dict, List, Optional, Tuple, Union


class DatabaseError(Exception):
    """Custom exception for database-related errors."""
    pass


class BaseRepository(ABC):
    """
    Base class for repositories with common database operations.
    
    Provides connection handling, error logging, and transaction management
    that can be shared across all repository implementations.
    """
    
    def __init__(self, db_path: str = "email_management.db"):
        """
        Initialize the repository with database connection.
        
        Args:
            db_path: Path to the SQLite database file
        """
        self.db_path = db_path
        self.logger = logging.getLogger(self.__class__.__name__)
        
    def get_connection(self) -> sqlite3.Connection:
        """
        Get a database connection with proper configuration.
        
        Returns:
            sqlite3.Connection: Configured database connection
        """
        try:
            conn = sqlite3.connect(self.db_path)
            conn.row_factory = sqlite3.Row  # Enable dict-like access to rows
            return conn
        except sqlite3.Error as e:
            self.logger.error(f"Failed to connect to database: {e}")
            raise DatabaseError(f"Database connection failed: {e}")
    
    @contextmanager
    def get_db_connection(self):
        """
        Context manager for database connections with automatic cleanup.
        
        Yields:
            sqlite3.Connection: Database connection
        """
        conn = None
        try:
            conn = self.get_connection()
            yield conn
        except sqlite3.Error as e:
            self.logger.error(f"Database error: {e}")
            if conn:
                conn.rollback()
            raise DatabaseError(f"Database operation failed: {e}")
        finally:
            if conn:
                conn.close()
    
    @contextmanager
    def get_transaction(self):
        """
        Context manager for database transactions with automatic commit/rollback.
        
        Yields:
            sqlite3.Connection: Database connection with transaction
        """
        conn = None
        try:
            conn = self.get_connection()
            conn.execute("BEGIN")
            yield conn
            conn.commit()
        except Exception as e:
            self.logger.error(f"Transaction failed: {e}")
            if conn:
                conn.rollback()
            raise DatabaseError(f"Transaction failed: {e}")
        finally:
            if conn:
                conn.close()
    
    def execute_query(self, query: str, params: Optional[Tuple] = None) -> List[Dict[str, Any]]:
        """
        Execute a SELECT query and return results.
        
        Args:
            query: SQL query string
            params: Query parameters tuple
            
        Returns:
            List[Dict[str, Any]]: Query results as list of dictionaries
        """
        try:
            with self.get_db_connection() as conn:
                cursor = conn.cursor()
                if params:
                    cursor.execute(query, params)
                else:
                    cursor.execute(query)
                
                results = cursor.fetchall()
                return [dict(row) for row in results]
                
        except sqlite3.Error as e:
            self.logger.error(f"Query execution failed: {query} - {e}")
            raise DatabaseError(f"Query execution failed: {e}")
    
    def execute_update(self, query: str, params: Optional[Tuple] = None) -> int:
        """
        Execute an UPDATE, INSERT, or DELETE query.
        
        Args:
            query: SQL query string
            params: Query parameters tuple
            
        Returns:
            int: Number of affected rows
        """
        try:
            with self.get_db_connection() as conn:
                cursor = conn.cursor()
                if params:
                    cursor.execute(query, params)
                else:
                    cursor.execute(query)
                
                conn.commit()
                return cursor.rowcount
                
        except sqlite3.Error as e:
            self.logger.error(f"Update execution failed: {query} - {e}")
            raise DatabaseError(f"Update execution failed: {e}")
    
    def execute_insert(self, query: str, params: Optional[Tuple] = None) -> int:
        """
        Execute an INSERT query and return the last inserted row ID.
        
        Args:
            query: SQL query string
            params: Query parameters tuple
            
        Returns:
            int: Last inserted row ID
        """
        try:
            with self.get_db_connection() as conn:
                cursor = conn.cursor()
                if params:
                    cursor.execute(query, params)
                else:
                    cursor.execute(query)
                
                conn.commit()
                return cursor.lastrowid
                
        except sqlite3.Error as e:
            self.logger.error(f"Insert execution failed: {query} - {e}")
            raise DatabaseError(f"Insert execution failed: {e}")
    
    def execute_batch(self, query: str, params_list: List[Tuple]) -> int:
        """
        Execute a batch of operations with the same query.
        
        Args:
            query: SQL query string
            params_list: List of parameter tuples
            
        Returns:
            int: Number of affected rows
        """
        try:
            with self.get_transaction() as conn:
                cursor = conn.cursor()
                cursor.executemany(query, params_list)
                return cursor.rowcount
                
        except sqlite3.Error as e:
            self.logger.error(f"Batch execution failed: {query} - {e}")
            raise DatabaseError(f"Batch execution failed: {e}")
    
    def table_exists(self, table_name: str) -> bool:
        """
        Check if a table exists in the database.
        
        Args:
            table_name: Name of the table to check
            
        Returns:
            bool: True if table exists, False otherwise
        """
        query = """
            SELECT name FROM sqlite_master 
            WHERE type='table' AND name=?
        """
        
        try:
            results = self.execute_query(query, (table_name,))
            return len(results) > 0
        except DatabaseError:
            return False
    
    def get_table_schema(self, table_name: str) -> List[Dict[str, Any]]:
        """
        Get the schema information for a table.
        
        Args:
            table_name: Name of the table
            
        Returns:
            List[Dict[str, Any]]: Table schema information
        """
        query = f"PRAGMA table_info({table_name})"
        return self.execute_query(query)
    
    @abstractmethod
    def create_table(self) -> None:
        """
        Create the table for this repository.
        
        This method should be implemented by each specific repository
        to define its table structure.
        """
        pass
    
    @abstractmethod
    def get_all(self) -> List[Dict[str, Any]]:
        """
        Get all records from the repository.
        
        Returns:
            List[Dict[str, Any]]: All records
        """
        pass
    
    @abstractmethod
    def get_by_id(self, record_id: int) -> Optional[Dict[str, Any]]:
        """
        Get a record by its ID.
        
        Args:
            record_id: ID of the record to retrieve
            
        Returns:
            Optional[Dict[str, Any]]: Record if found, None otherwise
        """
        pass
    
    @abstractmethod
    def create(self, data: Dict[str, Any]) -> int:
        """
        Create a new record.
        
        Args:
            data: Record data
            
        Returns:
            int: ID of the created record
        """
        pass
    
    @abstractmethod
    def update(self, record_id: int, data: Dict[str, Any]) -> bool:
        """
        Update an existing record.
        
        Args:
            record_id: ID of the record to update
            data: Updated record data
            
        Returns:
            bool: True if update was successful, False otherwise
        """
        pass
    
    @abstractmethod
    def delete(self, record_id: int) -> bool:
        """
        Delete a record.
        
        Args:
            record_id: ID of the record to delete
            
        Returns:
            bool: True if deletion was successful, False otherwise
        """
        pass
