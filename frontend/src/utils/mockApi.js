/**
 * Mock API utility functions for the EmailManagement application
 */

// Mock email status data
const mockEmailStatus = {
  sent: 124,
  failed: 7,
  pending: 32
};

// Email body templates
export const emailTemplates = [
  {    id: 'default',
    name: 'Default Template',
    subject: '',
    body: `<p>Dear Sir/Madam,</p>
<p>Please find the attachment as per your requirement.</p>
<p>In case of any complaint or doubt, then kindly raise a ticket at <a href="http://helpdesk.freshdesk.com/">http://helpdesk.freshdesk.com/</a> for effective and better support.</p>
<p><strong>Note:</strong> DO NOT SHARE THIS FILE WITH ANYONE. FOR ANY ISSUE KINDLY REPLY ON THIS EMAIL ONLY.</p>
<p>Thanks & Regards<br>
Production Team</p>`
  },
  {    id: 'followup',
    name: 'Follow-up Template',
    subject: 'Follow-up: ',
    body: `<p>Dear Sir/Madam,</p>
<p>I'm writing to follow up on the document shared with you on [DATE].</p>
<p>Has the information provided been helpful? If you require any clarification or have questions regarding the content, please let me know.</p>
<p>As a reminder, for any technical issues or support, please create a ticket at <a href="http://helpdesk.freshdesk.com/">http://helpdesk.freshdesk.com/</a> for prompt assistance.</p>
<p>Thanks & Regards<br>
Support Team</p>`
  },
  {    id: 'escalation',
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
  {    id: 'reminder',
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

// Fetch available email templates
export const fetchEmailTemplates = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        data: emailTemplates
      });
    }, 300);
  });
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

// Mock email table data - Simulates data from SQL Server
export const fetchEmailTableData = async (page = 1, pageSize = 5, searchTerm = '') => {
  return new Promise((resolve) => {
    // Simulate API call latency
    setTimeout(() => {
      // Generate mock records
      const mockData = [
        {
          id: 1,
          Company_Name: 'Acme Corporation',
          Email: 'contact@acmecorp.com',
          Subject: 'Quarterly Invoice',
          File_Path: '/invoices/acme_q2_2025.pdf',
          Email_send_Date: '2025-04-15T09:30:00',
          Email_Status: 'Sent',
          Date: '2025-04-15T09:30:00',
          Reason: null
        },
        {
          id: 2,
          Company_Name: 'TechNova Solutions',
          Email: 'billing@technova.com',
          Subject: 'Project Proposal - Cloud Migration',
          File_Path: '/proposals/technova_cloud_2025.docx',
          Email_send_Date: '2025-05-03T14:22:15',
          Email_Status: 'Sent',
          Date: '2025-05-03T14:22:15',
          Reason: null
        },
        {
          id: 3,
          Company_Name: 'Global Logistics Inc.',
          Email: 'operations@globallogistics.net',
          Subject: 'Shipping Confirmation #GLI-78542',
          File_Path: '/shipping/gli_78542_docs.zip',
          Email_send_Date: '2025-05-12T08:45:30',
          Email_Status: 'Sent',
          Date: '2025-05-12T08:45:30',
          Reason: null
        },
        {
          id: 4,
          Company_Name: 'Sunshine Retailers',
          Email: 'orders@sunshineretail.com',
          Subject: 'Order Processing Delay',
          File_Path: null,
          Email_send_Date: '2025-05-20T16:10:22',
          Email_Status: 'Failed',
          Date: '2025-05-20T16:10:22',
          Reason: 'Invalid recipient email address'
        },
        {
          id: 5,
          Company_Name: 'Evergreen Landscaping',
          Email: 'accounts@evergreenlandscape.com',
          Subject: 'Service Agreement Renewal',
          File_Path: '/contracts/evergreen_2025_renewal.pdf',
          Email_send_Date: null,
          Email_Status: 'Draft',
          Date: '2025-05-25T10:05:00',
          Reason: null
        },
        {
          id: 6,
          Company_Name: 'Pioneer Investments',
          Email: 'investor.relations@pioneerfunds.com',
          Subject: 'Q2 Financial Report',
          File_Path: '/reports/pioneer_q2_2025.xlsx',
          Email_send_Date: null,
          Email_Status: 'Draft',
          Date: '2025-06-01T11:30:00',
          Reason: null
        },
        {
          id: 7,
          Company_Name: 'Quantum Research Labs',
          Email: 'research@quantumlabs.org',
          Subject: 'Research Partnership Opportunity',
          File_Path: '/partnerships/quantum_research_proposal.pdf',
          Email_send_Date: '2025-06-10T09:15:45',
          Email_Status: 'Sent',
          Date: '2025-06-10T09:15:45',
          Reason: null
        },
        {
          id: 8,
          Company_Name: 'Sunrise Healthcare',
          Email: 'admin@sunrisehealthcare.med',
          Subject: 'Medical Equipment Invoice #SH-2025-438',
          File_Path: '/invoices/sh_2025_438.pdf',
          Email_send_Date: '2025-06-12T13:40:10',
          Email_Status: 'Failed',
          Date: '2025-06-12T13:40:10',
          Reason: 'Server timeout'
        },
        {
          id: 9,
          Company_Name: 'Cascade Financial',
          Email: 'support@cascadefinancial.com',
          Subject: 'Account Statement - June 2025',
          File_Path: '/statements/cascade_june2025.pdf',
          Email_send_Date: '2025-06-15T08:00:00',
          Email_Status: 'Pending',
          Date: '2025-06-15T08:00:00',
          Reason: null
        },
        {
          id: 10,
          Company_Name: 'Horizon Media Group',
          Email: 'contracts@horizonmedia.co',
          Subject: 'Digital Marketing Contract',
          File_Path: '/contracts/horizon_marketing_2025.pdf',
          Email_send_Date: null,
          Email_Status: 'Draft',
          Date: '2025-06-18T15:22:30',
          Reason: null
        }
      ];

      // Filter by search term if provided
      const filteredData = searchTerm 
        ? mockData.filter(item => 
            item.Company_Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.Email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.Subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.Email_Status && item.Email_Status.toLowerCase().includes(searchTerm.toLowerCase()))
          )
        : mockData;

      // Calculate pagination
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedData = filteredData.slice(startIndex, endIndex);
      
      resolve({
        success: true,
        data: {
          rows: paginatedData,
          total: filteredData.length,
          page: page,
          pageSize: pageSize,
          totalPages: Math.ceil(filteredData.length / pageSize)
        }
      });
    }, 800);
  });
};
