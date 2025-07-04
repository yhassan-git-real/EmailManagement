import uvicorn
import logging
import sys
import os
import re
from pathlib import Path
from dotenv import load_dotenv
import colorama
from colorama import Fore, Back, Style

# Add the current directory to Python's path
sys.path.insert(0, os.path.abspath("."))

# Initialize colorama for colored console output
# Note: PowerShell may have issues displaying ANSI colors in some versions
# In Windows Terminal or VSCode's integrated terminal, colors should work correctly
colorama.init(autoreset=True, strip=False, convert=True)

class ColoredFormatter(logging.Formatter):
    """Custom formatter with colored output and better formatting"""
    
    COLORS = {
        'DEBUG': Fore.CYAN,
        'INFO': Fore.GREEN,
        'WARNING': Fore.YELLOW,
        'ERROR': Fore.RED,
        'CRITICAL': Fore.RED + Style.BRIGHT + Back.WHITE,
    }
    
    CATEGORY_COLORS = {
        'EMAIL': Fore.BLUE + Style.BRIGHT,
        'GDRIVE': Fore.MAGENTA + Style.BRIGHT,
        'HTTP': Fore.CYAN + Style.BRIGHT,
        'API': Fore.CYAN,
        'DB': Fore.YELLOW,
        'SECURITY': Fore.RED + Style.BRIGHT,
        'SERVER': Fore.GREEN + Style.BRIGHT,
        'CONFIG': Fore.CYAN,
        'AUTOMATION': Fore.BLUE,
    }
    
    def __init__(self, detailed=False):
        self.detailed = detailed
        super().__init__(
            fmt='%(asctime)s %(levelname)-8s %(message)s', 
            datefmt='%Y-%m-%d %H:%M:%S'
        )
    
    def format(self, record):
        # Save the original format
        original_fmt = self._style._fmt
        original_level = record.levelname
        
        # Apply color to level name
        level_color = self.COLORS.get(record.levelname, Fore.WHITE)
        record.levelname = f"{level_color}{record.levelname}{Style.RESET_ALL}"
        
        # Special handling for email_automation logger
        if record.name == 'email_automation':
            # Parse JSON if present
            if isinstance(record.msg, str) and record.msg.startswith('{"timestamp":'):
                try:
                    # Extract message from JSON string using regex
                    message_match = re.search(r'"message":\s*"([^"]*)"', record.msg)
                    if message_match:
                        clean_message = message_match.group(1)
                        
                        # Extract additional fields if they exist
                        email_id_match = re.search(r'"email_id":\s*(\d+)', record.msg)
                        recipient_match = re.search(r'"recipient":\s*"([^"]*)"', record.msg)
                        subject_match = re.search(r'"subject":\s*"([^"]*)"', record.msg)
                        status_match = re.search(r'"status":\s*"([^"]*)"', record.msg)
                        file_path_match = re.search(r'"file_path":\s*"([^"]*)"', record.msg)
                        
                        # Identify category for coloring
                        category_color = Fore.WHITE
                        prefix = ""
                        
                        # Try to identify log category based on content
                        if "Google Drive" in clean_message or "GDrive" in clean_message or "Drive upload" in clean_message:
                            category_color = self.CATEGORY_COLORS['GDRIVE']
                            prefix = f"{category_color}[GDRIVE]{Style.RESET_ALL} "
                        elif "Email transaction" in clean_message or "Email sent" in clean_message or "email processing result" in clean_message:
                            category_color = self.CATEGORY_COLORS['EMAIL']
                            prefix = f"{category_color}[EMAIL]{Style.RESET_ALL} "
                        elif "template" in clean_message.lower():
                            category_color = self.CATEGORY_COLORS['EMAIL']
                            prefix = f"{category_color}[TEMPLATE]{Style.RESET_ALL} "
                        elif "compressed" in clean_message.lower() or "attachment" in clean_message.lower():
                            category_color = self.CATEGORY_COLORS['EMAIL']
                            prefix = f"{category_color}[ATTACHMENT]{Style.RESET_ALL} "
                        elif "authentication" in clean_message.lower() or "authenticated" in clean_message.lower():
                            category_color = self.CATEGORY_COLORS['SECURITY']
                            prefix = f"{category_color}[AUTH]{Style.RESET_ALL} "
                        elif "updated" in clean_message.lower() and "status" in clean_message.lower():
                            category_color = self.CATEGORY_COLORS['DB']
                            prefix = f"{category_color}[DB]{Style.RESET_ALL} "
                        
                        # Format the message more nicely with emojis
                        if "SUCCESS:" in clean_message:
                            success_part = clean_message.split("SUCCESS:")[1].strip()
                            clean_message = f"{Fore.GREEN}✅ SUCCESS:{Style.RESET_ALL} {success_part}"
                        elif "ERROR:" in clean_message:
                            error_part = clean_message.split("ERROR:")[1].strip()
                            clean_message = f"{Fore.RED}❌ ERROR:{Style.RESET_ALL} {error_part}"
                        elif "uploaded to Google Drive" in clean_message:
                            clean_message = f"{Fore.MAGENTA}📤 {clean_message}{Style.RESET_ALL}"
                        elif "compressed successfully" in clean_message:
                            clean_message = f"{Fore.BLUE}🗜️ {clean_message}{Style.RESET_ALL}"
                        elif "authenticated with Google Drive" in clean_message:
                            clean_message = f"{Fore.MAGENTA}🔐 {clean_message}{Style.RESET_ALL}"
                        elif "Using template" in clean_message:
                            clean_message = f"{Fore.CYAN}📝 {clean_message}{Style.RESET_ALL}"
                        elif "Email sent" in clean_message:
                            clean_message = f"{Fore.GREEN}📧 {clean_message}{Style.RESET_ALL}"
                        elif "Email transaction" in clean_message and "Success" in clean_message:
                            clean_message = f"{Fore.GREEN}✅ {clean_message}{Style.RESET_ALL}"
                        elif "Email transaction" in clean_message and "Failed" in clean_message:
                            clean_message = f"{Fore.RED}❌ {clean_message}{Style.RESET_ALL}"
                        elif "Updated email" in clean_message and "Success" in clean_message:
                            clean_message = f"{Fore.GREEN}🔄 {clean_message}{Style.RESET_ALL}"
                        elif "Updated email" in clean_message and "Failed" in clean_message:
                            clean_message = f"{Fore.RED}🔄 {clean_message}{Style.RESET_ALL}"
                        elif "Email processing result" in clean_message and "Success" in clean_message:
                            clean_message = f"{Fore.GREEN}✅ {clean_message}{Style.RESET_ALL}"
                        elif "Email processing result" in clean_message and "Failed" in clean_message:
                            clean_message = f"{Fore.RED}❌ {clean_message}{Style.RESET_ALL}"
                        elif status_match and "Success" in status_match.group(1):
                            clean_message = f"{Fore.GREEN}✅ {clean_message}{Style.RESET_ALL}"
                        elif status_match and "Failed" in status_match.group(1):
                            clean_message = f"{Fore.RED}❌ {clean_message}{Style.RESET_ALL}"
                        
                        record.msg = f"{prefix}{clean_message}"
                        
                        # Add details for email transactions if available and detailed mode is on
                        if self.detailed and email_id_match:
                            details = f"\n    ID: {email_id_match.group(1)}"
                            
                            if recipient_match:
                                details += f" | To: {recipient_match.group(1)}"
                            
                            if subject_match:
                                details += f" | Subject: {subject_match.group(1)}"
                                
                            if status_match:
                                status = status_match.group(1)
                                status_color = Fore.GREEN if "Success" in status else Fore.RED
                                details += f" | Status: {status_color}{status}{Style.RESET_ALL}"
                                
                            if file_path_match:
                                details += f" | File: {file_path_match.group(1)}"
                                
                            record.msg += details
                except Exception as e:
                    # If parsing fails, just use the original message
                    print(f"Error parsing JSON log: {e}")
                    pass
            return super().format(record)
            
        # Handle Uvicorn HTTP logs
        if hasattr(record, 'scope') or 'HTTP' in getattr(record, 'msg', ''):
            if isinstance(record.msg, str) and '"' in record.msg and 'HTTP' in record.msg:
                record.msg = f"{self.CATEGORY_COLORS['HTTP']}[HTTP]{Style.RESET_ALL} {record.msg}"
            return super().format(record)
            
        # Check for JSON format in message and parse it
        if isinstance(record.msg, str) and record.msg.startswith('{"timestamp":'):
            try:
                # Extract message from JSON string using regex
                message_match = re.search(r'"message":\s*"([^"]*)"', record.msg)
                if message_match:
                    clean_message = message_match.group(1)
                    
                    # Extract additional fields if they exist
                    email_id_match = re.search(r'"email_id":\s*(\d+)', record.msg)
                    recipient_match = re.search(r'"recipient":\s*"([^"]*)"', record.msg)
                    subject_match = re.search(r'"subject":\s*"([^"]*)"', record.msg)
                    status_match = re.search(r'"status":\s*"([^"]*)"', record.msg)
                    
                    # Identify category for coloring
                    category_color = Fore.WHITE
                    prefix = ""
                    
                    # Try to identify log category based on content
                    if "Google Drive" in clean_message or "GDrive" in clean_message or "Drive upload" in clean_message:
                        category_color = self.CATEGORY_COLORS['GDRIVE']
                        prefix = f"{category_color}[GDRIVE]{Style.RESET_ALL} "
                    elif "Email" in clean_message or "email" in clean_message or "SMTP" in clean_message:
                        category_color = self.CATEGORY_COLORS['EMAIL']
                        prefix = f"{category_color}[EMAIL]{Style.RESET_ALL} "
                    elif "API" in clean_message or "api" in clean_message:
                        category_color = self.CATEGORY_COLORS['API']
                        prefix = f"{category_color}[API]{Style.RESET_ALL} "
                    elif "DB" in clean_message or "database" in clean_message or "SQL" in clean_message:
                        category_color = self.CATEGORY_COLORS['DB']
                        prefix = f"{category_color}[DB]{Style.RESET_ALL} "
                    elif "server" in clean_message.lower() or "FastAPI" in clean_message or "uvicorn" in clean_message.lower():
                        category_color = self.CATEGORY_COLORS['SERVER']
                        prefix = f"{category_color}[SERVER]{Style.RESET_ALL} "
                    
                    # Format the message more nicely with emojis
                    if "SUCCESS:" in clean_message:
                        success_part = clean_message.split("SUCCESS:")[1].strip()
                        clean_message = f"{Fore.GREEN}✅ SUCCESS:{Style.RESET_ALL} {success_part}"
                    elif "ERROR:" in clean_message:
                        error_part = clean_message.split("ERROR:")[1].strip()
                        clean_message = f"{Fore.RED}❌ ERROR:{Style.RESET_ALL} {error_part}"
                    elif "uploaded to Google Drive" in clean_message:
                        clean_message = f"{Fore.MAGENTA}📤 {clean_message}{Style.RESET_ALL}"
                    elif "compressed successfully" in clean_message:
                        clean_message = f"{Fore.BLUE}🗜️ {clean_message}{Style.RESET_ALL}"
                    elif "authenticated with Google Drive" in clean_message:
                        clean_message = f"{Fore.MAGENTA}🔐 {clean_message}{Style.RESET_ALL}"
                    elif "Using template" in clean_message:
                        clean_message = f"{Fore.CYAN}📝 {clean_message}{Style.RESET_ALL}"
                    elif "Email sent" in clean_message:
                        clean_message = f"{Fore.GREEN}📧 {clean_message}{Style.RESET_ALL}"
                    elif "Email transaction" in clean_message and "Success" in clean_message:
                        clean_message = f"{Fore.GREEN}✅ {clean_message}{Style.RESET_ALL}"
                    elif "Email transaction" in clean_message and "Failed" in clean_message:
                        clean_message = f"{Fore.RED}❌ {clean_message}{Style.RESET_ALL}"
                    elif "Updated email" in clean_message and "Success" in clean_message:
                        clean_message = f"{Fore.GREEN}🔄 {clean_message}{Style.RESET_ALL}"
                    elif "Updated email" in clean_message and "Failed" in clean_message:
                        clean_message = f"{Fore.RED}🔄 {clean_message}{Style.RESET_ALL}"
                    elif "Email processing result" in clean_message and "Success" in clean_message:
                        clean_message = f"{Fore.GREEN}✅ {clean_message}{Style.RESET_ALL}"
                    elif "Email processing result" in clean_message and "Failed" in clean_message:
                        clean_message = f"{Fore.RED}❌ {clean_message}{Style.RESET_ALL}"
                    elif status_match and status_match.group(1) == "Success":
                        clean_message = f"{Fore.GREEN}✅ {clean_message}{Style.RESET_ALL}"
                    elif status_match and status_match.group(1) == "Failed":
                        clean_message = f"{Fore.RED}❌ {clean_message}{Style.RESET_ALL}"
                    
                    record.msg = f"{prefix}{clean_message}"
                    
                    # Add details for email transactions if available and detailed mode is on
                    if self.detailed and email_id_match and recipient_match and subject_match:
                        email_id = email_id_match.group(1)
                        recipient = recipient_match.group(1)
                        subject = subject_match.group(1)
                        status = status_match.group(1) if status_match else ""
                        
                        details = f"\n    ID: {email_id} | To: {recipient} | Subject: {subject}"
                        if status:
                            status_color = Fore.GREEN if status == "Success" else Fore.RED
                            details += f" | Status: {status_color}{status}{Style.RESET_ALL}"
                            
                        record.msg += details
            except Exception as e:
                # If parsing fails, just use the original message
                pass
        # Handle non-JSON messages (like from uvicorn)
        elif isinstance(record.msg, str):
            # Special handling for HTTP requests
            # Format HTTP access logs
            if " - \"" in record.msg and ("HTTP/1.1" in record.msg or "HTTP/2" in record.msg):
                # Example: 127.0.0.1:54846 - "GET /api/email/status-summary HTTP/1.1" 200
                try:
                    parts = record.msg.split(' - "')
                    if len(parts) == 2:
                        ip_port = parts[0].strip()
                        rest = parts[1].split('" ')
                        method_path = rest[0]
                        status_code = rest[1] if len(rest) > 1 else "???"
                        
                        # Extract method and path
                        method_parts = method_path.split(" ", 1)
                        if len(method_parts) == 2:
                            method = method_parts[0]
                            path = method_parts[1].split(" ")[0]  # Remove HTTP version
                            
                            # Filter out noisy API endpoints - OPTIONS and frequent polling endpoints
                            if method == "OPTIONS" or "/api/automation/status" in path or "/api/automation/logs" in path:
                                # Skip logging this message - return early
                                return ""
                            
                            # Color based on method
                            method_color = Fore.BLUE  # Default
                            method_icon = "🔄"
                            if method == "GET":
                                method_color = Fore.GREEN
                                method_icon = "📥"
                            elif method == "POST":
                                method_color = Fore.BLUE
                                method_icon = "📤"
                            elif method == "PUT":
                                method_color = Fore.YELLOW
                                method_icon = "📝"
                            elif method == "DELETE":
                                method_color = Fore.RED
                                method_icon = "🗑️"
                            
                            # Color based on status code
                            status_color = Fore.GREEN
                            status_icon = "✅"
                            if status_code.startswith("4"):
                                status_color = Fore.YELLOW
                                status_icon = "⚠️"
                            elif status_code.startswith("5"):
                                status_color = Fore.RED
                                status_icon = "❌"
                            
                            # Format the HTTP request nicely
                            record.msg = f"{self.CATEGORY_COLORS['HTTP']}[HTTP]{Style.RESET_ALL} {method_icon} {ip_port} {method_color}{method}{Style.RESET_ALL} {path} {status_color}{status_code} {status_icon}{Style.RESET_ALL}"
                except Exception:
                    # If parsing fails, just add HTTP prefix
                    record.msg = f"{self.CATEGORY_COLORS['HTTP']}[HTTP]{Style.RESET_ALL} {record.msg}"
            # Try to identify log category based on content
            elif "Google Drive" in record.msg or "GDrive" in record.msg:
                prefix = f"{self.CATEGORY_COLORS['GDRIVE']}[GDRIVE]{Style.RESET_ALL} "
                record.msg = f"{prefix}{record.msg}"
            elif "CONFIG:" in record.msg:
                prefix = f"{Fore.CYAN}[CONFIG]{Style.RESET_ALL} "
                record.msg = f"{prefix}{record.msg.replace('CONFIG: ', '')}"
            elif "SERVER:" in record.msg:
                prefix = f"{self.CATEGORY_COLORS['SERVER']}[SERVER]{Style.RESET_ALL} "
                record.msg = f"{prefix}{record.msg.replace('SERVER: ', '')}"
            elif "Email" in record.msg or "email" in record.msg or "SMTP" in record.msg:
                prefix = f"{self.CATEGORY_COLORS['EMAIL']}[EMAIL]{Style.RESET_ALL} "
                record.msg = f"{prefix}{record.msg}"
            elif "API" in record.msg or "api" in record.msg:
                prefix = f"{self.CATEGORY_COLORS['API']}[API]{Style.RESET_ALL} "
                record.msg = f"{prefix}{record.msg}"
            elif "DB" in record.msg or "database" in record.msg or "SQL" in record.msg:
                prefix = f"{self.CATEGORY_COLORS['DB']}[DB]{Style.RESET_ALL} "
                record.msg = f"{prefix}{record.msg}"
            elif "Will watch for changes" in record.msg:
                prefix = f"{self.CATEGORY_COLORS['SERVER']}[WATCH]{Style.RESET_ALL} "
                record.msg = f"{prefix}🔍 {record.msg}"
            elif "Uvicorn running on" in record.msg:
                server_url = re.search(r'(http://[^\s]+)', record.msg)
                if server_url:
                    url = server_url.group(1)
                    prefix = f"{self.CATEGORY_COLORS['SERVER']}[SERVER]{Style.RESET_ALL} "
                    record.msg = f"{prefix}🚀 Server started at {url}"
                else:
                    prefix = f"{self.CATEGORY_COLORS['SERVER']}[SERVER]{Style.RESET_ALL} "
                    record.msg = f"{prefix}🚀 {record.msg}"
            elif "Started server process" in record.msg:
                process_id = re.search(r'\[(\d+)\]', record.msg)
                if process_id:
                    pid = process_id.group(1)
                    prefix = f"{self.CATEGORY_COLORS['SERVER']}[SERVER]{Style.RESET_ALL} "
                    record.msg = f"{prefix}🔄 Server process started [PID: {pid}]"
                else:
                    prefix = f"{self.CATEGORY_COLORS['SERVER']}[SERVER]{Style.RESET_ALL} "
                    record.msg = f"{prefix}🔄 {record.msg}"
            elif "Application startup complete" in record.msg:
                prefix = f"{self.CATEGORY_COLORS['SERVER']}[SERVER]{Style.RESET_ALL} "
                record.msg = f"{prefix}✅ Application ready to serve requests"
            elif "change detected" in record.msg:
                prefix = f"{self.CATEGORY_COLORS['SERVER']}[RELOAD]{Style.RESET_ALL} "
                record.msg = f"{prefix}🔄 {record.msg}"
            elif "Loading settings" in record.msg:
                prefix = f"{self.CATEGORY_COLORS['SERVER']}[SERVER]{Style.RESET_ALL} "
                record.msg = f"{prefix}⚙️ {record.msg}"
            elif "server" in record.msg.lower() or "FastAPI" in record.msg or "uvicorn" in record.msg.lower():
                prefix = f"{self.CATEGORY_COLORS['SERVER']}[SERVER]{Style.RESET_ALL} "
                record.msg = f"{prefix}{record.msg}"
                
        # Apply the format with the modified record
        result = logging.Formatter.format(self, record)
        
        # Restore the original values
        record.levelname = original_level
        self._style._fmt = original_fmt
        
        return result

