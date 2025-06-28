// Mock automation API functions

// Default email automation settings
let automationSettings = {
  senderEmail: 'automation@company.com',
  smtpServer: 'smtp.company.com',
  port: '587',
  authType: 'login',
  username: 'automation@company.com',
  password: '********',
  useTLS: true,
  retryOnFailure: true,
  retryInterval: '15min',
  templateId: 'default'
};

// Automation status
let automationStatus = {
  status: 'idle', // 'idle', 'running', 'stopped', 'restarting'
  lastRun: null,
  summary: {
    processed: 0,
    successful: 0,
    failed: 0,
    pending: 32
  }
};

// Save email automation settings
export const saveEmailAutomationSettings = async (settings) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      automationSettings = { ...automationSettings, ...settings };
      resolve({
        success: true,
        data: automationSettings
      });
    }, 500);
  });
};

// Get email automation settings
export const getEmailAutomationSettings = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        data: automationSettings
      });
    }, 300);
  });
};

// Get automation status
export const getAutomationStatus = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        data: automationStatus
      });
    }, 200);
  });
};

// Start email automation
export const startAutomation = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      automationStatus.status = 'running';
      automationStatus.lastRun = new Date().toISOString();
      automationStatus.summary = {
        processed: 0,
        successful: 0,
        failed: 0,
        pending: 32
      };
      
      resolve({
        success: true,
        message: 'Email automation started successfully',
        data: automationStatus
      });
    }, 800);
  });
};

// Stop email automation
export const stopAutomation = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      automationStatus.status = 'stopped';
      
      resolve({
        success: true,
        message: 'Email automation stopped successfully',
        data: automationStatus
      });
    }, 500);
  });
};

// Restart failed emails
export const restartFailedEmails = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      automationStatus.status = 'restarting';
      
      // Simulate reprocessing failed emails
      setTimeout(() => {
        automationStatus.status = 'running';
        automationStatus.summary.failed = Math.floor(automationStatus.summary.failed / 2);
        automationStatus.summary.successful += Math.floor(automationStatus.summary.failed / 2);
      }, 3000);
      
      resolve({
        success: true,
        message: 'Failed emails restarted successfully',
        data: automationStatus
      });
    }, 700);
  });
};

// Update retry settings
export const updateRetrySettings = async (settings) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      automationSettings.retryOnFailure = settings.retryOnFailure;
      automationSettings.retryInterval = settings.retryInterval;
      
      resolve({
        success: true,
        message: 'Retry settings updated successfully',
        data: automationSettings
      });
    }, 300);
  });
};

// Update automation template
export const updateAutomationTemplate = async (templateId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      automationSettings.templateId = templateId;
      
      resolve({
        success: true,
        message: 'Automation template updated successfully',
        data: automationSettings
      });
    }, 300);
  });
};
