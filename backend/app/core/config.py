from pydantic_settings import BaseSettings
from typing import Optional
from functools import lru_cache
from pydantic import validator


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    Using Pydantic's BaseSettings for type validation and environment loading.
    """
    # Application information
    APP_NAME: str = "EmailManagement API"
    APP_VERSION: str = "0.1.0"
    APP_DESCRIPTION: str = "Backend API for EmailManagement application"
    
    # API settings
    API_PORT: int = 8000
    API_PREFIX: str = "/api"
    
    # Database connection settings
    DB_SERVER: str
    DB_NAME: str
    DB_USER: str
    DB_PASSWORD: str
    DB_DRIVER: str
    
    # Table names
    EMAIL_TABLE: str
    
    # Email configuration settings
    SMTP_SERVER: Optional[str] = None
    SMTP_PORT: Optional[str] = "587"
    EMAIL_USERNAME: Optional[str] = None
    EMAIL_PASSWORD: Optional[str] = None
    SMTP_TLS: Optional[str] = "True"
    SENDER_EMAIL: Optional[str] = None
    
    # Path configurations - must be read from environment variables
    EMAIL_ARCHIVE_PATH: str
    LOG_DIR_PATH: str
    DEFAULT_EMAIL_TEMPLATE_PATH: Optional[str] = "templates/default_template.txt"
    
    # Email attachment size limits (in MB)
    EMAIL_MAX_SIZE_MB: int = 25
    EMAIL_SAFE_SIZE_MB: int = 20
    GDRIVE_UPLOAD_THRESHOLD_MB: int = 20
    
    # Google Drive configuration
    GDRIVE_CREDENTIALS_PATH: Optional[str] = "credentials/oauth_credentials.json"
    GDRIVE_TOKEN_PATH: Optional[str] = "credentials/token.pickle"
    GDRIVE_FOLDER_ID: Optional[str] = None  # Optional folder ID for uploads
    
    @validator('EMAIL_ARCHIVE_PATH')
    def validate_archive_path(cls, v):
        """
        Ensure the archive path is properly formatted.
        If it's a relative path, it will be used relative to the current working directory
        at runtime, rather than converted to absolute here.
        """
        if v and not v.strip():
            return "Email_Archive"
        return v
    
    # Stored Procedures
    SP_EMAIL_RECORDS_BY_STATUS: str = "GetEmailRecordsByStatus" 
    DB_SCHEMA: str = "dbo"
    
    # CORS settings - accepting string or list inputs
    CORS_ORIGINS: list[str] = ["*"]
    CORS_ALLOW_CREDENTIALS: bool = True
    CORS_ALLOW_METHODS: list[str] = ["*"]
    CORS_ALLOW_HEADERS: list[str] = ["*"]
    
    @validator('CORS_ORIGINS', 'CORS_ALLOW_METHODS', 'CORS_ALLOW_HEADERS', pre=True)
    def parse_cors_settings(cls, v):
        # Handle string inputs for CORS settings
        if isinstance(v, str):
            # Handle quoted JSON array format: '["*"]'
            if v.startswith('[') and v.endswith(']'):
                try:
                    import json
                    return json.loads(v)
                except Exception:
                    pass
                    
            # Handle single asterisk or quoted asterisk
            if v == "*" or v == '"*"':
                return ["*"]
                
            # Handle comma-separated values
            return [item.strip() for item in v.split(",") if item.strip()]
            
        # Handle list/sequence input
        return v
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    """
    Get the application settings.
    This function is provided for dependency injection in FastAPI.
    Uses lru_cache for performance optimization.
    """
    try:
        print("Loading settings...")
        settings = Settings()
        print(f"CORS_ORIGINS: {settings.CORS_ORIGINS}")
        print(f"CORS_ALLOW_METHODS: {settings.CORS_ALLOW_METHODS}")
        print(f"CORS_ALLOW_HEADERS: {settings.CORS_ALLOW_HEADERS}")
        return settings
    except Exception as e:
        print(f"Error loading settings: {str(e)}")
        raise


# For backwards compatibility and to avoid breaking existing imports
settings = get_settings()
