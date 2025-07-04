# EmailManagement Application

A full-stack application for managing and sending emails to clients by retrieving data from a SQL Server database.

## Project Structure

The project is organized into a monorepo with frontend and backend code separated:

```
EmailManagement/
├── frontend/               # React.js frontend application
├── backend/                # FastAPI Python backend
├── scripts/                # Utility scripts for the project
│   ├── portable_env/       # Portable Python environment scripts
│   └── frontend/           # Frontend development scripts
├── start_backend.ps1       # Script to run backend
├── start_backend.bat       # Script to run backend
├── start_frontend.ps1      # Script to run frontend
├── start_frontend.bat      # Script to run frontend
├── start_app.ps1           # Script to run both frontend and backend
├── start_app.bat           # Script to run both frontend and backend
└── package.json            # Root package.json for managing workspaces
```

## Features

- **Database Connection Interface**: Connect to SQL Server databases
- **Email Status Report Viewer**: View sent, failed, and pending email statistics
- **Modern UI/UX**: Clean, responsive dashboard with collapsible sidebar
- **Manual Email Composition**: Create and send emails with rich formatting
- **Email Automation**: Set up automated email workflows and rules

## Tech Stack

- **Frontend**: React.js with Tailwind CSS
- **Backend**: FastAPI (Python)

## Getting Started

### Prerequisites

- Node.js 14.x or higher
- npm 6.x or higher
- For backend: Python 3.11 (automatically handled with portable environment scripts)

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

The frontend will be available at: http://localhost:3000

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
- Frontend will be available at: http://localhost:3000

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

## Frontend Structure

```
frontend/
├── public/
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── components/
│   │   ├── Alert.jsx
│   │   ├── BackgroundIllustration.jsx
│   │   ├── DatabaseConnector.jsx
│   │   ├── EmailStatusCard.jsx
│   │   ├── Footer.jsx
│   │   ├── Header.jsx
│   │   ├── Sidebar.jsx
│   │   ├── StatusSummary.jsx
│   │   └── Welcome.jsx
│   ├── pages/
│   │   ├── AutomatePage.jsx
│   │   ├── ComposePage.jsx
│   │   ├── Dashboard.jsx
│   │   └── StatusPage.jsx
│   ├── utils/
│   │   └── mockApi.js
│   ├── App.jsx
│   ├── index.css
│   └── index.js
├── package.json
├── tailwind.config.js
└── README.md
```

## Recent Updates

- Fixed navigation flow to show Email Status immediately after database connection
- Updated sidebar with improved visual styling and distinct icons
- Added collapsible sidebar with smooth transitions
- Implemented mobile-responsive design with slide-in sidebar
- Improved text alignment and spacing in the UI

## Future Enhancements

- Backend integration with Node.js
- User authentication
- Detailed email tracking and analytics
- Email template management
- Scheduled email campaigns

## License

This project is licensed under the MIT License.
