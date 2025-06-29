import os
import logging
import json
from datetime import datetime
from logging.handlers import RotatingFileHandler
from typing import List, Dict, Any, Optional

class EmailLogger:
    """Enhanced logger for email transactions with detailed information"""
    
    def __init__(self):
        self.logger = self._setup_logger()
        self._log_entries = []  # In-memory cache of recent log entries for quick retrieval
        self._max_cache_size = 500  # Maximum number of log entries to keep in memory
        
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
        self.log_file_path = os.path.join(logs_dir, f'email_automation_{datetime.now().strftime("%Y%m%d")}.log')
        file_handler = RotatingFileHandler(
            self.log_file_path, 
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
        
        return logger

    def log_info(self, message: str, email_id: Optional[int] = None, recipient: Optional[str] = None, 
                  subject: Optional[str] = None, status: Optional[str] = None, 
                  file_name: Optional[str] = None):
        """Log an informational message with additional email-specific data"""
        self._log_with_data(logging.INFO, message, email_id, recipient, subject, status, file_name)
        
    def log_error(self, message: str, email_id: Optional[int] = None, recipient: Optional[str] = None,
                   subject: Optional[str] = None, status: Optional[str] = None, 
                   file_name: Optional[str] = None):
        """Log an error message with additional email-specific data"""
        self._log_with_data(logging.ERROR, message, email_id, recipient, subject, status, file_name)
    
    def _log_with_data(self, level: int, message: str, email_id: Optional[int] = None, 
                       recipient: Optional[str] = None, subject: Optional[str] = None,
                       status: Optional[str] = None, file_name: Optional[str] = None):
        """Internal method to log with additional structured data"""
        log_data = {
            "timestamp": datetime.now().isoformat(),
            "message": message
        }
        
        # Add optional fields if provided
        if email_id is not None:
            log_data["email_id"] = email_id
        if recipient is not None:
            log_data["recipient"] = recipient
        if subject is not None:
            log_data["subject"] = subject
        if status is not None:
            log_data["status"] = status
        if file_name is not None:
            log_data["file_name"] = file_name
        
        # Convert to JSON for structured logging
        json_data = json.dumps(log_data)
        
        # Log using the appropriate level
        if level == logging.INFO:
            self.logger.info(json_data)
        elif level == logging.ERROR:
            self.logger.error(json_data)
        else:
            self.logger.debug(json_data)
        
        # Add to in-memory cache for quick retrieval
        self._log_entries.append(log_data)
        
        # Keep cache size in check
        if len(self._log_entries) > self._max_cache_size:
            self._log_entries = self._log_entries[-self._max_cache_size:]
    
    def get_recent_logs(self, limit: int = 100, status_filter: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get the most recent log entries, optionally filtered by status"""
        if len(self._log_entries) == 0:
            self._load_logs_from_file()
            
        filtered_logs = self._log_entries
        
        # Apply status filter if provided
        if status_filter:
            filtered_logs = [log for log in filtered_logs if log.get("status") == status_filter]
            
        # Sort by timestamp (newest first) and limit the results
        sorted_logs = sorted(filtered_logs, key=lambda x: x.get("timestamp", ""), reverse=True)
        return sorted_logs[:limit]
    
    def _load_logs_from_file(self):
        """Load logs from file into memory cache if needed"""
        if not os.path.exists(self.log_file_path):
            return
            
        try:
            with open(self.log_file_path, "r", encoding="utf-8") as f:
                for line in f:
                    try:
                        # Extract JSON data from the log line
                        # Format is typically: "YYYY-MM-DD HH:MM:SS - LEVEL - JSON_DATA"
                        parts = line.split(" - ", 2)
                        if len(parts) >= 3:
                            json_data = parts[2].strip()
                            log_entry = json.loads(json_data)
                            self._log_entries.append(log_entry)
                    except json.JSONDecodeError:
                        # Skip lines that don't contain valid JSON
                        continue
                        
            # Keep only the most recent entries
            self._log_entries = self._log_entries[-self._max_cache_size:]
        except Exception as e:
            self.logger.error(f"Error loading logs from file: {str(e)}")
    
    def clear_logs(self):
        """Clear all logs"""
        # Clear in-memory cache
        self._log_entries = []
        
        # Create a new empty log file
        try:
            with open(self.log_file_path, "w", encoding="utf-8") as f:
                f.write("")  # Write empty file
            
            # Log that logs were cleared
            self.log_info("Logs cleared by user")
        except Exception as e:
            self.logger.error(f"Error clearing log file: {str(e)}")
    
    def log_email_transaction(self, email_id: Optional[int] = None, email: Optional[str] = None,
                             subject: Optional[str] = None, file_path: Optional[str] = None,
                             status: Optional[str] = None, reason: Optional[str] = None,
                             original_size: Optional[int] = None, compressed_size: Optional[int] = None):
        """
        Log an email transaction with detailed information
        
        Args:
            email_id: Database ID of the email
            email: Recipient email address
            subject: Email subject
            file_path: Path to the attachment folder
            status: Status of the email (Success/Failed)
            reason: Reason for success or failure
            original_size: Original size of attachment in bytes
            compressed_size: Compressed size of attachment in bytes
        """
        message = f"Email transaction: {status}"
        if reason:
            message += f" - {reason}"
            
        log_data = {
            "timestamp": datetime.now().isoformat(),
            "message": message,
            "email_id": email_id,
            "recipient": email,
            "subject": subject,
            "status": status,
        }
        
        # Add optional fields if provided
        if file_path:
            log_data["file_path"] = file_path
        if original_size is not None:
            log_data["original_size"] = original_size
        if compressed_size is not None:
            log_data["compressed_size"] = compressed_size
            
        # Convert to JSON for structured logging
        json_data = json.dumps(log_data)
        
        # Log using the appropriate level based on status
        if status == "Success":
            self.logger.info(json_data)
        else:
            self.logger.error(json_data)
            
        # Add to in-memory cache for quick retrieval
        self._log_entries.append(log_data)
        
        # Keep cache size in check
        if len(self._log_entries) > self._max_cache_size:
            self._log_entries = self._log_entries[-self._max_cache_size:]

# Create a singleton instance
email_logger = EmailLogger()
