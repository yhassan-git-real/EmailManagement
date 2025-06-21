# EmailManagement Application

A full-stack application for managing and sending emails to clients by retrieving data from a SQL Server database.

## Project Structure

The project is organized into a monorepo with frontend and backend code separated:

```
EmailManagement/
├── frontend/        # React.js frontend application
├── backend/         # Node.js backend (will be implemented later)
└── package.json     # Root package.json for managing workspaces
```

## Features

- **Database Connection Interface**: Connect to SQL Server databases
- **Email Status Report Viewer**: View sent, failed, and pending email statistics
- **Modern UI/UX**: Clean, responsive dashboard with collapsible sidebar
- **Manual Email Composition**: Create and send emails with rich formatting
- **Email Automation**: Set up automated email workflows and rules

## Tech Stack

- **Frontend**: React.js with Tailwind CSS
- **Backend** (planned): Node.js

## Getting Started

### Prerequisites

- Node.js 14.x or higher
- npm 6.x or higher

### Running the Frontend

#### Option 1: From the root directory
1. Install dependencies
   ```bash
   npm run install:frontend
   ```

2. Start the frontend development server
   ```bash
   npm run start:frontend
   ```

#### Option 2: From the frontend directory
1. Navigate to the frontend directory
   ```bash
   cd frontend
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Start the development server
   ```bash
   npm start
   ```

4. Open [http://localhost:3000](http://localhost:3000) to view the application

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
