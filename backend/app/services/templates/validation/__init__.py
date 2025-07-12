"""
Template validation module.

This module provides functionality for validating email templates including:
- Template syntax validation
- Placeholder validation
- File access validation
- Content safety checks
"""

from .template_validator import (
    TemplateValidator,
    TemplateValidationError,
    validate_template
)

__all__ = [
    'TemplateValidator',
    'TemplateValidationError',
    'validate_template'
]
