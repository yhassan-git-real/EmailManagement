"""
Shared validation utilities package.

This package provides common validation patterns and utilities
used across all services in the email management system.
"""

from .data_validators import DataValidator, ValidationError, EmailStatus

__all__ = [
    'DataValidator',
    'ValidationError',
    'EmailStatus',
]
