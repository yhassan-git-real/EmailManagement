import os
import logging
from datetime import datetime
from logging.handlers import RotatingFileHandler

class EmailLogger:
    """Enhanced logger for email transactions with detailed information"""
    
    def __init__(self):
        self.logger = self._setup_logger()
        
    def _setup_logger(self):
        """Set up a dedicated logger for email transactions"""
        # Create logs directory if it doesn't exist
        logs_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'logs')
        os.makedirs(logs_dir, exist_ok=True)
        
        # Create a logger
        logger = logging.getLogger('email_automation')
        logger.setLevel(logging.DEBUG)
        
        # Remove existing handlers to avoid duplicate logs
        if logger.handlers:
            for handler in logger.handlers:
                logger.removeHandler(handler)
        
        # Create a formatter that includes timestamp
        formatter = logging.Formatter(
            '%(asctime)s - %(levelname)s - %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
        
        # File handler for all logs
        log_file = os.path.join(logs_dir, f'email_automation_{datetime.now().strftime("%Y%m%d")}.log')
        file_handler = RotatingFileHandler(
            log_file, 
            maxBytes=10485760,  # 10MB
            backupCount=10
        )
        file_handler.setLevel(logging.DEBUG)
        file_handler.setFormatter(formatter)
        
        # Console handler for debugging
        console_handler = logging.StreamHandler()
        console_handler.setLevel(logging.DEBUG)
        console_handler.setFormatter(formatter)
        
        # Add handlers to logger
        logger.addHandler(file_handler)
        logger.addHandler(console_handler)
        
        # Test log to verify it's working
        logger.info(f"EmailLogger initialized. Log file: {log_file}")
        
        return logger
    
    def log_email_transaction(self, email_id, email, subject, file_path, status, reason=None, 
                              original_size=None, compressed_size=None):
        """Log a detailed email transaction record"""
        transaction = {
            'email_id': email_id,
            'email': email,
            'subject': subject,
            'file_path': file_path,
            'original_size': f"{original_size} bytes" if original_size is not None else "N/A",
            'compressed_size': f"{compressed_size} bytes" if compressed_size is not None else "N/A",
            'status': status,
            'reason': reason or "N/A"
        }
        
        self.logger.info(f"Email Transaction: {transaction}")
        
    def log_error(self, message, exception=None):
        """Log an error with optional exception details"""
        if exception:
            self.logger.error(f"{message}: {str(exception)}")
        else:
            self.logger.error(message)
    
    def log_info(self, message):
        """Log an informational message"""
        self.logger.info(message)
    
    def log_warning(self, message):
        """Log a warning message"""
        self.logger.warning(message)
    
    def log_debug(self, message):
        """Log a debug message"""
        self.logger.debug(message)


# Create a singleton instance
email_logger = EmailLogger()
