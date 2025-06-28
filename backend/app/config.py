from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    Using Pydantic's BaseSettings for type validation and environment loading.
    """
    # Database connection settings
    DB_SERVER: str
    DB_NAME: str
    DB_USER: str
    DB_PASSWORD: str
    DB_DRIVER: str
    
    # Table names
    EMAIL_TABLE: str
    TEMPLATE_TABLE: str
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


# Create a global settings instance to be imported and used by other modules
settings = Settings()


def get_settings():
    """
    Get the application settings.
    This function is provided for dependency injection in FastAPI.
    """
    return settings
