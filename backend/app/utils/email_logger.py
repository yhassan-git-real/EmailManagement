import os
import logging
import json
from datetime import datetime
from logging.handlers import RotatingFileHandler
from typing import List, Dict, Any, Optional
from .file_utils import format_file_size

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
        
        # Add file handler to logger
        logger.addHandler(file_handler)
        
        # Make sure propagation is enabled to ensure the root logger's handlers see these logs
        logger.propagate = True
        
        return logger
        
    def log_info(self, message: str, email_id: Optional[int] = None, recipient: Optional[str] = None, 
                  subject: Optional[str] = None, status: Optional[str] = None, 
                  file_name: Optional[str] = None, file_path: Optional[str] = None):
        """Log an informational message with additional email-specific data"""
        self._log_with_data(logging.INFO, message, email_id, recipient, subject, status, file_name, file_path)
        
    def log_error(self, message: str, email_id: Optional[int] = None, recipient: Optional[str] = None,
                   subject: Optional[str] = None, status: Optional[str] = None, 
                   file_name: Optional[str] = None, file_path: Optional[str] = None):
        """Log an error message with additional email-specific data"""
        self._log_with_data(logging.ERROR, message, email_id, recipient, subject, status, file_name, file_path)
    
    def _log_with_data(self, level: int, message: str, email_id: Optional[int] = None, 
                       recipient: Optional[str] = None, subject: Optional[str] = None,
                       status: Optional[str] = None, file_name: Optional[str] = None,
                       file_path: Optional[str] = None):
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
        if file_path is not None:
            log_data["file_path"] = file_path
            
        # Convert to JSON for structured logging
        json_data = json.dumps(log_data)
        
        # Also log to root logger with a standard format
        if level == logging.INFO:
            # Log to our file logger (as JSON)
            self.logger.info(json_data)
            
            # Also log to the root logger (via direct printing) as a formatted string
            # This will be picked up by the console output with our custom formatter
            prefix = ""
            emoji = ""
            
            # Import colorama here to avoid circular imports
            from colorama import Fore, Style, init
            
            # Force colorama initialization for direct print statements
            # This ensures PowerShell sees the colors correctly
            init(autoreset=True, strip=False, convert=True)
            
            # Add category prefix with color
            if "Google Drive" in message or "GDrive" in message:
                prefix = f"{Fore.MAGENTA}[GDRIVE]{Style.RESET_ALL} "
            elif "Email transaction" in message or "Email sent" in message:
                prefix = f"{Fore.BLUE}[EMAIL]{Style.RESET_ALL} "
            elif "template" in message.lower():
                prefix = f"{Fore.CYAN}[TEMPLATE]{Style.RESET_ALL} "
            elif "compressed" in message.lower() or "attachment" in message.lower():
                prefix = f"{Fore.BLUE}[ATTACHMENT]{Style.RESET_ALL} "
            elif "updated" in message.lower() and "status" in message.lower():
                prefix = f"{Fore.YELLOW}[DB]{Style.RESET_ALL} "
            elif "authenticated" in message.lower() or "authentication" in message.lower():
                prefix = f"{Fore.RED}[AUTH]{Style.RESET_ALL} "
            else:
                prefix = f"{Fore.BLUE}[EMAIL]{Style.RESET_ALL} "
                
            # Add emoji based on message content
            if "SUCCESS:" in message or ("Success" in message and "status" in message.lower()):
                emoji = "✅ "
            elif "ERROR:" in message or "Failed" in message or "Error" in message:
                emoji = "❌ "
            elif "uploaded to Google Drive" in message:
                emoji = "📤 "
            elif "compressed successfully" in message:
                emoji = "🗜️ "
            elif "authenticated with Google Drive" in message:
                emoji = "🔐 "
            elif "Using template" in message:
                emoji = "📝 "
            elif "Email sent" in message:
                emoji = "📧 "
            elif "Updated email" in message and "Success" in message:
                emoji = "🔄 "
            elif "Email processing result" in message:
                emoji = "📊 "
            elif "Logs cleared" in message:
                emoji = "🧹 "
            
            print(f"EMAIL AUTOMATION: {prefix}{emoji}{message}")
            
        elif level == logging.ERROR:
            # Import colorama here to avoid circular imports
            from colorama import Fore, Style
            self.logger.error(json_data)
            print(f"EMAIL AUTOMATION ERROR: {Fore.RED}❌ {message}{Style.RESET_ALL}")
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
        # Determine appropriate emoji based on status and reason
        emoji = ""
        if status == "Success":
            emoji = "✅ "
            if "Google Drive" in reason or "GDrive" in reason:
                emoji = "📤 "
            elif "attachment" in reason:
                emoji = "📧 "
        else:
            emoji = "❌ "
            
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
        
        # Format file sizes as human-readable if provided
        if original_size is not None:
            original_size_formatted = format_file_size(original_size)
            log_data["original_size"] = original_size
            log_data["original_size_formatted"] = original_size_formatted
            # Add file size to message if available
            if compressed_size is not None:
                compressed_size_formatted = format_file_size(compressed_size)
                compression_ratio = (1 - (compressed_size / original_size)) * 100 if original_size > 0 else 0
                message += f" (Original: {original_size_formatted}, Compressed: {compressed_size_formatted}, Saved: {compression_ratio:.1f}%)"
                log_data["compressed_size"] = compressed_size
                log_data["compressed_size_formatted"] = compressed_size_formatted
                log_data["compression_ratio"] = f"{compression_ratio:.1f}%"
            else:
                message += f" (Size: {original_size_formatted})"
            
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
