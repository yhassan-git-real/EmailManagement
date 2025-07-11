import re
from typing import Tuple

class ValidationUtils:
    def validate_email(self, email: str) -> Tuple[bool, str]:
        """
        Validate an email address format.
        
        Args:
            email: Email address to validate
        
        Returns:
            Tuple[bool, str]: (True, "") if valid, (False, error message) if invalid
        """
        if re.match(r"[^@]+@[^@]+\.[^@]+", email):
            return True, ""
        else:
            return False, "Invalid email format"

