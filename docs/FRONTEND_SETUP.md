# Frontend Setup Guide

This guide provides detailed instructions for setting up the EmailManagement frontend, which is built with React, Vite, and Tailwind CSS.

## Overview

The EmailManagement frontend provides a modern, responsive user interface for:
- Database connection interface
- Interactive email status dashboard with analytics
- Email records management with filtering and sorting
- Email automation configuration with scheduling
- Template management and preview
- Google Drive integration for large attachments
- Performance monitoring and metrics visualization

## Prerequisites

- Node.js 14.x or higher
- npm 6.x or higher

## Project Structure

The frontend follows a structured organization:

```
frontend/
├── public/                    # Static assets
│   ├── favicon.ico            # Application icon
│   ├── index.html             # HTML template
│   └── manifest.json          # PWA manifest
├── src/                       # Source code
│   ├── components/            # Reusable UI components
│   │   ├── Alert.jsx          # Alert message component
│   │   ├── BrandingHeader.jsx # Header for login page
│   │   ├── Breadcrumb.jsx     # Navigation breadcrumb
│   │   ├── DatabaseConnector.jsx # Database connection form
│   │   ├── EmailChart.jsx     # Chart for email analytics
│   │   ├── EmailStatusCard.jsx # Email status display card
│   │   ├── Footer.jsx         # Application footer
│   │   ├── Header.jsx         # Main application header
│   │   ├── HeaderNav.jsx      # Navigation in header
│   │   ├── MetricsPanel.jsx   # Dashboard metrics panel
│   │   ├── ProtectedRoute.jsx # Route protection wrapper
│   │   ├── Sidebar.jsx        # Application sidebar
│   │   ├── StatusBadge.jsx    # Status indicator
│   │   ├── StatusSummary.jsx  # Email status summary
│   │   ├── TemplateEditor.jsx # Email template editor
│   │   ├── TemplatePreview.jsx # Email template preview
│   │   └── Welcome.jsx        # Welcome message component
│   ├── features/              # Feature-specific components
│   │   └── email-records/     # Email records feature
│   │       ├── EmailRecordEditModal.jsx # Edit modal
│   │       ├── emailRecordsApi.js # API for email records
│   │       ├── EmailRecordsView.jsx # Main view component
│   │       └── index.js       # Feature entry point
│   ├── pages/                 # Page components
│   │   ├── AutomateEmail/     # Email automation pages
│   │   │   ├── AutomationDashboard.jsx # Automation dashboard
│   │   │   ├── AutomationSchedule.jsx # Schedule configuration
│   │   │   └── AutomationSettings.jsx # Automation settings
│   │   ├── EmailRecords/     # Email records pages
│   │   │   ├── EmailDetails.jsx # Email details view
│   │   │   └── EmailList.jsx # Email list view
│   │   ├── HomePage.jsx       # Main dashboard page
│   │   └── LoginPage.jsx      # Login/connection page
│   ├── utils/                 # Utility functions
│   │   ├── apiClient.js       # API communication
│   │   ├── automationApi.js   # Automation API client
│   │   ├── chartUtils.js      # Chart data formatting
│   │   ├── constants.js       # Application constants
│   │   ├── dateUtils.js       # Date formatting utilities
│   │   ├── fileUtils.js       # File handling utilities
│   │   ├── gdriveApi.js       # Google Drive API client
│   │   └── sessionUtils.js    # Session management
│   ├── App.js                 # Main application component
│   ├── index.css              # Global styles
│   └── index.jsx              # Application entry point
├── package.json               # Dependencies and scripts
├── postcss.config.js          # PostCSS configuration
├── tailwind.config.js         # Tailwind CSS configuration
├── vite.config.js             # Vite configuration
└── README.md                  # Frontend documentation
```

## Setup Methods

### Option 1: Using the Provided Scripts (Recommended)

1. From the project root directory, run the frontend with a single command:
   ```powershell
   .\start_frontend.ps1
   ```

   This script automatically:
   - Checks for Node.js installation
   - Installs dependencies if needed
   - Starts the production server

