import os
import sys
import pickle
import subprocess
import platform
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build

# Check if required packages are installed
def check_and_install_dependencies():
    """Check if required packages are installed and install them if needed"""
    required_packages = [
        'google-api-python-client',
        'google-auth-httplib2',
        'google-auth-oauthlib',
        'pywin32'  # For Windows security features
    ]
    
    # Only install pywin32 on Windows
    if platform.system() != 'Windows':
        required_packages.pop()
    
    print("Checking required packages...")
    
    for package in required_packages:
        try:
            __import__(package.replace('-', '_').split('[')[0])
            print(f"✓ {package} is already installed")
        except ImportError:
            print(f"✗ {package} is not installed. Installing...")
            try:
                subprocess.check_call([sys.executable, "-m", "pip", "install", package])
                print(f"✓ {package} installed successfully")
            except subprocess.CalledProcessError as e:
                print(f"✗ Failed to install {package}: {e}")
                if package != 'pywin32':  # pywin32 is optional
                    return False
    
    return True

def main():
    """
    Setup Google Drive OAuth 2.0 credentials for your personal account.
    
    This script will:
    1. Check if required dependencies are installed
    2. Check if you already have valid credentials
    3. If not, open a browser for you to authorize the app
    4. Save your credentials for future use
    """
    print("Setting up Google Drive OAuth 2.0 credentials for your personal account...")
    
    # Check and install dependencies
    if not check_and_install_dependencies():
        print("\nERROR: Failed to install required dependencies. Please install them manually:")
        print("pip install google-api-python-client google-auth-httplib2 google-auth-oauthlib")
        if platform.system() == 'Windows':
            print("pip install pywin32")
        return False
    
    # Set credentials directory to current directory since we're now in the credentials folder
    credentials_dir = os.path.dirname(__file__)
    
    # Path to save the OAuth token
    token_path = os.path.join(credentials_dir, "token.pickle")
    
    # Path to the OAuth client secrets file
    client_secrets_path = os.path.join(credentials_dir, "oauth_credentials.json")
    
    if not os.path.exists(client_secrets_path):
        print(f"\nERROR: OAuth client secrets file not found at {client_secrets_path}")
        print("\nYou need to create OAuth 2.0 credentials in Google Cloud Console:")
        print("1. Go to https://console.cloud.google.com/")
        print("2. Create a new project or select your existing one")
        print("3. Enable the Google Drive API")
        print("4. Go to 'Credentials' and create OAuth 2.0 Client ID")
        print("5. Choose 'Desktop app' as the application type")
        print("6. Download the JSON file and save it as 'oauth_credentials.json' in the credentials folder")
        return False
    
    creds = None
    
    # Load existing credentials if available
    if os.path.exists(token_path):
        with open(token_path, 'rb') as token:
            creds = pickle.load(token)
    
    # If no valid credentials available, let the user log in
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            print("Refreshing expired credentials...")
            creds.refresh(Request())
        else:
            print("\nOpening browser for authorization. Please log in with your personal Google account...")
            flow = InstalledAppFlow.from_client_secrets_file(
                client_secrets_path, 
                ['https://www.googleapis.com/auth/drive']
            )
            creds = flow.run_local_server(port=0)
        
        # Save the credentials for the next run
        with open(token_path, 'wb') as token:
            pickle.dump(creds, token)
            print(f"Credentials saved to {token_path}")
    
    # Test the credentials
    try:
        drive_service = build('drive', 'v3', credentials=creds)
        about = drive_service.about().get(fields="user").execute()
        print(f"\nSuccessfully authenticated as: {about['user']['emailAddress']}")
        print("Google Drive OAuth setup completed successfully!")
        
        # List available folders
        print("\nListing available folders in your Google Drive:")
        results = drive_service.files().list(
            q="mimeType='application/vnd.google-apps.folder'",
            pageSize=10,
            fields="nextPageToken, files(id, name)"
        ).execute()
        
        folders = results.get('files', [])
        
        if not folders:
            print("No folders found.")
        else:
            for i, folder in enumerate(folders, 1):
                print(f"{i}. {folder['name']} (ID: {folder['id']})")
            
            print("\nTo use one of these folders for uploads, update your .env file with:")
            print("GDRIVE_FOLDER_ID=folder_id_from_above")
        
        return True
        
    except Exception as e:
        print(f"Error testing credentials: {str(e)}")
        return False

if __name__ == "__main__":
    success = main()
    if not success:
        sys.exit(1)
