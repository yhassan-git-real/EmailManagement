import os
import logging
import json
import uuid
from datetime import datetime
from logging.handlers import RotatingFileHandler
from typing import List, Dict, Any, Optional
from .file_utils import format_file_size
import time

# Try to import colorama, but don't fail if it's not available
try:
    from colorama import Fore, Style, init
    init(autoreset=True, strip=False, convert=True)
    COLORAMA_AVAILABLE = True
except ImportError:
    COLORAMA_AVAILABLE = False
    
    # Define dummy color constants to avoid errors when colorama is not available
    class DummyColor:
        def __getattr__(self, name):
            return ""
    
    Fore = DummyColor()
    Style = DummyColor()
    
    # Let's log a warning so users know why they don't see colored output
    print("WARNING: colorama module not found, console output will not be colored.")
    print("To enable colored output, install colorama: pip install colorama")
    print("---------------------------------------------------------------")

class AutomationLogFilter(logging.Filter):
    """Filter for automation logs"""
    def filter(self, record):
        msg = record.getMessage().lower()
        return ("process" in msg or 
                "automation" in msg or 
                "trigger" in msg or 
                "start" in msg or
                "finish" in msg or
                "started" in msg or
                "completed" in msg or
                "scheduled" in msg)

class SuccessLogFilter(logging.Filter):
    """Filter for success logs"""
    def filter(self, record):
        return ("success" in record.getMessage().lower() and 
                record.levelno < logging.ERROR)

