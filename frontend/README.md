# EmailManagement Frontend

A professional web application for managing and sending emails to clients by retrieving data from a SQL Server database.

## Features

- **Database Connection Interface**: Connect to SQL Server databases
- **Email Status Report Viewer**: View sent, failed, and pending email statistics

## Tech Stack

- **Frontend**: React.js with Tailwind CSS
- **Backend** (planned): Node.js

## Getting Started

### Prerequisites

- Node.js 14.x or higher
- npm 6.x or higher

### Installation

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
   npm start
   ```

4. Open [http://localhost:3000](http://localhost:3000) to view the application

## Project Structure

```
frontend/
├── public/
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── components/
│   │   ├── DatabaseConnector.jsx
│   │   ├── EmailStatusCard.jsx
│   │   ├── Footer.jsx
│   │   ├── Header.jsx
│   │   └── StatusSummary.jsx
│   ├── pages/
│   │   └── Dashboard.jsx
│   ├── utils/
│   │   └── mockApi.js
│   ├── App.js
│   ├── index.css
│   └── index.js
├── package.json
├── tailwind.config.js
└── README.md
```

## Future Enhancements

- Backend integration with Node.js
- User authentication
- Detailed email tracking and analytics
- Email template management
- Scheduled email campaigns

## License

This project is licensed under the MIT License.