class UvicornFilter(logging.Filter):
    """Filter for uvicorn access logs"""
    
    def filter(self, record):
        # When using our custom formatter, we don't need the default uvicorn logs
        # as they would be duplicated
        return False


if __name__ == "__main__":
    # Initialize colorama for cross-platform colored output
    colorama.init(autoreset=True)
    
    # Set up root logger with custom formatter
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.INFO)
    
    # Remove any existing handlers
    for handler in root_logger.handlers[:]:
        root_logger.removeHandler(handler)
    
    # Add console handler with our custom formatter
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(ColoredFormatter(detailed=True))
    root_logger.addHandler(console_handler)
    
    # Create our module logger
    logger = logging.getLogger(__name__)
    
    # Ensure all loggers related to email automation have our custom handler and propagate correctly
    automation_related_loggers = [
        'email_automation',
        'app.services',
        'app.services.email_sender',
        'app.services.gdrive_service',
        'app.services.automation_service',
        'app.utils.email_logger',
    ]
    
    for logger_name in automation_related_loggers:
        module_logger = logging.getLogger(logger_name)
        module_logger.setLevel(logging.INFO)
        module_logger.propagate = True
    
    # Create a special handler for direct output for critical services
    for handler in logging.getLogger('email_automation').handlers:
        # Only keep file handlers for file logging
        if not isinstance(handler, logging.FileHandler) and not isinstance(handler, logging.handlers.RotatingFileHandler):
            logging.getLogger('email_automation').removeHandler(handler)
            
    # Add our console handler to email_automation logger for direct output
    logging.getLogger('email_automation').addHandler(console_handler)
    
    # Load environment variables from .env file
    env_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
    if os.path.exists(env_file):
        load_dotenv(env_file)
        logger.info(f"Loaded environment variables from {env_file}")
    else:
        logger.warning(f".env file not found at {env_file}")
    
    # Print loaded SMTP settings for debugging
    smtp_server = os.environ.get("SMTP_SERVER", "Not set")
    smtp_port = os.environ.get("SMTP_PORT", "Not set")
    email_username = os.environ.get("EMAIL_USERNAME", "Not set")
    email_password = os.environ.get("EMAIL_PASSWORD", "Not set")
    smtp_tls = os.environ.get("SMTP_TLS", "Not set")
    sender_email = os.environ.get("SENDER_EMAIL", "Not set")
    
    logger.info(f"CONFIG: SMTP_SERVER: {smtp_server}")
    logger.info(f"CONFIG: SMTP_PORT: {smtp_port}")
    logger.info(f"CONFIG: EMAIL_USERNAME: {email_username}")
    logger.info(f"CONFIG: EMAIL_PASSWORD: {'*' * len(email_password) if email_password != 'Not set' else 'Not set'}")
    logger.info(f"CONFIG: SMTP_TLS: {smtp_tls}")
    logger.info(f"CONFIG: SENDER_EMAIL: {sender_email}")
    
    # Create Email_Archive directory if it doesn't exist
    email_archive_path = os.environ.get("EMAIL_ARCHIVE_PATH", os.path.join(os.getcwd(), "Email_Archive"))
    os.makedirs(email_archive_path, exist_ok=True)
    logger.info(f"CONFIG: Email archive directory: {email_archive_path}")    
    # Load environment variables (if not already loaded)
    env_path = os.path.join(os.path.dirname(__file__), '.env')
    load_dotenv(dotenv_path=env_path)
      # Get port from environment variable through Settings class
    from app.core.config import get_settings
    settings = get_settings()
    api_port = settings.API_PORT
    
    logger.info(f"SERVER: Starting EmailManagement API server on port {api_port}")
    
    # Run the FastAPI application with modified logging config
    # Add Uvicorn's logs to our custom logging system
    uvicorn_access_logger = logging.getLogger("uvicorn.access")
    uvicorn_access_logger.handlers = []  # Remove default handlers
    uvicorn_access_logger.addHandler(console_handler)  # Add our custom handler
    uvicorn_access_logger.setLevel(logging.INFO)
    
    # Configure uvicorn with minimal logging config
    log_config = {
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": {
            "default": {
                "()": "uvicorn.logging.DefaultFormatter",
                "fmt": "%(message)s",
            },
        },
        "handlers": {
            "default": {
                "formatter": "default",
                "class": "logging.NullHandler",
            },
        },
        "loggers": {
            "uvicorn": {"handlers": ["default"], "level": "WARNING", "propagate": True},
            "uvicorn.error": {"handlers": ["default"], "level": "WARNING", "propagate": True},
            # Access logs will be handled by our custom formatter
            "uvicorn.access": {"handlers": ["default"], "level": "INFO", "propagate": True},
        },
    }    
    uvicorn.run(
        "app.main:app", 
        host="0.0.0.0", 
        port=api_port, 
        reload=True,
        log_config=log_config
    )