class EmailLogger:
    """Enhanced logger for email transactions with detailed information"""
    
    def __init__(self):
        self.logger = self._setup_logger()
        self._log_entries = []  # In-memory cache of recent log entries for quick retrieval
        self._max_cache_size = 500  # Maximum number of log entries to keep in memory
        self._process_start_times = {}  # Dictionary to track process start times
        self._current_process_id = None  # Track the current automation process
        self._active_processes = {}  # Track active processes with their details
        
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
        
        # Create a formatter that includes timestamp and process ID
        formatter = logging.Formatter(
            '%(asctime)s - %(levelname)s - %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
        
        # Use date-based log rotation rather than timestamp-based
        current_date = datetime.now().strftime("%Y%m%d")
        
        # Main automation log file - only includes automation process events
        self.automation_log_file_path = os.path.join(logs_dir, f'automation_{current_date}.log')
        automation_handler = RotatingFileHandler(
            self.automation_log_file_path, 
            maxBytes=10485760,  # 10MB
            backupCount=10
        )
        automation_handler.setLevel(logging.INFO)
        automation_handler.setFormatter(formatter)
        # Use custom filter class for automation logs
        automation_handler.addFilter(AutomationLogFilter())
        
        # Success log file - only includes successful email transactions
        self.success_log_file_path = os.path.join(logs_dir, f'success_{current_date}.log')
        success_handler = RotatingFileHandler(
            self.success_log_file_path, 
            maxBytes=5242880,  # 5MB
            backupCount=10
        )
        success_handler.setLevel(logging.INFO)
        success_handler.setFormatter(formatter)
        # Use custom filter class for success logs
        success_handler.addFilter(SuccessLogFilter())
        
        # Error log file - only includes failed email transactions
        self.error_log_file_path = os.path.join(logs_dir, f'error_{current_date}.log')
        error_handler = RotatingFileHandler(
            self.error_log_file_path,
            maxBytes=5242880,  # 5MB
            backupCount=10
        )
        error_handler.setLevel(logging.ERROR)
        error_handler.setFormatter(formatter)
        
        # Complete log file (for reference/debugging)
        self.log_file_path = os.path.join(logs_dir, f'email_automation_{current_date}.log')
        file_handler = RotatingFileHandler(
            self.log_file_path, 
            maxBytes=10485760,  # 10MB
            backupCount=5
        )
        file_handler.setLevel(logging.DEBUG)
        file_handler.setFormatter(formatter)
        
        # Add handlers to logger
        logger.addHandler(automation_handler)
        logger.addHandler(success_handler)
        logger.addHandler(error_handler)
        logger.addHandler(file_handler)
        
        # Make sure propagation is enabled to ensure the root logger's handlers see these logs
        logger.propagate = True
        
        return logger
        
    def log_info(self, message: str, email_id: Optional[int] = None, recipient: Optional[str] = None, 
                  subject: Optional[str] = None, status: Optional[str] = None, 
                  file_name: Optional[str] = None, file_path: Optional[str] = None,
                  process_id: Optional[str] = None):
        """Log an informational message with additional email-specific data"""
        # Add process information if available
        if process_id:
            if process_id in self._active_processes:
                # Get process information
                process_info = self._active_processes[process_id]
                
                # Calculate elapsed time
                elapsed_time = time.time() - process_info.get('start_time', time.time())
                elapsed_formatted = self._format_time(elapsed_time)
                
                # Add process info to message
                if not "Start" in message and not "Starting" in message:
                    message = f"[Process: {process_info.get('description', 'Unknown')}] {message} (Elapsed: {elapsed_formatted})"
        
        self._log_with_data(logging.INFO, message, email_id, recipient, subject, status, file_name, file_path)
        
    def log_warning(self, message: str, email_id: Optional[int] = None, recipient: Optional[str] = None,
                   subject: Optional[str] = None, status: Optional[str] = None, 
                   file_name: Optional[str] = None, file_path: Optional[str] = None,
                   process_id: Optional[str] = None):
        """Log a warning message with additional email-specific data"""
        # Add process information if available
        if process_id:
            if process_id in self._active_processes:
                # Get process information
                process_info = self._active_processes[process_id]
                
                # Calculate elapsed time
                elapsed_time = time.time() - process_info.get('start_time', time.time())
                elapsed_formatted = self._format_time(elapsed_time)
                
                # Add process info to message
                message = f"[Process: {process_info.get('description', 'Unknown')}] WARNING: {message} (Elapsed: {elapsed_formatted})"
            
        self._log_with_data(logging.WARNING, message, email_id, recipient, subject, status, file_name, file_path)
        
    def log_error(self, message: str, email_id: Optional[int] = None, recipient: Optional[str] = None,
                 subject: Optional[str] = None, status: Optional[str] = None, 
                 file_name: Optional[str] = None, file_path: Optional[str] = None,
                 process_id: Optional[str] = None):
        """Log an error message with additional email-specific data"""
        # Add process information if available
        if process_id:
            if process_id in self._active_processes:
                # Get process information
                process_info = self._active_processes[process_id]
                
                # Calculate elapsed time
                elapsed_time = time.time() - process_info.get('start_time', time.time())
                elapsed_formatted = self._format_time(elapsed_time)
                
                # Add process info to message
                message = f"[Process: {process_info.get('description', 'Unknown')}] ❌ {message} (Elapsed: {elapsed_formatted})"
            
        self._log_with_data(logging.ERROR, message, email_id, recipient, subject, status, file_name, file_path)
    
    def _log_with_data(self, level: int, message: str, email_id: Optional[int] = None, 
                       recipient: Optional[str] = None, subject: Optional[str] = None,
                       status: Optional[str] = None, file_name: Optional[str] = None,
                       file_path: Optional[str] = None):
        """Internal method to log with additional structured data"""
        log_data = {
            "timestamp": datetime.now().isoformat(),
            "message": message,
            "process_id": self._current_process_id
        }
        
        # Add optional fields if provided
        if email_id is not None:
            log_data["email_id"] = email_id
            # Track this email in the current process if one exists
            if self._current_process_id and email_id is not None:
                self.add_email_to_process(self._current_process_id, email_id)
                
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
        
        # Also log to console with colorful formatting
        if level == logging.INFO:
            # Log to our file logger (as JSON)
            self.logger.info(json_data)
            
            # Also log to the console as a formatted string
            # Add category prefix with color
            prefix = ""
            emoji = ""
            
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
            elif "process" in message.lower() or "automation" in message.lower():
                prefix = f"{Fore.GREEN}[PROCESS]{Style.RESET_ALL} "
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
            elif "Starting" in message or "started" in message:
                emoji = "🚀 "
            elif "completed" in message or "Completed" in message or "finished" in message:
                emoji = "🏁 "
            
            # Add process ID if available
            process_info = ""
            if self._current_process_id and "process" not in message.lower():
                process_info = f"{Fore.YELLOW}[PID:{self._current_process_id[-6:]}]{Style.RESET_ALL} "
            
            print(f"EMAIL AUTOMATION: {process_info}{prefix}{emoji}{message}")
                
        elif level == logging.ERROR:
            self.logger.error(json_data)
            
            # Add process ID if available
            process_info = ""
            if self._current_process_id:
                process_info = f"{Fore.YELLOW}[PID:{self._current_process_id[-6:]}]{Style.RESET_ALL} "
            
            print(f"EMAIL AUTOMATION ERROR: {process_info}{Fore.RED}❌ {message}{Style.RESET_ALL}")
                
        elif level == logging.WARNING:
            self.logger.warning(json_data)
            
            # Add process ID if available
            process_info = ""
            if self._current_process_id:
                process_info = f"{Fore.YELLOW}[PID:{self._current_process_id[-6:]}]{Style.RESET_ALL} "
            
            print(f"EMAIL AUTOMATION WARNING: {process_info}{Fore.YELLOW}⚠️ {message}{Style.RESET_ALL}")
                
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
                             original_size: Optional[int] = None, compressed_size: Optional[int] = None,
                             process_id: Optional[str] = None):
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
            process_id: Optional ID of the current automation process
        """
        # Use current process ID if one is active and none was provided
        if not process_id and self._current_process_id:
            process_id = self._current_process_id
            
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
            "process_id": process_id
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
        
        # Track this email in the process if a process_id was provided
        if process_id and email_id is not None:
            self.add_email_to_process(process_id, email_id)
            
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

    def start_process(self, process_id: Optional[str] = None, description: str = "Email Automation Process"):
        """
        Start tracking a process with the given ID
        
        Args:
            process_id: Unique identifier for the process. If None, one will be generated.
            description: Human-readable description of the process
            
        Returns:
            The process_id (either the one provided or a newly generated one)
        """
        # Generate process_id if none was provided
        if not process_id:
            process_id = f"proc_{uuid.uuid4().hex[:8]}_{datetime.now().strftime('%Y%m%d')}"
            
        # Store process information
        self._active_processes[process_id] = {
            'start_time': time.time(),
            'description': description,
            'email_ids': set(),  # Track email IDs processed in this automation run
            'status': 'running'
        }
        
        # Set as current process
        self._current_process_id = process_id
        
        # Log the start of the process
        self.log_info(f"Starting automation process: {description}", process_id=process_id)
        
        return process_id
        
    def end_process(self, process_id: str, status: str = "success", description: str = ""):
        """
        End tracking a process with the given ID
        
        Args:
            process_id: Unique identifier for the process
            status: Final status of the process (success, error, etc.)
            description: Additional details about the process completion
        """
        if process_id in self._active_processes:
            process_info = self._active_processes[process_id]
            
            # Calculate elapsed time
            elapsed_time = time.time() - process_info.get('start_time', time.time())
            elapsed_formatted = self._format_time(elapsed_time)
            
            # Prepare completion message
            message = f"Automation process completed: {status}"
            if description:
                message += f" - {description}"
                
            # Add stats if available
            if 'email_ids' in process_info:
                email_count = len(process_info['email_ids'])
                if email_count > 0:
                    message += f" - Processed {email_count} emails"
                
            message += f" (Total time: {elapsed_formatted})"
            
            # Log completion based on status
            if status.lower() == "success" or status.lower() == "completed":
                self.log_info(message, process_id=process_id)
            else:
                self.log_error(message, process_id=process_id)
                
            # Clean up
            del self._active_processes[process_id]
            
            # Clear current process if it matches
            if self._current_process_id == process_id:
                self._current_process_id = None
                
    def add_email_to_process(self, process_id: str, email_id: int):
        """Add an email ID to the tracked process"""
        if process_id in self._active_processes and email_id is not None:
            if 'email_ids' not in self._active_processes[process_id]:
                self._active_processes[process_id]['email_ids'] = set()
            self._active_processes[process_id]['email_ids'].add(email_id)
                
    def _format_time(self, seconds: float) -> str:
        """Format time in seconds to a human-readable string"""
        if seconds < 1:
            return f"{seconds*1000:.2f}ms"
        elif seconds < 60:
            return f"{seconds:.2f}s"
        else:
            minutes = int(seconds // 60)
            remaining_seconds = seconds % 60
            return f"{minutes}m {remaining_seconds:.2f}s"
            
    def get_process_id(self) -> Optional[str]:
        """Get the current process ID, if one is active"""
        return self._current_process_id
        
    def get_process_info(self, process_id: Optional[str] = None) -> Dict[str, Any]:
        """Get information about a process"""
        if not process_id:
            process_id = self._current_process_id
            
        if not process_id or process_id not in self._active_processes:
            return {}
            
        return self._active_processes[process_id].copy()
    
    def check_colorama_available(self):
        """Return whether colorama is available for console coloring"""
        return COLORAMA_AVAILABLE


# Create a singleton instance
email_logger = EmailLogger()
