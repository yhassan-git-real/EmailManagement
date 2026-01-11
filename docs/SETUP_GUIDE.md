# 📋 EmailManagement Setup Guide

> *A comprehensive, step-by-step guide for setting up the EmailManagement application on any Windows machine.*

---

## 📑 Table of Contents

| # | Section | Description |
|---|---------|-------------|
| 1 | [Prerequisites](#-prerequisites) | What you need before starting |
| 2 | [Quick Start](#-quick-start) | Get running in minutes |
| 3 | [Environment Setup](#-environment-setup) | Python & Node.js configuration |
| 4 | [Backend Configuration](#-backend-configuration) | API server setup |
| 5 | [Frontend Configuration](#-frontend-configuration) | React app setup |
| 6 | [Database Setup](#-database-setup) | SQL Server configuration |
| 7 | [SMTP Configuration](#-smtp-configuration) | Email sending setup |
| 8 | [Google Drive Integration](#-google-drive-integration) | Large file handling |
| 9 | [Running the Application](#-running-the-application) | Start commands |
| 10 | [Data Management](#-data-management) | Refresh & pagination |
| 11 | [Troubleshooting](#-troubleshooting) | Common issues & fixes |

---

## ✅ Prerequisites

Before starting, ensure you have:

| Requirement | Details |
|-------------|---------|
| 💻 **Operating System** | Windows 10 or newer |
| 🌐 **Internet Connection** | Required for initial setup |
| 🔑 **Admin Access** | Administrator privileges on your computer |
| 🗄️ **SQL Server** | 2016 or higher (Express edition is sufficient) |
| 💾 **Disk Space** | Minimum 2GB free |

---

## 🚀 Quick Start

For experienced users who want to get up and running quickly:

```powershell
# 1️⃣ Clone or download the EmailManagement repository

# 2️⃣ Run the setup script
.\start_app.ps1

# 3️⃣ Follow the prompts to configure

# 4️⃣ Access the application
# Open browser to http://localhost:5173
```

> [!TIP]
> The `start_app.ps1` script automatically handles environment setup, dependencies, and server startup!

---

## 🔧 Environment Setup

<details>
<summary><b>🎯 Option 1: Portable Environment (Recommended)</b></summary>

<br>

The portable environment automatically sets up Python and Node.js without requiring system-wide installation.

**Steps:**
1. Open **PowerShell as Administrator**
2. Navigate to the EmailManagement folder
3. Run the portable setup script:

```powershell
.\scripts\portable_env\setup.ps1
```

4. Wait for the script to complete (may take a few minutes)

> [!NOTE]
> This creates a self-contained environment that works consistently across different systems.

</details>

<details>
<summary><b>⚙️ Option 2: Manual Environment Setup</b></summary>

<br>

If you prefer to use your existing Python and Node.js installations:

**1. Verify Python Installation**
```powershell
python --version  # Should be 3.8 or higher
```
If not installed, download from [python.org](https://www.python.org/downloads/)

**2. Verify Node.js Installation**
```powershell
node --version  # Should be 14 or higher
```
If not installed, download from [nodejs.org](https://nodejs.org/)

**3. Set Up Python Virtual Environment**
```powershell
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
```

**4. Install Node.js Dependencies**
```powershell
cd frontend
npm install
```

</details>

---

## ⚙️ Backend Configuration

### Setting Up the `.env` File

1. Navigate to the `backend/` directory
2. Copy the example file:
   ```powershell
   copy .env.example .env
   ```
3. Edit the `.env` file with your configuration:

```env
# 🖥️ API Configuration
API_PORT=8000
CORS_ORIGINS=http://localhost:5173

# 🗄️ Database Configuration
DB_SERVER=localhost\SQLEXPRESS
DB_NAME=EmailManagement
DB_USER=your_username
DB_PASSWORD=your_password
DB_DRIVER=ODBC Driver 17 for SQL Server

# 📧 Email Configuration
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
EMAIL_USERNAME=your.email@gmail.com
EMAIL_PASSWORD=your_app_password
SMTP_TLS=True

# 📁 File Storage
EMAIL_ARCHIVE_PATH=../Email_Archive
TEMPLATE_PATH=../templates
MAX_ATTACHMENT_SIZE=25000000

# ☁️ Google Drive (Optional)
GDRIVE_CREDENTIALS_PATH=../credentials/gdrive_credentials.json
GDRIVE_TOKEN_PATH=../credentials/token.pickle
GDRIVE_FOLDER_ID=your_folder_id
GDRIVE_UPLOAD_THRESHOLD=20000000
```

> [!IMPORTANT]
> Replace all placeholder values (like `your_username`) with your actual configuration.

---

## 🎨 Frontend Configuration

1. Navigate to the `frontend/` directory
2. Open `src/utils/apiClient.js`
3. Verify the API URL matches your backend:

```javascript
const API_BASE_URL = 'http://localhost:8000';
```

> [!NOTE]
> If you changed the backend port in `.env`, update this URL accordingly.

---

## 🗄️ Database Setup

### Creating the Database

<details>
<summary><b>📊 Using SQL Server Management Studio (SSMS)</b></summary>

<br>

1. Open SQL Server Management Studio
2. Connect to your SQL Server instance
3. Right-click on **"Databases"** → Select **"New Database"**
4. Enter `EmailManagement` as the database name
5. Click **OK**

</details>

### Running Setup Scripts

**Option A: Using SSMS**
1. Open the `database/email_tables.sql` script
2. Click **Execute** to create tables
3. Open the `database/setup_stored_procedures.sql` script
4. Click **Execute** to create stored procedures

**Option B: Using PowerShell**
```powershell
sqlcmd -S localhost\SQLEXPRESS -d EmailManagement -i database\email_tables.sql
sqlcmd -S localhost\SQLEXPRESS -d EmailManagement -i database\setup_stored_procedures.sql
```

---

## 📧 SMTP Configuration

### Option 1: Gmail with App Password ⭐ Recommended

> [!IMPORTANT]
> Gmail requires 2-Factor Authentication to use App Passwords.

**Step 1: Enable 2-Step Verification**
- Go to [Google Account Security](https://myaccount.google.com/security)
- Enable **2-Step Verification**

**Step 2: Generate App Password**
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Under "Signing in to Google," select **App passwords**
3. Select **Mail** and **Windows Computer**
4. Click **Generate**
5. Copy the 16-character password

**Step 3: Update `.env` File**
```env
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
EMAIL_USERNAME=your.email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
SMTP_TLS=True
```

<details>
<summary><b>📮 Option 2: Custom SMTP Provider</b></summary>

<br>

```env
SMTP_SERVER=your.smtp.server
SMTP_PORT=your_port
EMAIL_USERNAME=your_username
EMAIL_PASSWORD=your_password
SMTP_TLS=True
```

Contact your email provider for the correct SMTP settings.

</details>

---

## ☁️ Google Drive Integration

> [!NOTE]
> Google Drive integration is **optional** but recommended for handling large email attachments (> 20MB).

<details>
<summary><b>👤 Option 1: Personal Google Account (OAuth)</b></summary>

<br>

**1. Create a Google Cloud Project**
- Go to [Google Cloud Console](https://console.cloud.google.com/)
- Create a new project named "EmailManagement"
- Enable the Google Drive API

**2. Configure OAuth Consent Screen**
- Go to **OAuth consent screen**
- Select **External** user type
- Fill in application details
- Add your email as a test user
- Add scope: `.../auth/drive.file`

**3. Create OAuth Credentials**
- Go to **Credentials** → **Create Credentials**
- Select **OAuth client ID**
- Choose **Desktop application**
- Download the JSON file

**4. Set Up Credentials**
```powershell
# Create credentials folder and move the JSON file
mkdir credentials
# Rename downloaded file to gdrive_credentials.json

# Run setup script
python credentials\setup_gdrive_oauth.py
```

**5. Update `.env` File**
```env
GDRIVE_CREDENTIALS_PATH=../credentials/gdrive_credentials.json
GDRIVE_TOKEN_PATH=../credentials/token.pickle
GDRIVE_FOLDER_ID=your_folder_id
GDRIVE_UPLOAD_THRESHOLD=20000000
```

</details>

<details>
<summary><b>🤖 Option 2: Service Account (For Server Environments)</b></summary>

<br>

1. In Google Cloud Console, go to **IAM & Admin** → **Service Accounts**
2. Click **Create Service Account**
3. Download the JSON key file
4. Save as `gdrive_service_account.json` in `credentials/`
5. Update `.env`:

```env
GDRIVE_SERVICE_ACCOUNT_PATH=../credentials/gdrive_service_account.json
GDRIVE_FOLDER_ID=your_folder_id
GDRIVE_UPLOAD_THRESHOLD=20000000
```

</details>

---

## 🏃 Running the Application

### Recommended: Using Start Scripts

| Script | Description |
|--------|-------------|
| `.\start_app.ps1` | Start both frontend and backend |
| `.\start_backend.ps1` | Start backend only |
| `.\start_frontend.ps1` | Start frontend only |

### Access Points

| Service | URL |
|---------|-----|
| 🎨 Frontend | http://localhost:5173 |
| ⚙️ Backend API | http://localhost:8000 |
| 📖 API Docs | http://localhost:8000/docs |

---

## 📊 Data Management

### Automatic Refresh

| Feature | Refresh Interval |
|---------|-----------------|
| 🤖 Automation Status | Every 5 seconds (when running) |
| 📊 Dashboard Metrics | Every 30 seconds |

### Manual Refresh

- **Email Records**: Use the "Execute" button after setting filters
- **Templates**: Click the refresh icon
- **Logs**: Click the refresh button

### Pagination & Filtering

- Records are paginated for better performance
- Use pagination controls at the bottom of tables
- Apply filters using the search box and status dropdowns
- Click **Execute** for server-side filtering

---

## 🔧 Troubleshooting

<details>
<summary><b>⚙️ Backend Issues</b></summary>

<br>

| Issue | Solution |
|-------|----------|
| **Port 8000 in use** | Change `API_PORT` in `.env` and update frontend |
| **Database connection failed** | Verify SQL Server is running and credentials are correct |
| **Missing dependencies** | Run `pip install -r requirements.txt` |
| **File permission errors** | Ensure write access to `Email_Archive` directory |

</details>

<details>
<summary><b>🎨 Frontend Issues</b></summary>

<br>

| Issue | Solution |
|-------|----------|
| **Node.js version error** | Ensure Node.js 14+ is installed |
| **Port 5173 in use** | Vite will auto-select next available port |
| **Backend connection failed** | Verify API_BASE_URL and check CORS settings |
| **White screen/blank page** | Check browser console for errors, clear cache |

</details>

<details>
<summary><b>📧 SMTP Issues</b></summary>

<br>

| Issue | Solution |
|-------|----------|
| **Authentication failed** | Verify app password (no spaces), ensure 2FA is enabled |
| **Connection timeout** | Check firewall settings, ensure port 587 is open |

</details>

<details>
<summary><b>☁️ Google Drive Issues</b></summary>

<br>

| Issue | Solution |
|-------|----------|
| **OAuth setup failed** | Try "Other" or "Web application" type if "Desktop" unavailable |
| **"App not verified" warning** | Click Advanced → Go to [App Name] (unsafe) |
| **Token errors** | Delete `token.pickle` and run setup again |
| **Files not appearing** | Verify folder ID, check storage quota |

</details>

---

## 📚 Related Documentation

| Document | Description |
|----------|-------------|
| [Backend Setup](BACKEND_SETUP.md) | Detailed backend configuration |
| [Frontend Setup](FRONTEND_SETUP.md) | Frontend customization guide |
| [Google Drive Setup](GOOGLE_DRIVE_SETUP.md) | Complete GDrive integration guide |
| [Google Auth Setup](GOOGLE_AUTH_SETUP.md) | Gmail authentication setup |

---

<div align="center">

**Need help?** Check the [Troubleshooting](#-troubleshooting) section or open an issue on GitHub.

</div>
