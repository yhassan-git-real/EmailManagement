import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import EmailComposer from '../components/EmailComposer';
import DataTable from '../components/DataTable';
import FilePreviewer from '../components/FilePreviewer';
import TemplateSelector from '../components/TemplateSelector';
import EmailSettingsModal from '../components/EmailSettingsModal';
import { EnvelopeIcon, PencilSquareIcon, DocumentTextIcon, Cog8ToothIcon } from '@heroicons/react/24/outline';
import { sendManualEmail, fetchEmailTableData, fetchEmailTemplates, updateEmailRecordStatus } from '../utils/apiClient';
import { toast } from 'react-toastify';

const ComposePage = ({ connectionInfo, onDisconnect }) => {
  const [showComposer, setShowComposer] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [showEmailSettings, setShowEmailSettings] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(5);
  const [totalRows, setTotalRows] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [emailPreData, setEmailPreData] = useState({
    to: [],
    subject: '',
    templateId: 'default'
  });
  
  const [activeStatus, setActiveStatus] = useState('All');
  
  // Define table columns
  const columns = [
    { key: 'company_name', label: 'Company', width: 'w-40' },
    { key: 'email', label: 'Email', width: 'w-48' },
    { key: 'subject', label: 'Subject', width: 'w-64' },
    { key: 'file_path', label: 'File', type: 'file', width: 'w-40' },
    { key: 'email_send_date', label: 'Send Date', type: 'datetime', width: 'w-40' },
    { key: 'email_status', label: 'Status', type: 'status', width: 'w-28',
      filterOptions: ['Success', 'Failed', 'Pending'] },
    { key: 'date', label: 'Created', type: 'date', width: 'w-32' },
    { key: 'reason', label: 'Reason', width: 'w-48' }
  ];
  
  // Use ref to track if we should reload data to prevent infinite loops
  const shouldLoadRef = React.useRef(true);
  const loadingRef = React.useRef(false);
  const executeCountRef = React.useRef(0);
  const isInitialRender = React.useRef(true);
  
  // Load table data only on initial render
  useEffect(() => {
    // Only load data once on component mount
    if (shouldLoadRef.current && !loadingRef.current && isInitialRender.current) {
      isInitialRender.current = false; // Mark initial render as complete
      shouldLoadRef.current = false; // Prevent further automatic loads
      
      // Deliberately delay initial load to avoid React 18 double-render issues
      const timer = setTimeout(() => {
        loadTableData(false); // Initial load without logging
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, []); // Empty dependency array - only run once
  
  // Load table data with pagination, search, and status filter
  const loadTableData = async (shouldLog = true) => {
    // Prevent concurrent API calls
    if (loadingRef.current) {
      console.log('Already loading data, skipping request');
      return;
    }
    
    loadingRef.current = true;
    setIsLoading(true);
    
    try {
      const executeId = ++executeCountRef.current;
      const pageToLoad = currentPage;
      
      if (shouldLog) {
        console.log(`[Execute #${executeId}] Loading data for page ${pageToLoad}, status: ${activeStatus}`);
      }
      
      const response = await fetchEmailTableData(pageToLoad, pageSize, searchTerm, activeStatus);
      if (response.success) {
        setTableData(response.data.rows);
        setTotalRows(response.data.total);
        
        // Ensure currentPage state is maintained
        if (pageToLoad !== currentPage) {
          setCurrentPage(pageToLoad);
        }
      }
    } catch (error) {
      console.error('Error loading table data:', error);
    } finally {
      setIsLoading(false);
      loadingRef.current = false;
    }
  };
  
  // Handle status filter change - only update state, no API call
  const handleStatusFilterChange = (status) => {
    setActiveStatus(status);
    // Status changes do NOT trigger API calls, only updates the UI filter selection
  };
  
  // Handle row selection (simplified - no auto-compose)
  const handleRowSelect = (row, isSelected, selectAll = false) => {
    if (selectAll) {
      if (isSelected) {
        setSelectedRows(row);
      } else {
        setSelectedRows([]);
      }
      return;
    }
    
    if (isSelected) {
      setSelectedRows(prev => [...prev, row]);
    } else {
      setSelectedRows(prev => prev.filter(item => item.id !== row.id));
    }
    // No longer triggers email composition when rows are selected
  };
  
  // Handle page change - explicitly control when API is called
  const handlePageChange = (page) => {
    // Store the page in state
    setCurrentPage(page);
    
    // Execute button must be clicked to fetch new data
    // Not calling loadTableData() here anymore
  };
  
  // Handle execute button click - the ONLY place that triggers API calls
  const handleExecuteFilter = () => {
    console.log('Execute button clicked - fetching data with filters');
    loadTableData();
  };
  
  // Handle search input change - only updates state, no API call
  const handleSearch = (term) => {
    setSearchTerm(term);
    // Search term changes do NOT trigger API calls
  };
  
  // Handle file preview
  const handleFilePreview = (filePath) => {
    setSelectedFile(filePath);
  };
  // Handle compose new email - always opens a blank composer (no connection to selected rows)
  const handleComposeNew = () => {
    // Always use a completely blank email form
    setEmailPreData({
      to: [], 
      subject: '',
      templateId: '', // No template
      useDefaultTemplate: false, // Flag to indicate not to use default template
      templateBody: '<p></p>' // Empty body
    });
    
    // Open composer with empty form
    setShowComposer(true);
  };
  
  // Handle sending email
  const handleSendEmail = async (emailData) => {
    try {
      // Show a loading toast
      const toastId = toast.loading('Sending email...');
      
      // Call real API to send email
      const response = await sendManualEmail(emailData);
      
      if (response.success) {
        // Update toast to success
        toast.update(toastId, { 
          render: 'Email sent successfully', 
          type: 'success', 
          isLoading: false,
          autoClose: 3000
        });
        
        // Close the composer
        setShowComposer(false);
        
        // Clear draft from localStorage if it exists
        localStorage.removeItem('emailDraft');
        
        // Clear selected rows
        setSelectedRows([]);
        
        // Reload table data to reflect changes
        loadTableData();
      } else {
        // Update toast to error
        toast.update(toastId, { 
          render: `Failed to send email: ${response.message}`, 
          type: 'error', 
          isLoading: false,
          autoClose: 5000
        });
      }
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error(`Error sending email: ${error.message}`);
    }
  };

  // Handle status change - removed unnecessary toast notifications
  const handleStatusChange = async (emailId, newStatus) => {
    try {
      const response = await updateEmailRecordStatus(emailId, newStatus);
      
      if (response.success) {
        // Only show toast for important status changes
        if (newStatus === 'Failed') {
          toast.error(`Email status marked as ${newStatus}`);
        }
        // Reload table data to reflect changes
        loadTableData();
      } else {
        console.error(`Failed to update status: ${response.message}`);
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header connectionInfo={connectionInfo} onDisconnect={onDisconnect} />      <div className="flex flex-row flex-grow relative">
        <main className="flex-grow py-3 px-4 bg-gradient-to-b from-gray-50 to-gray-100 w-full overflow-x-hidden">
          <div className="max-w-7xl mx-auto w-full relative">
            <h1 className="text-sm font-medium mb-2 text-primary-600 pl-1 flex items-center">
              <EnvelopeIcon className="h-3.5 w-3.5 mr-1" />
              Manual Email Compose
            </h1>
              {/* Introduction Card */}
            <div className="bg-white rounded-lg shadow p-3 mb-4 relative overflow-hidden">              <div className="flex flex-col items-start">
                <h2 className="text-base font-medium text-gray-800">Create New Email</h2>
                <p className="text-gray-600 max-w-md text-xs mb-3">
                  Compose and send emails using file-based templates. 
                  Add recipients, attachments, and use the rich text editor for formatting.
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowEmailSettings(true)}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-primary-500 mr-2"
                  >
                    <Cog8ToothIcon className="mr-1 h-4 w-4" />
                    Email Configuration
                  </button>
                  <button
                    onClick={handleComposeNew}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    <PencilSquareIcon className="mr-1 h-4 w-4" />
                    Compose New Email
                  </button><button
                    onClick={() => {
                      setEmailPreData({ 
                        to: [], 
                        subject: '', 
                        templateId: 'default',
                        useDefaultTemplate: false // This will be set by the template selector
                      });
                      try {
                        setShowTemplateSelector(true);
                      } catch (error) {
                        console.error('Error showing template selector:', error);
                        // Removed toast notification as per requirement
                        setShowComposer(true);
                      }
                    }}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    <DocumentTextIcon className="mr-1 h-4 w-4" />
                    Use Template
                  </button>
                </div>
              </div>
            </div>
            
            {/* Selection Preview removed - no auto-compose functionality */}
              {/* Data Table Section */}
            <div className="bg-white rounded-lg shadow mb-4 relative overflow-x-hidden">
              <div className="p-3 border-b border-gray-200">
                <h2 className="text-sm font-medium text-gray-700">Database Email Records</h2>
                <p className="text-xs text-gray-500">
                  View and filter email records from the database.
                  <span className="ml-1 text-primary-600 font-medium">Click "Execute" after selecting filters to load data.</span>
                </p>
              </div>
              
              {/* Data Table Component */}
              <div className="overflow-hidden">
                <DataTable
                  data={tableData}
                  columns={columns}
                  isLoading={isLoading}
                  totalRows={totalRows}
                  pageSize={pageSize}
                  currentPage={currentPage}
                  onPageChange={handlePageChange}
                  onRowSelect={handleRowSelect}
                  onSearch={handleSearch}
                  onSearchChange={handleSearch}
                  selectedRows={selectedRows}
                  compact={true}
                  onStatusChange={handleStatusFilterChange}
                  onExecute={handleExecuteFilter} // New handler for Execute button
                />
              </div>            </div>
          </div>
        </main>
      </div>      {/* Template Selector Modal */}      {showTemplateSelector && (
        <TemplateSelector
          initialTemplateId={emailPreData.templateId}
          onSelectTemplate={(template) => {
            console.log('Selected template:', template);
            
            // Update template ID and body in preData
            setEmailPreData(prev => ({
              ...prev,
              templateId: template.id,
              subject: template.subject || prev.subject, // Use template subject
              templateBody: template.body,
              useDefaultTemplate: true // Consider any selected template as "use default"
            }));
            
            // Close the template selector first, then show the composer
            setShowTemplateSelector(false);
            setTimeout(() => {
              setShowComposer(true); // Open composer after selecting template
            }, 10); // Small delay to ensure state updates properly
          }}
          onClose={() => {
            setShowTemplateSelector(false);
          }}
        />
      )}
        {/* Email Composer Component - Now accepts pre-populated data and template selection */}
      {showComposer && (
        <EmailComposer
          onClose={() => setShowComposer(false)}
          onSend={handleSendEmail}
          preData={emailPreData}
          selectedTemplate={emailPreData.templateId}
        />
      )}
      
      {/* File Previewer - For viewing attachments */}
      {selectedFile && (
        <FilePreviewer
          filePath={selectedFile}
          onClose={() => setSelectedFile(null)}
        />
      )}
      
      {/* Email Settings Modal */}
      {showEmailSettings && (
        <EmailSettingsModal 
          onClose={() => setShowEmailSettings(false)}
          onSave={() => {
            setShowEmailSettings(false);
            // Optionally reload table data or show a success message
          }}
        />
      )}
      
      <Footer />
    </div>
  );
};

export default ComposePage;
