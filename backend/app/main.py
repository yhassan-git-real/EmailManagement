from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
import sys
import os
from .api.endpoints import database, emails, automation
from .api import email_records_router
from .core.config import settings

# Ensure all loggers are set to the appropriate level
# Don't remove handlers as that's handled in run.py
logger = logging.getLogger(__name__)

# Create the FastAPI application
app = FastAPI(
    title="EmailManagement API",
    description="Backend API for EmailManagement application",
    version="0.1.0",
)

# Add CORS middleware for frontend integration
# Add CORS middleware for frontend integration
try:
    cors_origins = settings.CORS_ORIGINS
    if not cors_origins or not isinstance(cors_origins, list):
        cors_origins = ["*"]  # Fallback to allow all origins
        
    app.add_middleware(
        CORSMiddleware,
        allow_origins=cors_origins,
        allow_credentials=settings.CORS_ALLOW_CREDENTIALS,
        allow_methods=settings.CORS_ALLOW_METHODS or ["*"],
        allow_headers=settings.CORS_ALLOW_HEADERS or ["*"],
    )
    logger.info(f"CORS middleware configured with origins: {cors_origins}")
except Exception as e:
    # Fallback to a permissive CORS configuration
    logger.warning(f"Error configuring CORS from settings: {str(e)}. Using default permissive settings.")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Include routers
app.include_router(database.router, prefix="/api/database", tags=["database"])
app.include_router(emails.router, prefix="/api/email", tags=["email"])
app.include_router(automation.router, prefix="/api/automation", tags=["automation"])
# Include the new Email Records router
app.include_router(email_records_router.router, prefix="/api", tags=["email-records"])

# Import templates router
from .api.endpoints import templates
app.include_router(templates.router, prefix="/api/templates", tags=["templates"])


@app.get("/")
async def root():
    """Root endpoint to verify API is running."""
    return {"message": "Welcome to EmailManagement API", "status": "operational"}


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


@app.get("/api/config")
async def show_config():
    """Show current configuration (with sensitive data masked)."""
    return {
        "db_server": settings.DB_SERVER,
        "db_name": settings.DB_NAME,
        "db_user": settings.DB_USER,
        "db_password": "********",
        "db_driver": settings.DB_DRIVER,
        "email_table": settings.EMAIL_TABLE
    }
