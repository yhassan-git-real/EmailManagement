"""
Data validation utilities for email management system.

This module provides common validation patterns including email validation,
status validation, and other data validation utilities used across services.
"""

import re
from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional, Union


class ValidationError(Exception):
    """Custom exception for validation errors."""
    pass


class EmailStatus(Enum):
    """Valid email statuses."""
    PENDING = "Pending"
    SUCCESS = "Success"
    FAILED = "Failed"
    
    @classmethod
    def is_valid(cls, status: str) -> bool:
        """Check if a status value is valid."""
        return status in [s.value for s in cls]
    
    @classmethod
    def get_valid_statuses(cls) -> List[str]:
        """Get list of all valid status values."""
        return [s.value for s in cls]


class DataValidator:
    """
    Common data validation utilities.
    
    Provides validation methods for various data types and formats
    commonly used in the email management system.
    """
    
    # Email validation regex pattern
    EMAIL_PATTERN = re.compile(
        r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    )
    
    # More strict email pattern for production use
    STRICT_EMAIL_PATTERN = re.compile(
        r'^[a-zA-Z0-9!#$%&\'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&\'*+/=?^_`{|}~-]+)*'
        r'@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?$'
    )
    
    @staticmethod
    def validate_email(email: str, strict: bool = False) -> bool:
        """
        Validate email address format.
        
        Args:
            email: Email address to validate
            strict: Whether to use strict validation pattern
            
        Returns:
            bool: True if email is valid, False otherwise
        """
        if not email or not isinstance(email, str):
            return False
            
        email = email.strip()
        if not email:
            return False
            
        pattern = DataValidator.STRICT_EMAIL_PATTERN if strict else DataValidator.EMAIL_PATTERN
        return pattern.match(email) is not None
    
    @staticmethod
    def validate_email_required(email: str, strict: bool = False) -> str:
        """
        Validate email address and raise exception if invalid.
        
        Args:
            email: Email address to validate
            strict: Whether to use strict validation pattern
            
        Returns:
            str: Validated email address
            
        Raises:
            ValidationError: If email is invalid
        """
        if not DataValidator.validate_email(email, strict):
            raise ValidationError(f"Invalid email address: {email}")
        return email.strip()
    
    @staticmethod
    def validate_status(status: str) -> bool:
        """
        Validate email status.
        
        Args:
            status: Status to validate
            
        Returns:
            bool: True if status is valid, False otherwise
        """
        if not status or not isinstance(status, str):
            return False
        return EmailStatus.is_valid(status.strip())
    
    @staticmethod
    def validate_status_required(status: str) -> str:
        """
        Validate email status and raise exception if invalid.
        
        Args:
            status: Status to validate
            
        Returns:
            str: Validated status
            
        Raises:
            ValidationError: If status is invalid
        """
        if not status or not isinstance(status, str):
            raise ValidationError("Status is required")
            
        status = status.strip()
        if not DataValidator.validate_status(status):
            valid_statuses = EmailStatus.get_valid_statuses()
            raise ValidationError(f"Invalid status: {status}. Valid statuses: {valid_statuses}")
        return status
    
    @staticmethod
    def validate_required_string(value: Any, field_name: str, min_length: int = 1, max_length: Optional[int] = None) -> str:
        """
        Validate a required string field.
        
        Args:
            value: Value to validate
            field_name: Name of the field for error messages
            min_length: Minimum length required
            max_length: Maximum length allowed (optional)
            
        Returns:
            str: Validated string
            
        Raises:
            ValidationError: If validation fails
        """
        if not value:
            raise ValidationError(f"{field_name} is required")
            
        if not isinstance(value, str):
            raise ValidationError(f"{field_name} must be a string")
            
        value = value.strip()
        if len(value) < min_length:
            raise ValidationError(f"{field_name} must be at least {min_length} characters long")
            
        if max_length and len(value) > max_length:
            raise ValidationError(f"{field_name} must be no more than {max_length} characters long")
            
        return value
    
    @staticmethod
    def validate_optional_string(value: Any, field_name: str, max_length: Optional[int] = None) -> Optional[str]:
        """
        Validate an optional string field.
        
        Args:
            value: Value to validate
            field_name: Name of the field for error messages
            max_length: Maximum length allowed (optional)
            
        Returns:
            Optional[str]: Validated string or None
            
        Raises:
            ValidationError: If validation fails
        """
        if value is None or value == "":
            return None
            
        if not isinstance(value, str):
            raise ValidationError(f"{field_name} must be a string")
            
        value = value.strip()
        if not value:
            return None
            
        if max_length and len(value) > max_length:
            raise ValidationError(f"{field_name} must be no more than {max_length} characters long")
            
        return value
    
    @staticmethod
    def validate_positive_integer(value: Any, field_name: str, required: bool = True) -> Optional[int]:
        """
        Validate a positive integer field.
        
        Args:
            value: Value to validate
            field_name: Name of the field for error messages
            required: Whether the field is required
            
        Returns:
            Optional[int]: Validated integer or None
            
        Raises:
            ValidationError: If validation fails
        """
        if value is None:
            if required:
                raise ValidationError(f"{field_name} is required")
            return None
            
        if isinstance(value, str):
            try:
                value = int(value)
            except ValueError:
                raise ValidationError(f"{field_name} must be a valid integer")
        
        if not isinstance(value, int):
            raise ValidationError(f"{field_name} must be an integer")
            
        if value <= 0:
            raise ValidationError(f"{field_name} must be a positive integer")
            
        return value
    
    @staticmethod
    def validate_datetime_string(value: Any, field_name: str, required: bool = True) -> Optional[str]:
        """
        Validate a datetime string in ISO format.
        
        Args:
            value: Value to validate
            field_name: Name of the field for error messages
            required: Whether the field is required
            
        Returns:
            Optional[str]: Validated datetime string or None
            
        Raises:
            ValidationError: If validation fails
        """
        if value is None or value == "":
            if required:
                raise ValidationError(f"{field_name} is required")
            return None
            
        if not isinstance(value, str):
            raise ValidationError(f"{field_name} must be a string")
            
        value = value.strip()
        if not value:
            if required:
                raise ValidationError(f"{field_name} is required")
            return None
            
        # Try to parse the datetime to validate format
        try:
            datetime.fromisoformat(value.replace('Z', '+00:00'))
        except ValueError:
            raise ValidationError(f"{field_name} must be a valid ISO datetime format")
            
        return value
    
    @staticmethod
    def validate_email_record(data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate an email record dictionary.
        
        Args:
            data: Dictionary containing email record data
            
        Returns:
            Dict[str, Any]: Validated email record data
            
        Raises:
            ValidationError: If validation fails
        """
        if not isinstance(data, dict):
            raise ValidationError("Email record data must be a dictionary")
            
        validated_data = {}
        
        # Validate email address
        if 'email' in data:
            validated_data['email'] = DataValidator.validate_email_required(data['email'])
        
        # Validate status
        if 'status' in data:
            validated_data['status'] = DataValidator.validate_status_required(data['status'])
        
        # Validate subject
        if 'subject' in data:
            validated_data['subject'] = DataValidator.validate_optional_string(
                data['subject'], 'subject', max_length=200
            )
        
        # Validate body
        if 'body' in data:
            validated_data['body'] = DataValidator.validate_optional_string(
                data['body'], 'body'
            )
        
        # Validate timestamps
        if 'created_at' in data:
            validated_data['created_at'] = DataValidator.validate_datetime_string(
                data['created_at'], 'created_at', required=False
            )
        
        if 'updated_at' in data:
            validated_data['updated_at'] = DataValidator.validate_datetime_string(
                data['updated_at'], 'updated_at', required=False
            )
        
        # Validate sent_at
        if 'sent_at' in data:
            validated_data['sent_at'] = DataValidator.validate_datetime_string(
                data['sent_at'], 'sent_at', required=False
            )
        
        # Copy over any other fields without validation (like id)
        for key, value in data.items():
            if key not in validated_data:
                validated_data[key] = value
        
        return validated_data
    
    @staticmethod
    def sanitize_html(html_content: str) -> str:
        """
        Basic HTML sanitization to prevent XSS attacks.
        
        Args:
            html_content: HTML content to sanitize
            
        Returns:
            str: Sanitized HTML content
        """
        if not html_content:
            return ""
        
        # Basic HTML escaping
        html_content = html_content.replace('&', '&amp;')
        html_content = html_content.replace('<', '&lt;')
        html_content = html_content.replace('>', '&gt;')
        html_content = html_content.replace('"', '&quot;')
        html_content = html_content.replace("'", '&#x27;')
        
        return html_content
    
    @staticmethod
    def validate_batch_data(data_list: List[Dict[str, Any]], validator_func) -> List[Dict[str, Any]]:
        """
        Validate a batch of data records.
        
        Args:
            data_list: List of data records to validate
            validator_func: Function to validate each record
            
        Returns:
            List[Dict[str, Any]]: List of validated records
            
        Raises:
            ValidationError: If validation fails for any record
        """
        if not isinstance(data_list, list):
            raise ValidationError("Batch data must be a list")
        
        if not data_list:
            raise ValidationError("Batch data cannot be empty")
        
        validated_records = []
        for i, record in enumerate(data_list):
            try:
                validated_record = validator_func(record)
                validated_records.append(validated_record)
            except ValidationError as e:
                raise ValidationError(f"Validation failed for record {i + 1}: {str(e)}")
        
        return validated_records
