/**
 * Mock API utility functions for the EmailManagement application
 */

// Mock email status data
const mockEmailStatus = {
  sent: 124,
  failed: 7,
  pending: 32
};

// Test database connection without establishing a session
export const testDatabaseConnection = async (credentials) => {
  return new Promise((resolve, reject) => {
    // Simulate API call latency
    setTimeout(() => {
      // Validate based on input - simulating various realistic error scenarios
      if (!credentials.serverName.trim()) {
        reject({ success: false, message: 'Server name is required' });
      } else if (!credentials.databaseName.trim()) {
        reject({ success: false, message: 'Database name is required' });
      } else if (!credentials.username.trim()) {
        reject({ success: false, message: 'Username is required' });
      } else if (!credentials.password.trim()) {
        reject({ success: false, message: 'Password is required' });
      } else if (credentials.serverName.includes('invalid')) {
        reject({ success: false, message: 'Invalid server name or server not found' });
      } else if (credentials.serverName.includes('timeout')) {
        reject({ success: false, message: 'Connection timeout - server unreachable' });
      } else if (credentials.username === 'invalid') {
        reject({ success: false, message: 'Authentication failed - invalid credentials' });
      } else {
        resolve({ 
          success: true, 
          message: 'Connection test successful',
          details: {
            server: credentials.serverName,
            database: credentials.databaseName,
            status: 'Available'
          }
        });
      }
    }, 1000);
  });
};

// Simulate database connection check and establish session
export const connectToDatabase = async (credentials) => {
  return new Promise((resolve, reject) => {
    // Simulate API call latency
    setTimeout(() => {
      // Simple validation - in real app, this would be a backend call
      if (
        credentials.serverName.trim() !== '' &&
        credentials.databaseName.trim() !== '' &&
        credentials.username.trim() !== '' &&
        credentials.password.trim() !== ''
      ) {
        resolve({ 
          success: true, 
          message: 'Successfully connected to database',
          connectionInfo: {
            serverName: credentials.serverName,
            databaseName: credentials.databaseName,
            username: credentials.username,
            connectedAt: new Date().toISOString()
          }
        });
      } else if (!credentials.serverName.trim()) {
        reject({ success: false, message: 'Server name is required' });
      } else if (!credentials.databaseName.trim()) {
        reject({ success: false, message: 'Database name is required' });
      } else if (!credentials.username.trim()) {
        reject({ success: false, message: 'Username is required' });
      } else if (!credentials.password.trim()) {
        reject({ success: false, message: 'Password is required' });
      } else {
        reject({ success: false, message: 'Invalid database credentials' });
      }
    }, 1500);
  });
};

// Fetch email status counts
export const fetchEmailStatus = async () => {
  return new Promise((resolve) => {
    // Simulate API call latency
    setTimeout(() => {
      resolve(mockEmailStatus);
    }, 1000);
  });
};

// Mock sending an email
export const mockSendEmail = async (emailData) => {
  return new Promise((resolve, reject) => {
    // Simulate API call latency
    setTimeout(() => {
      // Validate basic requirements
      if (!emailData.to || emailData.to.length === 0) {
        reject({ success: false, message: 'At least one recipient is required' });
      } else if (!emailData.subject && !emailData.body) {
        reject({ success: false, message: 'Subject or body must be provided' });
      } else {
        // Generate mock response with ID and timestamp
        resolve({
          success: true,
          message: 'Email sent successfully',
          data: {
            id: `email_${Math.random().toString(36).substr(2, 9)}`,
            sent: new Date().toISOString(),
            recipients: emailData.to.length + 
                       (emailData.cc ? emailData.cc.length : 0) + 
                       (emailData.bcc ? emailData.bcc.length : 0),
            status: 'sent'
          }
        });

        // Update mock status
        mockEmailStatus.sent += 1;
      }
    }, 800); // Simulate network delay
  });
};

// Get email status statistics
export const getEmailStats = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        data: { ...mockEmailStatus }
      });
    }, 500);
  });
};
