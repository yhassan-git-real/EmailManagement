import smtplib
from typing import Tuple

class SMTPManager:
    def __init__(self, smtp_server: str, port: int, username: str, password: str, use_tls: bool = True):
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
        """Send email message via SMTP"""
        with smtplib.SMTP(self.smtp_server, self.port) as server:
            if self.use_tls:
                server.starttls()
            server.login(self.username, self.password)
            server.send_message(msg)
