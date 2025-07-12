"""
Shared database utilities package.

This package provides common database patterns and utilities
used across all services in the email management system.
"""

from .base_repository import BaseRepository, DatabaseError

__all__ = [
    'BaseRepository',
    'DatabaseError',
]
