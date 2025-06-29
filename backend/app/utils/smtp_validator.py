import smtplib
import logging
from typing import Dict, Tuple, Any

logger = logging.getLogger(__name__)

def validate_smtp_credentials(
    server: str, 
    port: int, 
    username: str, 
    password: str, 
    use_tls: bool = True
) -> Tuple[bool, str]:
    """
    Test SMTP credentials by attempting to connect and authenticate
    
    Args:
        server: SMTP server address
        port: SMTP server port 
        username: SMTP username
        password: SMTP password
        use_tls: Whether to use TLS
        
    Returns:
        Tuple of (success, message)
    """
    try:
        # Create SMTP connection
        with smtplib.SMTP(server, port, timeout=10) as smtp:
            # Connection established, now try TLS if required
            if use_tls:
                smtp.starttls()
            
            # Attempt login with credentials
            smtp.login(username, password)
            
            # If we get here, connection and auth were successful
            logger.info(f"SMTP validation successful for {username} on {server}:{port}")
            return True, "SMTP connection successful"
            
    except smtplib.SMTPAuthenticationError as e:
        error_msg = f"Authentication failed: {str(e)}"
        logger.warning(f"SMTP validation failed for {username}: {error_msg}")
        
        # Gmail-specific guidance
        if "gmail" in server.lower():
            if "5.7.8" in str(e) and "BadCredentials" in str(e):
                return False, "Gmail credentials rejected. Please ensure you're using an App Password if 2FA is enabled."
            elif "5.7.9" in str(e):
                return False, "Gmail blocked less secure app access. Use App Password or enable less secure app access."
        
        return False, error_msg
        
    except smtplib.SMTPException as e:
        error_msg = f"SMTP error: {str(e)}"
        logger.warning(f"SMTP validation failed for {username}: {error_msg}")
        return False, error_msg
        
    except Exception as e:
        error_msg = f"Connection error: {str(e)}"
        logger.warning(f"SMTP validation failed for {username}: {error_msg}")
        return False, error_msg
