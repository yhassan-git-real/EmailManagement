/**
 * API client functions for the EmailManagement application
 * These functions connect to the real backend API
 */

const API_BASE_URL = 'http://localhost:8000';

// Default templates if the API call fails
const DEFAULT_TEMPLATES = [
  {
    id: 'default',
    name: 'Default Template',
    subject: '',
    body: `<p>Dear Sir/Madam,</p>
<p>Please find the attachment as per your requirement.</p>
<p>In case of any complaint or doubt, then kindly raise a ticket at <a href="http://helpdesk.freshdesk.com/">http://helpdesk.freshdesk.com/</a> for effective and better support.</p>
<p><strong>Note:</strong> DO NOT SHARE THIS FILE WITH ANYONE. FOR ANY ISSUE KINDLY REPLY ON THIS EMAIL ONLY.</p>
<p>Thanks & Regards<br>
Production Team</p>`
  },
  {
    id: 'followup',
    name: 'Follow-up Template',
    subject: 'Follow-up: ',
    body: `<p>Dear Sir/Madam,</p>
<p>I'm writing to follow up on the document shared with you on [DATE].</p>
<p>Has the information provided been helpful? If you require any clarification or have questions regarding the content, please let me know.</p>
<p>As a reminder, for any technical issues or support, please create a ticket at <a href="http://helpdesk.freshdesk.com/">http://helpdesk.freshdesk.com/</a> for prompt assistance.</p>
<p>Thanks & Regards<br>
Support Team</p>`
  },
  {
    id: 'escalation',
    name: 'Escalation Template',
    subject: 'URGENT: ',
    body: `<p>Dear Concerned Department,</p>
<p>This is regarding an escalation for case #[CASE_NUMBER].</p>
<p>We request your urgent attention to this matter as it requires immediate resolution. All previous attempts to resolve this issue through standard channels have been unsuccessful.</p>
<p>Please review the attached documentation and provide your feedback at the earliest.</p>
<p><strong>IMPORTANT:</strong> For tracking purposes, please maintain the email thread and do not alter the subject line.</p>
<p>Thanks & Regards<br>
Escalation Team</p>`
  },
  {
    id: 'reminder',
    name: 'Payment Reminder',
    subject: 'Reminder: ',
    body: `<p>Dear Client,</p>
<p>This email serves as a reminder regarding the pending payment for invoice #[INVOICE_NUMBER].</p>
<p>Please process the payment at your earliest convenience to avoid any service interruptions.</p>
<p>For payment-related queries, contact our finance department or reply to this email.</p>
<p>Thanks & Regards<br>
Finance Department</p>`
  }
];

/**
 * Test the database connection with provided credentials
 * @param {Object} credentials - Database connection credentials
 * @returns {Promise} - Promise with the response
 */
export const testDatabaseConnection = async (credentials) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/database/test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        server: credentials.serverName,
        database: credentials.databaseName,
        username: credentials.username,
        password: credentials.password
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to test database connection');
    }

    if (!data.success) {
      throw new Error(data.message || 'Connection test failed');
    }

    return {
      success: data.success,
      message: data.message,
      details: {
        server: credentials.serverName,
        database: credentials.databaseName,
        status: data.success ? 'Available' : 'Unavailable'
      }
    };
  } catch (error) {
    throw {
      success: false,
      message: error.message || 'An error occurred while testing the connection'
    };
  }
};

/**
 * Connect to the database with provided credentials
 * Note: For now, this uses the same endpoint as the test connection
 * In a real implementation, this would create a session or store the connection info
 * @param {Object} credentials - Database connection credentials
 * @returns {Promise} - Promise with the response
 */
export const connectToDatabase = async (credentials) => {
  try {
    // We're using the same test endpoint for now
    // In a real implementation, you might have a separate endpoint for establishing a session
    const response = await testDatabaseConnection(credentials);
    
    return {
      success: true,
      message: 'Successfully connected to database',
      connectionInfo: {
        serverName: credentials.serverName,
        databaseName: credentials.databaseName,
        username: credentials.username,
        connectedAt: new Date().toISOString()
      }
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Fetch email status summary from the API
 * @returns {Promise} - Promise with email status data
 */
export const fetchEmailStatus = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/email/status-summary`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch email status');
    }
    
    const data = await response.json();
    
    return {
      total: data.total || 0,
      pending: data.pending || 0,
      success: data.success || 0,
      sent: data.success || 0, // Added sent as an alias for success for the UI
      failed: data.failed || 0,
      lastUpdated: data.last_updated
    };
  } catch (error) {
    console.error('Error fetching email status:', error);
    throw error;
  }
};

/**
 * Fetch email records from the API
 * @param {Object} options - Filter options like status
 * @returns {Promise} - Promise with email records
 */
export const fetchEmailRecords = async (options = {}) => {
  try {
    let url = `${API_BASE_URL}/api/email/records`;
    
    // Add query parameters if options provided
    if (Object.keys(options).length > 0) {
      url += '?';
      const params = [];
      if (options.status) params.push(`status=${options.status}`);
      if (options.limit) params.push(`limit=${options.limit}`);
      if (options.offset) params.push(`offset=${options.offset}`);
      url += params.join('&');
    }
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Failed to fetch email records');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching email records:', error);
    throw error;
  }
};

/**
 * Send manual email
 * @param {Object} emailData - Email data including to, cc, bcc, subject, body, attachments
 * @returns {Promise} - Promise with the response
 */
export const sendManualEmail = async (emailData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/manual-email/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: emailData.to,
        cc: emailData.cc || [],
        bcc: emailData.bcc || [],
        subject: emailData.subject,
        body: emailData.body,
        template_id: emailData.templateId
        // Attachments will be handled in a later implementation
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to send email');
    }

    return {
      success: true,
      message: 'Email sent successfully',
      data
    };
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      success: false,
      message: error.message || 'An error occurred while sending the email'
    };
  }
};

/**
 * Get SMTP configuration
 * @returns {Promise} - Promise with SMTP config data
 */
export const getSmtpConfig = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/manual-email/smtp-config`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch SMTP configuration');
    }
    
    const data = await response.json();
    
    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Error fetching SMTP config:', error);
    return {
      success: false,
      message: error.message || 'An error occurred while fetching SMTP configuration'
    };
  }
};

