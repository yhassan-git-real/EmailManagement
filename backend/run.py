import uvicorn
import logging
import sys
import os

# Add the current directory to Python's path
sys.path.insert(0, os.path.abspath("."))

if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    )
    logger = logging.getLogger(__name__)
    
    logger.info("Starting EmailManagement API server")
    
    # Run the FastAPI application
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
