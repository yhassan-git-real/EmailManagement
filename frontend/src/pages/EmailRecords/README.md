# Email Records Module

This module provides a comprehensive user interface for managing email records in the EmailManagement application. The module has been refactored to follow a modular structure with custom hooks for state management and separated UI components.

## Directory Structure

```
/pages/EmailRecords/
├── components/                     # UI components specific to Email Records
│   ├── EmailRecordEditModal.jsx    # Modal for editing email records
│   ├── EmailRecordsHeader.jsx      # Header section with title and date
│   ├── EmailRecordsToolbar.jsx     # Search, filter, and action buttons
│   └── EmailTable/                 # Table components
│       ├── EmailActionButtons.jsx  # Row action buttons component
│       ├── EmailFileLink.jsx       # File attachment link component
│       ├── StatusBadge.jsx         # Status indicator component
│       ├── EmailTableConfig.js     # Table configuration
│       └── index.js                # Table component exports
├── hooks/                          # Custom hooks for state management
│   ├── useEmailRecordActions.js    # Hooks for CRUD operations
│   ├── useEmailRecords.js          # Hooks for data fetching and pagination
│   ├── useEmailRecordSelection.js  # Hooks for row selection state
│   ├── useEmailRecordFilters.js    # Hooks for filter state and execution
│   └── useFilePreview.js           # Hooks for file preview functionality
├── EmailRecordsPage.jsx            # Main component that composes the page
├── index.js                        # Entry point with wrapper functionality
└── README.md                       # This documentation file
```

## API Integration

The Email Records module uses API functions from the centralized `emailRecordsApi.js` file for all backend communication:

- `fetchEmailTableData` - Get email records with pagination and filtering
- `updateEmailRecord` - Update an existing email record
- `updateEmailRecordStatus` - Update just the status of a record
- `deleteEmailRecord` - Delete a single email record
- `bulkDeleteEmailRecords` - Delete multiple email records at once
- `bulkUpdateEmailRecords` - Update multiple email records at once

## Key Features

1. **Data Table**: Interactive table with sorting, pagination, and selection
2. **Search & Filter**: Instant client-side filtering and server-side search
3. **Editing**: Modal dialog for editing record details
4. **Deletion**: Support for single or bulk record deletion
5. **File Preview**: Preview attached files

## Component Integration

The EmailRecordsPage component integrates with the main application layout including:

- Header with connection info
- Footer
- Breadcrumb navigation
- Main content layout

## Usage

```jsx
// In a route configuration - import directly from the directory
import EmailRecordsPage from './pages/EmailRecords';

// In a route component
<Route path="/email-records" element={<EmailRecordsPage connectionInfo={connectionInfo} onDisconnect={handleDisconnect} />} />
```

The index.js file exports a wrapper component that handles passing the connectionInfo and onDisconnect props to the main EmailRecordsPage component. This eliminates the need for a separate wrapper file.

## State Management

This module uses custom React hooks for state management, following a separation of concerns pattern:

- `useEmailRecords` - Manages data fetching, pagination, and filtering
- `useEmailRecordActions` - Manages CRUD operations (edit, save, delete)
- `useEmailRecordSelection` - Manages row selection state
- `useEmailRecordFilters` - Manages filter state and execution
- `useFilePreview` - Manages file preview functionality

## UI Components

The UI is composed of modular components:

- `EmailRecordsTable` - Configures and renders the data table
- `EmailRecordsFilterBar` - Search input, status filter dropdown, and execute button
- `EmailRecordsBulkActions` - Bulk edit and delete buttons
- `EmailRecordRowActions` - Per-row action buttons
- `StatusBadge` - Displays email status with color-coded styling
- `EmailRecordEditModal` - Form for editing email record details

## Main Container Component

The `index.jsx` file serves as the main container component that:

- Uses all custom hooks
- Orchestrates rendering of modular components
- Manages overall page layout

This modular structure improves code maintainability, separation of concerns, and developer experience.
