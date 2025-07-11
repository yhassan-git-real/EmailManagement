# EmailManagement Application

A full-stack application for managing and sending emails to clients by retrieving data from a SQL Server database, with advanced automation capabilities and Google Drive integration for large attachments.

## Project Overview

EmailManagement is a comprehensive application designed to streamline the process of sending emails with attachments to clients. It interfaces with SQL Server databases to fetch recipient information, manages email templates, tracks email delivery status, and provides automation capabilities for scheduling and recurring emails.

## Project Structure

The project is organized into a monorepo with frontend and backend code separated:

```
EmailManagement/
├── frontend/               # React.js frontend application
│   ├── src/                # Source code for the frontend
│   │    ├── assets/        # Image and media assets
│   │    ├── components/    # Reusable React components
│   │    ├── pages/         # Page components
│   │    │    ├── AutomateEmail/  # Email automation module (modular structure)
│   │    │    │    ├── components/  # UI components for automation
│   │    │    │    └── hooks/       # Custom hooks for automation state
│   │    │    ├── EmailRecords/   # Email records module (modular structure)
│   │    │    │    ├── components/  # UI components for records
│   │    │    │    └── hooks/       # Custom hooks for records state
│   │    │    └── Home/           # Home dashboard module
│   │    ├── styles/        # Styling for the application
│   │    └── utils/         # Utility functions and hooks
│   ├── public/             # Static files
│   ├── dist/               # Production build output
│   ├── node_modules/       # Node.js dependencies
│   └── .vscode/            # VSCode configuration
├── backend/               # FastAPI Python backend
│   ├── app/               # Backend application logic
│   ├── database/          # Database connection and models
│   ├── templates/         # HTML templates for the backend
│   ├── Email_Archive/     # Archive of sent email attachments
│   ├── portable_python/   # Portable Python environment scripts
│   └── portable_venv/     # Virtual environment configurations
├── docs/                  # Detailed setup and documentation
├── scripts/               # Utility scripts for the project
└── credentials/           # Authentication credentials for integrations
```

## Workflow and Process

### Application Workflow

1. **Database Connection**:
   - Connect to a SQL Server database for recipient information.
   - Verify and establish the connection.

2. **Home Dashboard**:
   - Dashboard displays email status summaries and provides quick actions.

3. **Email Records Management**:
   - View, filter, and manage email records.

4. **Email Automation**:
   - Configure automation rules and templates.
   - Set schedules and recurring tasks.

5. **Large File Handling**:
   - Google Drive integration for attachments over 20MB.

### Development Workflow

1. **Local Development**:
   - Use scripts to run frontend and backend locally.
   - Make and test changes to the codebase.
 
2. **Building for Production**:
   - Build frontend and package backend for deployment.

## Features

- **Database Connection Interface**: Connect to SQL Server databases with secure credential management
- **Email Status Report Viewer**: View sent, failed, and pending email statistics with interactive charts
- **Modern UI/UX**: Clean, responsive home page with collapsible sidebar, enhanced animations, and interactive elements
- **Email Automation**: Set up automated email workflows, scheduling, and recurring rules with a modular component structure
- **Email Records Management**: Comprehensive interface for viewing, filtering, and editing email records with modular components
- **Template Management**: Create, preview, and manage reusable email templates
- **Large File Handling**: Google Drive integration for attachments over 20MB
- **Retry Mechanism**: Automated retry for failed emails with configurable intervals
- **Email Archiving**: Local archiving of sent email attachments for record keeping
- **Customizable Dashboard**: Interactive analytics and performance metrics with modern design elements

## Tech Stack

- **Frontend**: React.js with Tailwind CSS, Vite for build tooling, Chart.js for analytics
- **Backend**: FastAPI (Python 3.11) with async processing for email automation
- **Database**: Microsoft SQL Server with stored procedures for efficient data processing
- **Email**: SMTP integration with major email providers including Gmail
- **Integrations**: Google Drive API for large file storage and sharing
- **Authentication**: Secure credential management and session handling

## Quick Start

To run the application:

1. **Start Both Frontend and Backend**:
   - PowerShell: `.\start_app.ps1`
   - Command Prompt: `start_app.bat`

2. **Start Only the Backend**:
   - PowerShell: `.\start_backend.ps1`
   - Command Prompt: `start_backend.bat`

3. **Start Only the Frontend**:
   - PowerShell: `.\start_frontend.ps1`
   - Command Prompt: `start_frontend.bat`

4. **Build Frontend for Production**:
   - PowerShell: `.\build_frontend.ps1`
   - Command Prompt: `build_frontend.bat`

### Port Configuration

- Backend runs on port 8000 by default (configurable in `backend/.env`)
- Frontend runs on port 5173 by default (Vite's default port)

## Detailed Setup Guides

For detailed setup instructions, refer to the following documentation:

- [Backend Setup Guide](./docs/BACKEND_SETUP.md)
- [Frontend Setup Guide](./docs/FRONTEND_SETUP.md)
- [Google Authentication Setup](./docs/GOOGLE_AUTH_SETUP.md)
- [Google Drive Integration](./docs/GOOGLE_DRIVE_SETUP.md)

## Running the Application

### Running the Backend

#### Using Portable Python Environment (Recommended)

This method creates a self-contained, portable Python environment that works across different systems without relying on the system's global Python installation.

1. Run the backend with a single command:
   ```powershell
   # PowerShell
   .\start_backend.ps1
   
   # or CMD
   start_backend.bat
   ```

The backend will be available at: http://localhost:8000

The portable environment approach ensures consistent behavior across different systems and avoids dependency issues.

### Running the Frontend

1. Run the frontend with a single command:
   ```powershell
   # PowerShell
   .\start_frontend.ps1
   
   # or CMD
   start_frontend.bat
   ```

The frontend will be available at: http://localhost:5173

This will automatically:
- Check if Node.js is installed
- Install frontend dependencies if needed
- Start the development server

### Running Both Frontend and Backend

For full-stack development, you can start both the frontend and backend with a single command:

```powershell
# PowerShell
.\start_app.ps1

# or CMD
start_app.bat
```

This will start both applications in separate windows for convenient development.

- Backend will be available at: http://localhost:8000
- Frontend will be available at: http://localhost:5173

### Using npm (Alternative)

You can also use npm commands from the root directory:

```bash
# Start the backend
npm run start:backend

# Start the frontend
npm run start:frontend

# Start both frontend and backend
npm start

# Build the frontend for production
npm run build:frontend
```

## Building for Production

To build the frontend for production deployment:

```powershell
# PowerShell
.\build_frontend.ps1

# or CMD
build_frontend.bat

# or npm
npm run build:frontend
```

This will create an optimized production build in the `frontend/dist` directory that can be deployed to a web server.

## License

This project is licensed under the MIT License.
