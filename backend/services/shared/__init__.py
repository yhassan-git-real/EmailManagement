"""
Shared utilities package for the email management system.

This package provides common utilities, patterns, and components
that are used across multiple services including database operations,
validation, and other shared functionality.
"""

# Database utilities
from .database import BaseRepository, DatabaseError

# Validation utilities
from .validation import DataValidator, ValidationError, EmailStatus

__all__ = [
    # Database utilities
    'BaseRepository',
    'DatabaseError',
    
    # Validation utilities
    'DataValidator',
    'ValidationError',
    'EmailStatus',
]

# Version information
__version__ = '1.0.0'
__author__ = 'Email Management System'
__description__ = 'Shared utilities for email management services'
