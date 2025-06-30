import React, { useState, useEffect } from 'react';
import { XMarkIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { getSmtpConfig, updateSmtpConfig } from '../utils/apiClient';
import { toast } from 'react-toastify';
import DraggableWithRef from './DraggableWithRef';

const EmailSettingsModal = ({ onClose, onSave, initialData = {} }) => {
  const [formData, setFormData] = useState(() => {
    // Try to load saved settings from localStorage
    const savedSettings = localStorage.getItem('emailSettings');
    if (savedSettings) {
      try {
        return JSON.parse(savedSettings);
      } catch (e) {
        console.error('Error parsing saved email settings', e);
      }
    }
    
    // Use initialData from props or default values
    return {
      senderEmail: initialData.senderEmail || '',
      smtpServer: initialData.smtpServer || '',
      port: initialData.port || '587',
      authType: initialData.authType || 'login',
      username: initialData.username || '',
      password: initialData.password || '',
      useTLS: initialData.useTLS !== undefined ? initialData.useTLS : true
    };
  });
  
  const [validationStatus, setValidationStatus] = useState({
    isValidating: false,
    isValid: null,
    message: ''
  });
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Reset validation status when fields change
    if (name === 'smtpServer' || name === 'port' || name === 'username' || name === 'password' || name === 'useTLS') {
      setValidationStatus({
        isValidating: false,
        isValid: null,
        message: ''
      });
    }
  };
  
  // Load current SMTP configuration when modal opens
  useEffect(() => {
    const loadSmtpConfig = async () => {
      try {
        const response = await getSmtpConfig();
        
        if (response.success) {
          setFormData({
            senderEmail: response.data.sender_email || '',
            smtpServer: response.data.smtp_server || '',
            port: response.data.smtp_port || '587',
            authType: 'login', // Default auth type
            username: response.data.smtp_username || '',
            password: '', // Password is not returned for security reasons
            useTLS: response.data.use_tls !== false
          });
        }
      } catch (error) {
        console.error('Error loading SMTP config:', error);
      }
    };
    
    loadSmtpConfig();
  }, []);
  
  const handleValidateSmtp = async () => {
    setValidationStatus({
      isValidating: true,
      isValid: null,
      message: 'Validating SMTP settings...'
    });
    
    try {
      // We'll use our update function to validate
      // In a real implementation, you might want a separate validation endpoint
      const configData = {
        smtp_server: formData.smtpServer,
        smtp_port: parseInt(formData.port, 10),
        smtp_username: formData.username,
        smtp_password: formData.password,
        sender_email: formData.senderEmail,
        use_tls: formData.useTLS
      };
      
      const response = await updateSmtpConfig(configData);
      
      if (response.success) {
        setValidationStatus({
          isValidating: false,
          isValid: true,
          message: 'SMTP credentials are valid!'
        });
      } else {
        setValidationStatus({
          isValidating: false, 
          isValid: false,
          message: response.message || 'SMTP validation failed'
        });
      }
    } catch (error) {
      setValidationStatus({
        isValidating: false,
        isValid: false,
        message: 'Error validating SMTP: ' + (error.message || 'Unknown error')
      });
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const configData = {
        smtp_server: formData.smtpServer,
        smtp_port: parseInt(formData.port, 10),
        smtp_username: formData.username,
        smtp_password: formData.password,
        sender_email: formData.senderEmail,
        use_tls: formData.useTLS
      };
      
      const response = await updateSmtpConfig(configData);
      
      if (response.success) {
        // Save to localStorage for convenience
        localStorage.setItem('emailSettings', JSON.stringify(formData));
        toast.success('SMTP configuration saved successfully');
        
        // Call the onSave prop
        if (onSave) {
          onSave(formData);
        }
      } else {
        toast.error(`Failed to save SMTP configuration: ${response.message}`);
      }
    } catch (error) {
      console.error('Error saving SMTP config:', error);
      toast.error(`Error saving configuration: ${error.message}`);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <DraggableWithRef handle=".modal-handle">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
          <div className="modal-handle flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-lg cursor-grab">
            <h3 className="text-lg font-medium text-gray-700">Email Configuration Settings</h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="p-4">
            <div className="space-y-4">
              <div>
                <label htmlFor="senderEmail" className="block text-sm font-medium text-gray-700 mb-1">
                  Sender Email
                </label>
                <input
                  type="email"
                  id="senderEmail"
                  name="senderEmail"
                  value={formData.senderEmail}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="name@company.com"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="smtpServer" className="block text-sm font-medium text-gray-700 mb-1">
                  SMTP Server
                </label>
                <input
                  type="text"
                  id="smtpServer"
                  name="smtpServer"
                  value={formData.smtpServer}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="smtp.example.com"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="port" className="block text-sm font-medium text-gray-700 mb-1">
                    Port
                  </label>
                  <input
                    type="text"
                    id="port"
                    name="port"
                    value={formData.port}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="authType" className="block text-sm font-medium text-gray-700 mb-1">
                    Authentication
                  </label>
                  <select
                    id="authType"
                    name="authType"
                    value={formData.authType}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  >
                    <option value="login">Login</option>
                    <option value="plain">Plain</option>
                    <option value="cram-md5">CRAM-MD5</option>
                    <option value="oauth2">OAuth2</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  required
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="useTLS"
                  name="useTLS"
                  checked={formData.useTLS}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="useTLS" className="ml-2 block text-sm text-gray-700">
                  Use TLS
                </label>
              </div>
              
              {/* Validation status display */}
              {validationStatus.message && (
                <div className={`rounded-md p-3 flex items-center ${
                  validationStatus.isValid === true 
                    ? 'bg-green-50 text-green-700' 
                    : validationStatus.isValid === false 
                      ? 'bg-red-50 text-red-700'
                      : 'bg-blue-50 text-blue-700'
                }`}>
                  {validationStatus.isValid === true ? (
                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                  ) : validationStatus.isValid === false ? (
                    <ExclamationCircleIcon className="h-5 w-5 mr-2" />
                  ) : null}
                  <span>{validationStatus.message}</span>
                </div>
              )}
              
              {/* Test SMTP button */}
              <div>
                <button 
                  type="button"
                  onClick={handleValidateSmtp}
                  disabled={validationStatus.isValidating}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {validationStatus.isValidating ? 'Validating...' : 'Test SMTP Connection'}
                </button>
              </div>
            </div>
            
            <div className="mt-5 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </DraggableWithRef>
    </div>
  );
};

export default EmailSettingsModal;