2. The frontend will be available at: http://localhost:5173

3. Open a browser and navigate to http://localhost:5173 to view the application.

### Option 2: Manual Setup

If you prefer to set up the frontend manually:

1. Navigate to the frontend directory:
   ```powershell
   cd frontend
   ```

2. Install dependencies:
   ```powershell
   npm install
   ```

3. Start the production server:
   ```powershell
   npm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) to view the application.

## Building for Production

To build the frontend for production deployment:

1. Using the provided script (from project root):
   ```powershell
   .\build_frontend.ps1
   ```

2. Or manually:
   ```powershell
   cd frontend
   npm run build
   ```

This will create an optimized production build in the `frontend/dist` directory that can be deployed to a web server.

## Application Workflow

The frontend follows a logical flow:

1. **Login Flow**:
   - User enters database connection credentials on the Login page
   - Application validates credentials with backend
   - On successful connection, user is redirected to the Home page

2. **Home Dashboard**:
   - Displays email status summary
   - Provides quick links to main features
   - Shows connection information

3. **Email Records**:
   - Lists all email records with pagination
   - Allows filtering, sorting, and searching
   - Provides editing and status management capabilities
   - Displays detailed email information and attachment links

4. **Automation**:
   - Configure email automation settings
   - Set up schedules for sending emails with recurring options
   - Manage automation rules and retry settings
   - Monitor automation processes with real-time status
   - View logs of automation activities

## Key Components and Their Purposes

### Pages

- **LoginPage**: Entry point where users connect to the database
- **HomePage**: Main dashboard showing email status and quick actions
- **AutomatePage**: Configuration for email automation rules
- **EmailRecordsPage**: Management of email records (viewing, editing, filtering)

### Components

- **Header/BrandingHeader**: Application navigation and branding
- **DatabaseConnector**: Form for entering database credentials
- **StatusSummary**: Dashboard widget showing email status statistics
- **ProtectedRoute**: Ensures routes are only accessible after database connection
- **Sidebar**: Navigation sidebar with collapsible design

### Utilities

- **apiClient.js**: Centralized API communication with the backend
- **sessionUtils.js**: Handles session storage for connection information
- **dateUtils.js**: Date formatting and manipulation functions

## API Integration

The frontend communicates with the backend through several API clients:

- **apiClient.js**: General API functions for database and email operations
- **emailRecordsApi.js**: Specific functions for email records management
- **automationApi.js**: Functions for email automation configuration
- **gdriveApi.js**: Functions for Google Drive integration
- **templateApi.js**: Functions for email template management

## Customization

### Styling

The application uses Tailwind CSS for styling. To customize the appearance:

1. Edit the `tailwind.config.js` file to modify colors, fonts, and other design tokens
2. Add custom styles in `src/index.css`

### API Endpoint Configuration

By default, the frontend connects to a backend at `http://localhost:8000`. To change this:

1. Open `src/utils/apiClient.js`
2. Modify the `API_BASE_URL` constant to point to your backend server

## Browser Compatibility

The application is designed to work with:
- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Edge (latest 2 versions)
- Safari (latest 2 versions)

## Troubleshooting

### Common Issues

1. **Node.js Version**
   - Ensure you have Node.js 14.x or higher installed
   - Check with: `node --version`

2. **Port Conflict**
   - If port 5173 is already in use, Vite will automatically try the next available port
   - Look for the URL in the terminal output when starting the production server

3. **Backend Connection Issues**
   - Check if the backend server is running
   - Verify the API_BASE_URL in apiClient.js matches your backend URL
   - Check browser console for CORS errors (ensure backend has proper CORS settings)

4. **Build Errors**
   - Run `npm run build` to see detailed error messages
   - Check for any dependencies that need updating: `npm update`

5. **White Screen/Blank Page**
   - Check browser console for JavaScript errors
   - Verify all dependencies are installed correctly
   - Try clearing your browser cache
