// Real automation API client
const API_BASE_URL = 'http://localhost:8000';
const API_BASE = '/api/automation';

// Simple fetch wrapper for API calls
const apiClient = {
  get: async (endpoint) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const data = await response.json();
    return data;
  },
  
  post: async (endpoint, data) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    const responseData = await response.json();
    return responseData;
  }
};

// Save email automation settings
export const saveEmailAutomationSettings = async (settings) => {
  try {
    const response = await apiClient.post(`${API_BASE}/settings`, settings);
    return response;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Get email automation settings
export const getEmailAutomationSettings = async () => {
  try {
    const response = await apiClient.get(`${API_BASE}/settings`);
    return response;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Get automation status
export const getAutomationStatus = async () => {
  try {
    const response = await apiClient.get(`${API_BASE}/status`);
    return response;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Start email automation
export const startAutomation = async () => {
  try {
    const response = await apiClient.post(`${API_BASE}/start`);
    return response;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Stop email automation
export const stopAutomation = async () => {
  try {
    const response = await apiClient.post(`${API_BASE}/stop`);
    return response;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Restart failed emails
export const restartFailedEmails = async () => {
  try {
    const response = await apiClient.post(`${API_BASE}/restart-failed`);
    return response;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Update retry settings
export const updateRetrySettings = async (settings) => {
  try {
    const response = await apiClient.post(`${API_BASE}/retry-settings`, settings);
    return response;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Update automation template
export const updateAutomationTemplate = async (templateId) => {
  try {
    const response = await apiClient.post(`${API_BASE}/template/${templateId}`);
    return response;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Validate SMTP credentials
export const validateSMTPCredentials = async (smtpSettings) => {
  try {
    const response = await apiClient.post(`${API_BASE}/validate-smtp`, {
      smtpServer: smtpSettings.smtpServer,
      port: parseInt(smtpSettings.port, 10),
      username: smtpSettings.username,
      password: smtpSettings.password,
      useTLS: smtpSettings.useTLS
    });
    return response;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};
