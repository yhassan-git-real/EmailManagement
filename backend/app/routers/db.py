from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
import logging
from ..db_utils import test_connection

# Configure logging
logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/database",
    tags=["database"],
    responses={404: {"description": "Not found"}},
)


class ConnectionRequest(BaseModel):
    """Request model for database connection testing."""
    server: Optional[str] = Field(None, description="SQL Server name")
    database: Optional[str] = Field(None, description="Database name")
    username: Optional[str] = Field(None, description="Database username")
    password: Optional[str] = Field(None, description="Database password")


class ConnectionResponse(BaseModel):
    """Response model for database connection testing."""
    success: bool
    message: str


@router.post("/test", response_model=ConnectionResponse)
async def test_db_connection(connection_info: ConnectionRequest):
    """
    Test the database connection with provided credentials.
    If no credentials are provided, defaults from .env will be used.
    
    Returns:
        JSON response with success status and message
    """
    logger.info("Received database connection test request")
    
    # Convert Pydantic model to dict, excluding None values
    # Handle both Pydantic v1 and v2 model_dump method
    try:
        # Pydantic v2
        connection_params = connection_info.model_dump(exclude_none=True)
    except AttributeError:
        # Fallback to Pydantic v1
        connection_params = connection_info.dict(exclude_none=True)
    
    # Test the connection
    success, message = test_connection(connection_params)
    
    # Return the result
    return ConnectionResponse(success=success, message=message)
