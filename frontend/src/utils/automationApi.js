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

// Start email automation - only processes pending emails (never failed)
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

// Restart failed emails - only processes emails with status 'Failed'
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
    const response = await apiClient.post(`${API_BASE}/retry`, settings);
    return response;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Update automation template
export const updateAutomationTemplate = async (templateId) => {
  try {
    const response = await apiClient.post(`${API_BASE}/template`, { templateId });
    return response;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Get automation logs
export const getAutomationLogs = async (limit = 100, filterStatus = null) => {
  try {
    const queryParams = new URLSearchParams();
    if (limit) queryParams.append('limit', limit);
    if (filterStatus) queryParams.append('filter_status', filterStatus);
    
    const response = await apiClient.get(`${API_BASE}/logs?${queryParams.toString()}`);
    return response;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Clear automation logs
export const clearAutomationLogs = async () => {
  try {
    const response = await apiClient.post(`${API_BASE}/logs/clear`);
    return response;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Clean up email archive
export const cleanupEmailArchive = async () => {
  try {
    const response = await apiClient.post(`${API_BASE}/archive/cleanup`);
    return response;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Get automation schedule settings
export const getScheduleSettings = async () => {
  try {
    const response = await apiClient.get(`${API_BASE}/schedule`);
    return response;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Update automation schedule settings
export const updateScheduleSettings = async (settings) => {
  try {
    const response = await apiClient.post(`${API_BASE}/schedule`, settings);
    return response;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Get email templates
export const getEmailTemplates = async () => {
  try {
    const response = await apiClient.get(`${API_BASE}/templates`);
    return response;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Get a specific email template
export const getEmailTemplate = async (templateId) => {
  try {
    const response = await apiClient.get(`${API_BASE}/templates/${templateId}`);
    return response;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Update an email template
export const updateTemplate = async (templateId, templateData) => {
  try {
    const response = await apiClient.post(`${API_BASE}/templates/${templateId}`, templateData);
    return response;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Validate SMTP credentials
export const validateSMTPCredentials = async (credentials) => {
  try {
    const response = await apiClient.post(`${API_BASE}/validate-smtp`, credentials);
    return response;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};
