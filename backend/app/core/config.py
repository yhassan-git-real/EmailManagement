from pydantic_settings import BaseSettings
from typing import Optional
from functools import lru_cache


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    Using Pydantic's BaseSettings for type validation and environment loading.
    """
    # Application information
    APP_NAME: str = "EmailManagement API"
    APP_VERSION: str = "0.1.0"
    APP_DESCRIPTION: str = "Backend API for EmailManagement application"
    
    # Database connection settings
    DB_SERVER: str
    DB_NAME: str
    DB_USER: str
    DB_PASSWORD: str
    DB_DRIVER: str
    
    # Table names
    EMAIL_TABLE: str
    TEMPLATE_TABLE: str
    
    # Email configuration settings
    SMTP_SERVER: Optional[str] = None
    SMTP_PORT: Optional[str] = "587"
    EMAIL_USERNAME: Optional[str] = None
    EMAIL_PASSWORD: Optional[str] = None
    SMTP_TLS: Optional[str] = "True"
    SENDER_EMAIL: Optional[str] = None
    EMAIL_ARCHIVE_PATH: Optional[str] = "Email_Archive"
    DEFAULT_EMAIL_TEMPLATE_PATH: Optional[str] = "./templates/default_template.txt"
    
    # API settings
    API_PREFIX: str = "/api"
    
    # CORS settings
    CORS_ORIGINS: list[str] = ["*"]  # For development; restrict in production
    CORS_ALLOW_CREDENTIALS: bool = True
    CORS_ALLOW_METHODS: list[str] = ["*"]
    CORS_ALLOW_HEADERS: list[str] = ["*"]
    
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
    return Settings()


# For backwards compatibility and to avoid breaking existing imports
settings = get_settings()