/**
 * Update SMTP configuration
 * @param {Object} config - SMTP configuration
 * @returns {Promise} - Promise with the response
 */
export const updateSmtpConfig = async (config) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/manual-email/smtp-config`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to update SMTP configuration');
    }

    return {
      success: true,
      message: 'SMTP configuration updated successfully',
      data
    };
  } catch (error) {
    console.error('Error updating SMTP config:', error);
    return {
      success: false,
      message: error.message || 'An error occurred while updating SMTP configuration'
    };
  }
};

/**
 * Fetch email templates
 * @returns {Promise} - Promise with email templates data
 */
export const fetchEmailTemplates = async (isActive = true, category = null) => {
  try {
    // Build URL with query parameters
    let url = `${API_BASE_URL}/api/templates`;
    if (category) {
      url += `?category=${encodeURIComponent(category)}`;
    }
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.warn('Failed to fetch templates from API. Using default templates.');
      return {
        success: true,
        data: DEFAULT_TEMPLATES
      };
    }
    
    const data = await response.json();
    
    // File-based templates already come in the correct format
    if (data.success && Array.isArray(data.templates)) {
      return {
        success: true,
        data: data.templates
      };
    } else {
      return {
        success: true,
        data: DEFAULT_TEMPLATES
      };
    }
  } catch (error) {
    console.warn('Error fetching templates:', error);
    // Fallback to default templates
    return {
      success: true,
      data: DEFAULT_TEMPLATES
    };
  }
};

/**
 * Update email record status
 * @param {number} emailId - Email ID
 * @param {string} status - New status (Success, Failed, Pending)
 * @param {string} reason - Reason for status change
 * @returns {Promise} - Promise with the response
 */
export const updateEmailRecordStatus = async (emailId, status, reason = null) => {
  try {
    const url = `${API_BASE_URL}/api/email/records/${emailId}/status?status=${status}`;
    const requestOptions = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      }
    };

    // Add reason if provided
    if (reason) {
      requestOptions.body = JSON.stringify({ reason });
    }

    const response = await fetch(url, requestOptions);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to update email status');
    }

    return {
      success: true,
      message: 'Email status updated successfully',
      data
    };
  } catch (error) {
    console.error('Error updating email status:', error);
    return {
      success: false,
      message: error.message || 'An error occurred while updating email status'
    };
  }
};

/**
 * Fetch email table data from the API with pagination and optional search
 * @param {number} page - Page number
 * @param {number} pageSize - Page size
 * @param {string} searchTerm - Optional search term
 * @returns {Promise} - Promise with the paginated email records
 */
export const fetchEmailTableData = async (page = 1, pageSize = 5, searchTerm = '', status = null) => {
  try {
    // Ensure page is a valid number
    const currentPage = page || 1;
    
    // Calculate offset for pagination
    const offset = (currentPage - 1) * pageSize;
    
    console.log(`API Call - Page: ${currentPage}, Offset: ${offset}, Status: ${status}`);
    
    let url = `${API_BASE_URL}/api/email/records?limit=${pageSize}&offset=${offset}`;
    
    // If search term is provided, add it to the query
    if (searchTerm) {
      url += `&search=${encodeURIComponent(searchTerm)}`;
    }
    
    // If status filter is provided, add it to the query
    if (status && status !== 'All') {
      url += `&status=${encodeURIComponent(status)}`;
    }
    
    console.log(`Fetching URL: ${url}`);
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Failed to fetch email records');
    }
    
    const responseData = await response.json();
    
    // Check if response has the new format (success and data fields)
    if (responseData && responseData.success && responseData.data) {
      const result = {
        success: true,
        data: {
          rows: responseData.data.rows || [],
          total: responseData.data.total || 0,
          page: page,
          pageSize: pageSize,
          totalPages: Math.ceil((responseData.data.total || 0) / pageSize)
        }
      };
      
      console.log(`API Response - Page: ${page}, Total: ${result.data.total}, Rows: ${result.data.rows.length}`);
      return result;
    } else {
      // Handle legacy format or unexpected response
      const formattedData = Array.isArray(responseData) ? responseData : [];
      
      return {
        success: true,
        data: {
          rows: formattedData,
          total: formattedData.length > pageSize ? 1000 : formattedData.length, // Estimate
          page: page,
          pageSize: pageSize,
          totalPages: Math.ceil(formattedData.length / pageSize)
        }
      };
    }
  } catch (error) {
    console.error('Error fetching email records:', error);
    return {
      success: false,
      message: error.message || 'An error occurred while fetching email records',
      data: {
        rows: [],
        total: 0,
        page: 1,
        pageSize: 5,
        totalPages: 1
      }
    };
  }
};
