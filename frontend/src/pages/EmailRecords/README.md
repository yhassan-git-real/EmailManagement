# Email Records Module

This module provides a comprehensive user interface for managing email records in the EmailManagement application.

## Directory Structure

```
/pages/EmailRecords/
├── components/             # UI components specific to Email Records
│   ├── EmailRecordEditModal.jsx    # Modal for editing email records
│   ├── EmailRecordsHeader.jsx      # Header section with title and date
│   ├── EmailRecordsList.jsx        # Data table for displaying records
│   └── EmailRecordsToolbar.jsx     # Search, filter, and action buttons
├── hooks/                  # Custom hooks for state management
│   ├── useEmailRecordActions.js    # Hooks for edit, delete, etc.
│   └── useEmailRecords.js          # Hooks for data fetching and filtering
├── EmailRecordsPage.jsx    # Main component that composes the page
├── index.js                # Entry point with wrapper functionality
└── README.md               # This documentation file
```

## API Integration

The Email Records module uses API functions from the `/utils/emailRecordsApi.js` file for all backend communication:

- `fetchEmailTableData` - Get email records with pagination and filtering
- `updateEmailRecord` - Update an existing email record
- `updateEmailRecordStatus` - Update just the status of a record
- `deleteEmailRecord` - Delete a single email record

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

This module uses React hooks for state management:

- `useEmailRecords` - Manages data fetching, pagination, and filtering
- `useEmailRecordActions` - Manages CRUD operations and UI interactions
