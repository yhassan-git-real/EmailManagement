# EmailManagement Frontend

A professional web application for managing and sending emails to clients by retrieving data from a SQL Server database.

## Overview

The frontend provides a modern, responsive user interface for the EmailManagement application. It includes:

- Database connection interface
- Email status dashboard
- Email records management
- Email automation configuration
- Template management
- Various utilities for date handling, session management, and API communication

## Features

- **Database Connection Interface**: Connect to SQL Server databases
- **Email Status Report Viewer**: View sent, failed, and pending email statistics with interactive charts
- **Email Records Management**: View, filter, and edit email records with a modular component structure
- **Email Automation**: Configure email sending rules and schedules with a modular component architecture
- **Modern UI/UX**: Enhanced with animations, hover effects, and improved visual feedback
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Protected Routes**: Ensures database connection before accessing features

## Tech Stack

- **Framework**: React.js 18
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Routing**: React Router v6
- **Notifications**: React Toastify
- **Icons**: Heroicons
- **Rich Text Editing**: React Quill

## Workflow and Process

The frontend follows a modular component-based architecture with several key sections:

1. **Login Flow**:
   - User enters database connection credentials
   - Application validates credentials with backend
   - On successful connection, user is redirected to the home page

2. **Home Dashboard**:
   - Displays email status summary with modern metric cards
   - Provides quick links to main features with interactive animations
   - Shows connection information
   - Features enhanced chart sections with better headers and fade-in animations

3. **Email Records**:
   - Lists all email records with pagination using a modular component structure
   - Allows filtering and searching with dedicated hooks for state management
   - Provides editing capabilities through modal dialogs
   - Features bulk actions for efficient record management

4. **Automation**:
   - Configure email automation settings through modular components
   - Set up schedules for sending emails
   - Manage automation rules
   - Monitor automation status with real-time updates

## Getting Started

For detailed setup instructions, please refer to the comprehensive setup guide:

- [Frontend Setup Guide](../docs/FRONTEND_SETUP.md)

### Prerequisites

- Node.js 14.x or higher
- npm 6.x or higher

### Installation

#### Option 1: Using the Provided Scripts (Recommended)

1. From the project root, run:
   ```powershell
   # PowerShell
   .\start_frontend.ps1
   ```
   
   This script will:
   - Check for Node.js installation
   - Install dependencies if needed
   - Start the development server

#### Option 2: Manual Setup

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/email-management.git
   cd email-management/frontend
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Start the development server
   ```bash
   npm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) to view the application

### Building for Production

To create a production build:

```bash
npm run build
```

This creates optimized files in the `dist` directory that can be deployed to any static hosting service.

To preview the production build locally:

```bash
npm run preview
```

## Project Structure

```
frontend/
├── public/                    # Static assets
│   ├── favicon.ico            # Application icon
│   ├── index.html             # HTML template
│   └── manifest.json          # PWA manifest
├── src/                       # Source code
│   ├── assets/                # Image, icons, and fonts
│   ├── components/            # Reusable UI components
│   ├── pages/                 # Page components
│   │   ├── AutomateEmail/      # Email automation module
│   │   │   ├── components/      # UI components for automation
│   │   │   └── hooks/           # Custom hooks for automation state
│   │   ├── EmailRecords/       # Email records module
│   │   │   ├── components/      # UI components for records
│   │   │   └── hooks/           # Custom hooks for records state
│   │   └── Home/               # Home dashboard module
│   ├── styles/                # Styling for components
│   └── utils/                 # Utility functions
├── package.json               # Dependencies and scripts
├── postcss.config.js          # PostCSS configuration
├── tailwind.config.js         # Tailwind CSS configuration
├── vite.config.js             # Vite configuration
└── README.md                  # Frontend documentation
```

## Key Components and Their Purposes

### Pages

- **LoginPage**: Entry point where users connect to the database
- **HomePage**: Main dashboard showing email status and quick actions with modern UI elements
- **AutomateEmail**: Modular structure for email automation configuration
  - **Components**: AutomationControlPanel, StatusSummary, TemplateSettings, ArchiveManagement, EmailLogs
  - **Hooks**: useAutomationStatus, useAutomationSettings, useAutomationActions
- **EmailRecords**: Modular structure for email records management
  - **Components**: EmailRecordsTable, EmailRecordsFilterBar, EmailRecordsBulkActions, StatusBadge
  - **Hooks**: useEmailRecords, useEmailRecordActions, useEmailRecordSelection, useEmailRecordFilters

### Components

- **Header/BrandingHeader**: Application navigation and branding
- **DatabaseConnector**: Form for entering database credentials
- **StatusSummary**: Dashboard widget showing email status statistics with enhanced visualizations
- **ProtectedRoute**: Ensures routes are only accessible after database connection
- **Sidebar**: Navigation sidebar with collapsible design and improved interactions

### Utilities

- **apiClient.js**: Centralized API communication with the backend
- **sessionUtils.js**: Handles session storage for connection information
- **dateUtils.js**: Date formatting and manipulation functions

## API Integration

The frontend communicates with the backend through several API clients:

- **apiClient.js**: General API functions for database and email operations
- **emailRecordsApi.js**: Centralized API functions for email records management
- **automationApi.js**: Functions for email automation configuration and status monitoring

## License

This project is licensed under the MIT License.
