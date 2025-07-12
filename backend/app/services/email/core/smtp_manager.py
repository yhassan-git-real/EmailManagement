"""
SMTP management utilities for email sending.

This module provides SMTP connection management and email sending functionality.
"""

import smtplib
from typing import Tuple

class SMTPManager:
    """
    Manages SMTP connections and email sending operations.
    
    This class encapsulates SMTP server configuration and provides methods
    for connection testing and message sending.
    """
    def __init__(self, smtp_server: str, port: int, username: str, password: str, use_tls: bool = True):
        """
        Initialize SMTP manager with connection parameters.
        
        Args:
            smtp_server: SMTP server hostname
            port: SMTP server port
            username: SMTP username
            password: SMTP password
            use_tls: Whether to use TLS encryption
        """
        self.smtp_server = smtp_server
        self.port = port
        self.username = username
        self.password = password
        self.use_tls = use_tls
    
    def check_smtp_connection(self) -> Tuple[bool, str]:
        """Check if connection to SMTP server can be established"""
        try:
            with smtplib.SMTP(self.smtp_server, self.port) as server:
                if self.use_tls:
                    server.starttls()
                server.login(self.username, self.password)
            return True, ""
        except Exception as e:
            return False, str(e)
    
    def send_message(self, msg):
        """
        Send email message via SMTP.
        
        Args:
            msg: Email message object to send
            
        Raises:
            smtplib.SMTPException: If sending fails
        """
        with smtplib.SMTP(self.smtp_server, self.port) as server:
            if self.use_tls:
                server.starttls()
            server.login(self.username, self.password)
            server.send_message(msg)
