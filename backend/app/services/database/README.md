# Database Service

The database service provides centralized database operations for the email management system. It is organized into core functionality and repository patterns for different data entities.

## Architecture

```
database/
├── __init__.py          # Main public API
├── core/                # Core database utilities
│   ├── __init__.py
│   ├── connection_manager.py  # Connection management with pooling
│   └── query_executor.py      # Query execution utilities
└── repositories/        # Data access layer
    ├── __init__.py
    ├── email_repository.py        # Email operations
    └── email_record_repository.py # Email record operations
```

## Core Components

### Connection Manager
- **Purpose**: Manages database connections with retry logic and pooling
- **Features**:
  - Connection pooling and caching
  - Automatic retry with exponential backoff
  - Connection validation
  - Thread-safe operations

### Query Executor
- **Purpose**: Provides utilities for executing SQL queries
- **Features**:
  - Simple query execution interface
  - Result formatting as dictionaries
  - Error handling and logging

### Repositories
- **Email Repository**: Handles email record CRUD operations
- **Email Record Repository**: Manages email record lifecycle and status updates

## Usage

### Basic Query Execution
```python
from services.database import execute_query

# Execute a simple query
results = execute_query("SELECT * FROM emails WHERE status = ?", {"status": "pending"})
```

### Using Connection Manager
```python
from services.database import get_connection_manager

manager = get_connection_manager()
connection = manager.get_connection()
```

### Repository Operations
```python
from services.database import get_email_records, update_email_status

# Get email records
emails = get_email_records(limit=10)

# Update email status
update_email_status(email_id=1, status="sent")
```

## Configuration

Database configuration is handled through the application settings and `db_utils`. The service automatically uses the configured connection string and handles all connection management internally.

## Error Handling

- Connection failures are handled with automatic retry
- Database errors are logged and re-raised with context
- Connection validation prevents stale connections
- Thread-safe operations ensure concurrent access safety

## Migration from Legacy Services

This service replaces the old `db_service.py` with a more structured approach:
- All previous functions are available through the main `__init__.py`
- Connection management is now centralized and more robust
- Repository pattern provides better organization for data access
