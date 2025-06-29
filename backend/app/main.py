from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
from .api.endpoints import database, emails, automation
from .core.config import settings

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
# Set higher log levels for specific loggers to reduce noise
logging.getLogger('app.services.automation_service').setLevel(logging.WARNING)
logging.getLogger('app.api.endpoints.automation').setLevel(logging.WARNING)
logger = logging.getLogger(__name__)

# Create the FastAPI application
app = FastAPI(
    title="EmailManagement API",
    description="Backend API for EmailManagement application",
    version="0.1.0",
)

# Add CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development; restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(database.router, prefix="/api/database", tags=["database"])
app.include_router(emails.router, prefix="/api/email", tags=["email"])
app.include_router(automation.router, prefix="/api/automation", tags=["automation"])


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
        "email_table": settings.EMAIL_TABLE,
        "template_table": settings.TEMPLATE_TABLE
    }
