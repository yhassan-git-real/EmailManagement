import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import EmailComposer from '../components/EmailComposer';
import DataTable from '../components/DataTable';
import SelectionPreview from '../components/SelectionPreview';
import FilePreviewer from '../components/FilePreviewer';
import TemplateSelector from '../components/TemplateSelector';
import { EnvelopeIcon, PencilSquareIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { mockSendEmail, fetchEmailTableData, emailTemplates } from '../utils/mockApi';

const ComposePage = ({ connectionInfo, onDisconnect }) => {
  const [showComposer, setShowComposer] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(5);
  const [totalRows, setTotalRows] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);const [emailPreData, setEmailPreData] = useState({
    to: [],
    subject: '',
    templateId: 'default'
  });
  
  // Define table columns
  const columns = [
    { key: 'Company_Name', label: 'Company', width: 'w-40' },
    { key: 'Email', label: 'Email', width: 'w-48' },
    { key: 'Subject', label: 'Subject', width: 'w-64' },
    { key: 'File_Path', label: 'File', type: 'file', width: 'w-40' },
    { key: 'Email_send_Date', label: 'Send Date', type: 'datetime', width: 'w-40' },
    { key: 'Email_Status', label: 'Status', type: 'status', width: 'w-28',
      filterOptions: ['Sent', 'Failed', 'Pending', 'Draft'] },
    { key: 'Date', label: 'Created', type: 'date', width: 'w-32' },
    { key: 'Reason', label: 'Reason', width: 'w-48' }
  ];
  
  // Load table data
  useEffect(() => {
    loadTableData();
  }, [currentPage, pageSize, searchTerm]);
  
  // Load table data with pagination and search
  const loadTableData = async () => {
    setIsLoading(true);
    try {
      const response = await fetchEmailTableData(currentPage, pageSize, searchTerm);
      if (response.success) {
        setTableData(response.data.rows);
        setTotalRows(response.data.total);
      }
    } catch (error) {
      // Removed toast notification as per requirement
      console.error('Error loading table data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle row selection
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
  };
  
  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  
  // Handle search
  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset to first page when searching
  };
  
  // Handle file preview
  const handleFilePreview = (filePath) => {
    setSelectedFile(filePath);
  };
    // Handle submit button click from the data table
  const handleSubmit = (tableSelectedRows) => {
    if (tableSelectedRows.length === 0) return;
    // Update our selected rows with the ones from the table
    setSelectedRows(tableSelectedRows);
    // Then call the compose function
    handleComposeWithSelected();
  };  
  
  // Handle compose with selected rows
  const handleComposeWithSelected = async () => {
    if (selectedRows.length === 0) return;
    
    // Extract emails and subject
    const emails = selectedRows.map(row => row.Email);
    
    // Set subject from first selected row or empty if multiple rows selected
    let subject = '';
    if (selectedRows.length === 1 && selectedRows[0].Subject) {
      subject = selectedRows[0].Subject;
    }
    
    // For row selection, use the default template
    try {
      const response = await fetchEmailTemplates();
      const defaultTemplate = response.success ? 
        response.data.find(t => t.id === 'default') : null;
      
      // Set pre-populated data with default template
      setEmailPreData({
        to: emails,
        subject: subject,
        templateId: 'default', // Use default template ID
        useDefaultTemplate: true, // Flag to indicate use default template
        templateBody: defaultTemplate?.body || '<p>Please enter your message here.</p>' // Include the actual template body
      });
      
      // Skip template selector and open composer directly with default template
      setShowComposer(true);
    } catch (error) {
      console.error('Error preparing email composer:', error);
      
      // Set basic data with flag to use default template even if we couldn't fetch it
      setEmailPreData({
        to: emails,
        subject: subject,
        templateId: 'default',
        useDefaultTemplate: true
      });
      
      setShowComposer(true);
      // Removed toast notification as per requirement
    }
  };
  
  // Handle sending email
  const handleSendEmail = async (emailData) => {
    try {
      // Removed toast notification for sending email as per requirement
      
      // Call mock API to simulate sending
      const response = await mockSendEmail(emailData);
      
      // Handle successful response
      console.log('Email sent successfully:', response);
      // Removed toast notification as per requirement
      
      // Close the composer
      setShowComposer(false);
      
      // Clear draft from localStorage if it exists
      localStorage.removeItem('emailDraft');
      
      // Clear selected rows
      setSelectedRows([]);
      
      // Reload table data to reflect changes
      loadTableData();
      
    } catch (error) {
      console.error('Error sending email:', error);
      // Removed toast notification as per requirement
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
                  Compose and send emails with our modern email composer. 
                  Add recipients, attachments, and use the rich text editor for formatting.
                </p>
                <div className="flex space-x-2">                  <button
                    onClick={() => {
                      // For "Compose New Email" don't use any template - start with completely empty body
                      // Clear any selected rows to ensure this is truly independent
                      setSelectedRows([]);
                      
                      setEmailPreData({ 
                        to: [], 
                        subject: '', 
                        templateId: '', // No template
                        useDefaultTemplate: false, // Flag to indicate not to use default template
                        templateBody: '<p></p>' // Empty body
                      });
                      
                      // Open composer directly with empty body
                      setShowComposer(true);
                    }}
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
            
            {/* Selection Preview - Only shown when rows are selected */}
            {selectedRows.length > 0 && (
              <SelectionPreview
                selectedRows={selectedRows}
                onClose={() => setSelectedRows([])}
                onComposeWithSelected={handleComposeWithSelected}
              />
            )}
              {/* Data Table Section */}
            <div className="bg-white rounded-lg shadow mb-4 relative overflow-x-hidden">
              <div className="p-3 border-b border-gray-200">
                <h2 className="text-sm font-medium text-gray-700">Database Email Records</h2>
                <p className="text-xs text-gray-500">
                  Select rows to compose emails from database records. The system will auto-fill recipient and subject information.
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
                  onSubmit={handleSubmit} // Pass handleSubmit to DataTable
                />
              </div>            </div>
          </div>
        </main>
      </div>      {/* Template Selector Modal */}      {showTemplateSelector && (
        <TemplateSelector
          initialTemplateId={emailPreData.templateId}
          onSelectTemplate={(template) => {
            // Update template ID and body in preData
            setEmailPreData(prev => ({
              ...prev,
              templateId: template.id,
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
      
      <Footer />
    </div>
  );
};

export default ComposePage;
