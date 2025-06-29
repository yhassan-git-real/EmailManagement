import uvicorn
import logging
import sys
import os
from pathlib import Path
from dotenv import load_dotenv

# Add the current directory to Python's path
sys.path.insert(0, os.path.abspath("."))

if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    )
    logger = logging.getLogger(__name__)
    
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
    
    logger.info(f"SMTP_SERVER: {smtp_server}")
    logger.info(f"SMTP_PORT: {smtp_port}")
    logger.info(f"EMAIL_USERNAME: {email_username}")
    logger.info(f"EMAIL_PASSWORD: {'*' * len(email_password) if email_password != 'Not set' else 'Not set'}")
    logger.info(f"SMTP_TLS: {smtp_tls}")
    logger.info(f"SENDER_EMAIL: {sender_email}")
    
    # Create Email_Archive directory if it doesn't exist
    email_archive_path = os.environ.get("EMAIL_ARCHIVE_PATH", os.path.join(os.getcwd(), "Email_Archive"))
    os.makedirs(email_archive_path, exist_ok=True)
    logger.info(f"Email archive directory: {email_archive_path}")
    
    logger.info("Starting EmailManagement API server")
    
    # Run the FastAPI application
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
