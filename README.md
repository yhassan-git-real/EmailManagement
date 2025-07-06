# EmailManagement Application

A full-stack application for managing and sending emails to clients by retrieving data from a SQL Server database.

## Project Overview

EmailManagement is a comprehensive application designed to streamline the process of sending emails with attachments to clients. It interfaces with SQL Server databases to fetch recipient information, manages email templates, tracks email delivery status, and provides automation capabilities for scheduling and recurring emails.

## Project Structure

The project is organized into a monorepo with frontend and backend code separated:

```
EmailManagement/
├── frontend/               # React.js frontend application
├── backend/                # FastAPI Python backend
├── docs/                   # Detailed setup and documentation
├── scripts/                # Utility scripts for the project
│   ├── portable_env/       # Portable Python environment scripts
│   └── frontend/           # Frontend development scripts
├── credentials/            # Authentication credentials for integrations
├── Email_Archive/          # Archive of sent email attachments
├── start_backend.ps1       # Script to run backend (PowerShell)
├── start_backend.bat       # Script to run backend (Batch)
├── start_frontend.ps1      # Script to run frontend (PowerShell)
├── start_frontend.bat      # Script to run frontend (Batch)
├── start_app.ps1           # Script to run both frontend and backend (PowerShell)
├── start_app.bat           # Script to run both frontend and backend (Batch)
├── build_frontend.ps1      # Script to build the frontend for production (PowerShell)
└── build_frontend.bat      # Script to build the frontend for production (Batch)
```

## Workflow and Process

### Application Workflow

1. **Database Connection**:
   - Users connect to a SQL Server database containing email recipient information
   - The application verifies database credentials and establishes a connection

2. **Home Dashboard**:
   - After successful connection, users are directed to the home dashboard
   - The dashboard displays email status summaries and quick action links

3. **Email Records Management**:
   - Users can view, filter, and manage email records
   - Records can be edited, and their statuses can be updated

4. **Email Automation**:
   - Configure automation rules for sending emails
   - Set up schedules and recurring email tasks
   - Choose templates and customize email content

5. **Large File Handling**:
   - For attachments over 20MB, Google Drive integration automatically uploads the file and creates a shareable link
   - The link is included in the email instead of the attachment

### Development Workflow

1. **Local Development**:
   - Run both frontend and backend using the provided scripts
   - Make changes to the codebase
   - Test changes locally

2. **Building for Production**:
   - Build the frontend for production deployment
   - Package the backend application
   - Deploy to the target environment

## Features

- **Database Connection Interface**: Connect to SQL Server databases
- **Email Status Report Viewer**: View sent, failed, and pending email statistics
- **Modern UI/UX**: Clean, responsive home page with collapsible sidebar
- **Email Automation**: Set up automated email workflows and rules
- **Template Management**: Create and manage email templates
- **Large File Handling**: Google Drive integration for attachments over 20MB

## Tech Stack

- **Frontend**: React.js with Tailwind CSS, Vite for build tooling
- **Backend**: FastAPI (Python 3.11)
- **Database**: Microsoft SQL Server
- **Integrations**: Google Drive API for large file storage

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
