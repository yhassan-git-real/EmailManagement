"""Mapping validator for recipient email validation"""

import os
import logging
from typing import Tuple, Optional

from ....utils.db_utils import get_db_connection
from ....core.config import get_settings

logger = logging.getLogger(__name__)


def _validate_recipient_mapping(email_id: int, recipient: str, file_path: str) -> Tuple[bool, Optional[str]]:
    """Validate that the recipient email matches the Email_id in the database"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        settings = get_settings()
        
        # Get the email address associated with this email_id
        query = f"""
            SELECT Email, File_Path FROM {settings.EMAIL_TABLE}
            WHERE Email_ID = ?
        """
        
        cursor.execute(query, [email_id])
        result = cursor.fetchone()
        
        if not result:
            return False, f"No email record found with ID {email_id}"
            
        db_email, db_file_path = result
        
        # Check if the recipient matches the database email
        if db_email.lower() != recipient.lower():
            return False, f"Recipient mismatch: {recipient} doesn't match record: {db_email}"
            
        # For file path, we just need to make sure it's the same as in DB
        # Sometimes paths might have different slashes or capitalization
        if db_file_path and file_path:
            norm_db_path = os.path.normpath(db_file_path).lower()
            norm_input_path = os.path.normpath(file_path).lower()
            
            if norm_db_path != norm_input_path:
                return False, f"File path mismatch: {file_path} doesn't match record: {db_file_path}"
        
        return True, None
    except Exception as e:
        logger.error(f"Error validating recipient mapping: {str(e)}")
        return False, f"Error validating recipient: {str(e)}"
    finally:
        if 'conn' in locals():
            conn.close()
