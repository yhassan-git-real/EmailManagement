from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any
from pydantic import BaseModel, Field
from typing import Optional
import logging

from ...services import database
from ...utils.db_utils import test_connection

router = APIRouter()

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
async def test_db_connection(connection_params: ConnectionRequest = None):
    """
    Test database connection with provided parameters or environment defaults.
    """
    try:
        params = connection_params.dict() if connection_params else None
        success, message = test_connection(params)
        return ConnectionResponse(success=success, message=message)
    except Exception as e:
        logger = logging.getLogger(__name__)
        logger.error(f"Database connection test failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database connection test failed: {str(e)}")
