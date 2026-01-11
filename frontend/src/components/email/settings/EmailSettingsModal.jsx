import React, { useState, useEffect } from 'react';
import { XMarkIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { validateSMTPCredentials } from '../../../utils/automationApi';
import { toast } from 'react-toastify';
import DraggableWithRef from '../../dragdrop/DraggableWithRef';

const EmailSettingsModal = ({ onClose, onSave, initialData = {} }) => {
  const [formData, setFormData] = useState(() => {
    const savedSettings = localStorage.getItem('emailSettings');
    if (savedSettings) {
      try {
        return JSON.parse(savedSettings);
      } catch (e) {
        console.error('Error parsing saved email settings', e);
      }
    }
    return {
      senderEmail: initialData.senderEmail || '',
      smtpServer: initialData.smtpServer || '',
      port: initialData.port || '587',
      authType: initialData.authType || 'login',
      username: initialData.username || '',
      password: initialData.password || '',
      useTLS: initialData.useTLS !== undefined ? initialData.useTLS : true,
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

    if (['smtpServer', 'port', 'username', 'password', 'useTLS'].includes(name)) {
      setValidationStatus({ isValidating: false, isValid: null, message: '' });
    }
  };

  useEffect(() => {
    const savedSettings = localStorage.getItem('emailSettings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setFormData(prev => ({ ...prev, ...parsedSettings }));
      } catch (e) {
        console.error('Error parsing saved email settings', e);
      }
    }
  }, []);

  const handleValidateSmtp = async () => {
    setValidationStatus({ isValidating: true, isValid: null, message: 'Validating...' });

    try {
      const credentials = {
        smtpServer: formData.smtpServer,
        port: parseInt(formData.port, 10),
        username: formData.username,
        password: formData.password,
        useTLS: formData.useTLS
      };

      const response = await validateSMTPCredentials(credentials);

      if (response.success) {
        setValidationStatus({ isValidating: false, isValid: true, message: 'SMTP valid!' });
      } else {
        setValidationStatus({ isValidating: false, isValid: false, message: response.message || 'Validation failed' });
      }
    } catch (error) {
      setValidationStatus({ isValidating: false, isValid: false, message: error.message || 'Error' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      localStorage.setItem('emailSettings', JSON.stringify(formData));
      toast.success('SMTP configuration saved');
      if (onSave) onSave(formData);
    } catch (error) {
      console.error('Error saving SMTP config:', error);
      toast.error(`Error: ${error.message}`);
    }
  };

  const inputClass = "w-full px-2.5 py-1.5 text-sm border border-dark-300/50 rounded-lg bg-dark-500/50 text-text-primary placeholder-text-muted focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500";

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <DraggableWithRef handle=".modal-handle">
        <div className="bg-dark-600 rounded-xl shadow-2xl w-full max-w-md border border-dark-300/50">
          {/* Header */}
          <div className="modal-handle flex items-center justify-between px-4 py-2.5 border-b border-dark-300/50 bg-dark-700/80 rounded-t-xl cursor-grab">
            <h3 className="text-base font-medium text-text-primary font-display">Email Configuration</h3>
            <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors">
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-4">
            {/* Two column grid */}
            <div className="grid grid-cols-2 gap-3">
              {/* Sender Email - Full width */}
              <div className="col-span-2">
                <label className="block text-xs font-medium text-text-secondary mb-1">Sender Email</label>
                <input
                  type="email"
                  name="senderEmail"
                  value={formData.senderEmail}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="name@company.com"
                  required
                />
              </div>

              {/* SMTP Server - Full width */}
              <div className="col-span-2">
                <label className="block text-xs font-medium text-text-secondary mb-1">SMTP Server</label>
                <input
                  type="text"
                  name="smtpServer"
                  value={formData.smtpServer}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="smtp.example.com"
                  required
                />
              </div>

              {/* Port */}
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Port</label>
                <input
                  type="text"
                  name="port"
                  value={formData.port}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
              </div>

              {/* Auth Type */}
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Auth Type</label>
                <select
                  name="authType"
                  value={formData.authType}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="login">Login</option>
                  <option value="plain">Plain</option>
                  <option value="cram-md5">CRAM-MD5</option>
                  <option value="oauth2">OAuth2</option>
                </select>
              </div>

              {/* Username */}
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
              </div>

              {/* Use TLS */}
              <div className="col-span-2 flex items-center">
                <input
                  type="checkbox"
                  id="useTLS"
                  name="useTLS"
                  checked={formData.useTLS}
                  onChange={handleChange}
                  className="h-3.5 w-3.5 text-primary-600 focus:ring-primary-500 border-dark-300 rounded bg-dark-500"
                />
                <label htmlFor="useTLS" className="ml-2 text-sm text-text-secondary">Use TLS</label>
              </div>

              {/* Validation Status */}
              {validationStatus.message && (
                <div className={`col-span-2 rounded-lg px-3 py-2 flex items-center text-sm ${validationStatus.isValid === true
                    ? 'bg-success/20 text-success-light border border-success/30'
                    : validationStatus.isValid === false
                      ? 'bg-danger/20 text-danger-light border border-danger/30'
                      : 'bg-primary-500/20 text-primary-300 border border-primary-500/30'
                  }`}>
                  {validationStatus.isValid === true && <CheckCircleIcon className="h-4 w-4 mr-2" />}
                  {validationStatus.isValid === false && <ExclamationCircleIcon className="h-4 w-4 mr-2" />}
                  <span>{validationStatus.message}</span>
                </div>
              )}

              {/* Test Button */}
              <div className="col-span-2">
                <button
                  type="button"
                  onClick={handleValidateSmtp}
                  disabled={validationStatus.isValidating}
                  className="w-full py-1.5 text-sm font-medium text-white bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 transition-all"
                >
                  {validationStatus.isValidating ? 'Validating...' : 'Test SMTP'}
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-sm font-medium text-text-secondary bg-dark-500/50 border border-dark-300/50 rounded-lg hover:bg-dark-400/50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-primary-500 to-accent-violet rounded-lg hover:from-primary-600 hover:to-accent-violet/90 transition-all"
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