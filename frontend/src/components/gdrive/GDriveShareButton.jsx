import React, { useState, useEffect, useRef } from 'react';
import { CloudIcon, GlobeAltIcon, LockClosedIcon, UserGroupIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

// Local storage key for specific emails
const STORAGE_KEY = 'gdrive_specific_emails';

/**
 * GDriveShareButton - Compact button for Google Drive sharing settings
 * Fits into the control panel alongside other action buttons
 */
const GDriveShareButton = ({ 
  sharingOption = 'anyone',
  specificEmails = [],
  onChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [localSharingOption, setLocalSharingOption] = useState(sharingOption);
  
  // Convert array to comma-separated string for UI display
  const [tempSpecificEmails, setTempSpecificEmails] = useState(
    Array.isArray(specificEmails) ? specificEmails.join(',') : ''
  );

  // Update local state when props change
  useEffect(() => {
    setLocalSharingOption(sharingOption);
  }, [sharingOption]);
  
  // Load emails from localStorage on initial render
  useEffect(() => {
    const savedEmails = localStorage.getItem(STORAGE_KEY);
    if (savedEmails) {
      try {
        const emailsArray = JSON.parse(savedEmails);
        if (Array.isArray(emailsArray) && emailsArray.length > 0) {
          // Only use localStorage emails if no emails are provided in props
          if (!Array.isArray(specificEmails) || specificEmails.length === 0) {
            setTempSpecificEmails(emailsArray.join(','));
            // Update parent component with saved emails if sharing option is 'specific'
            if (sharingOption === 'specific' && onChange) {
              onChange({ 
                sharingOption: 'specific',
                specificEmails: emailsArray
              });
            }
          }
        }
      } catch (e) {
        console.error('Error parsing saved emails from localStorage', e);
      }
    }
  }, []);
  
  // Update tempSpecificEmails when the specificEmails prop changes
  useEffect(() => {
    if (Array.isArray(specificEmails)) {
      setTempSpecificEmails(specificEmails.join(','));
    } else {
      setTempSpecificEmails('');
    }
  }, [specificEmails]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleChange = (option) => {
    console.log(`Changing sharing option to: ${option}`);
    setLocalSharingOption(option);
    
    if (onChange) {
      if (option !== 'specific') {
        // When changing to a non-specific option, we still preserve the emails
        // in localStorage but don't send them to parent component
        onChange({ sharingOption: option });
        setIsOpen(false);
      } else {
        // For 'specific' option, try to load saved emails from localStorage if available
        let emailsToUse = [];
        
        // First check if we already have emails in the component state
        if (Array.isArray(specificEmails) && specificEmails.length > 0) {
          emailsToUse = specificEmails;
        } else {
          // Otherwise try to load from localStorage
          try {
            const savedEmails = localStorage.getItem(STORAGE_KEY);
            if (savedEmails) {
              const parsedEmails = JSON.parse(savedEmails);
              if (Array.isArray(parsedEmails) && parsedEmails.length > 0) {
                emailsToUse = parsedEmails;
                // Update the textarea with the loaded emails
                setTempSpecificEmails(parsedEmails.join(','));
              }
            }
          } catch (e) {
            console.error('Error loading emails from localStorage', e);
          }
        }
        
        onChange({ 
          sharingOption: option,
          specificEmails: emailsToUse
        });
      }
    }
  };

  const handleSpecificEmailsChange = (e) => {
    setTempSpecificEmails(e.target.value);
  };

  const saveSpecificEmails = () => {
    if (onChange) {
      // Convert comma-separated string to array, trim whitespace, and filter out empty entries
      const emailsArray = tempSpecificEmails
        .split(',')
        .map(email => email.trim())
        .filter(email => email.length > 0);
      
      // Remove duplicate emails by converting to Set and back to Array
      const uniqueEmailsArray = [...new Set(emailsArray)];
      
      console.log('Saving specific emails:', uniqueEmailsArray);
      
      // Save to localStorage for persistence across page reloads
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(uniqueEmailsArray));
      } catch (e) {
        console.error('Error saving emails to localStorage', e);
      }
      
      // Update parent component
      onChange({ 
        sharingOption: 'specific',
        specificEmails: uniqueEmailsArray
      });
      
      // Update the textarea with the deduplicated list
      if (uniqueEmailsArray.length !== emailsArray.length) {
        setTempSpecificEmails(uniqueEmailsArray.join(','));
      }
    }
    setIsOpen(false);
  };

  // Get the right icon and label based on sharing option
  const getButtonContent = () => {
    switch (localSharingOption) {
      case 'restricted':
        return {
          icon: <LockClosedIcon className="h-5 w-5 mr-2 text-green-500" />,
          label: 'Private Access'
        };
      case 'specific':
        return {
          icon: <UserGroupIcon className="h-5 w-5 mr-2 text-purple-500" />,
          label: 'Custom Access'
        };
      case 'anyone':
      default:
        return {
          icon: <GlobeAltIcon className="h-5 w-5 mr-2 text-blue-500" />,
          label: 'Public Access'
        };
    }
  };

  const { icon, label } = getButtonContent();

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="group inline-flex items-center px-3 py-1.5 border border-gray-200 text-xs font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary-500 transition-all duration-200 transform hover:-translate-y-0.5 hover:border-primary-200 hover:shadow"
        title="Configure Google Drive sharing permissions"
      >
        <CloudIcon className="h-5 w-5 mr-2 text-gray-500 transition-transform duration-200 group-hover:text-primary-500" />
        <span className="flex items-center">GDrive: {label} <ChevronDownIcon className="h-4 w-4 ml-1" /></span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg z-10 border border-gray-200">
          <div className="p-3 border-b border-gray-200 bg-gray-50">
            <h3 className="text-sm font-medium text-gray-700">Google Drive Sharing</h3>
            <p className="text-xs text-gray-500 mt-1">Select who can access files when uploaded to Google Drive</p>
          </div>
          
          <div className="p-2">
            <button
              type="button"
              className={`w-full text-left px-3 py-2 text-sm rounded-md flex items-center ${localSharingOption === 'anyone' ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'}`}
              onClick={() => handleChange('anyone')}
            >
              <GlobeAltIcon className="h-5 w-5 mr-2 text-blue-500" />
              <div>
                <div className="font-medium">Public Access</div>
                <div className="text-xs text-gray-500">Anyone with the link</div>
              </div>
            </button>
            
            <button
              type="button"
              className={`w-full text-left px-3 py-2 text-sm rounded-md flex items-center ${localSharingOption === 'restricted' ? 'bg-green-50 text-green-700' : 'hover:bg-gray-50'}`}
              onClick={() => handleChange('restricted')}
            >
              <LockClosedIcon className="h-5 w-5 mr-2 text-green-500" />
              <div>
                <div className="font-medium">Private Access</div>
                <div className="text-xs text-gray-500">Recipient only</div>
              </div>
            </button>
            
            <button
              type="button"
              className={`w-full text-left px-3 py-2 text-sm rounded-md flex items-center ${localSharingOption === 'specific' ? 'bg-purple-50 text-purple-700' : 'hover:bg-gray-50'}`}
              onClick={() => handleChange('specific')}
            >
              <UserGroupIcon className="h-5 w-5 mr-2 text-purple-500" />
              <div>
                <div className="font-medium">Custom Access</div>
                <div className="text-xs text-gray-500">Specific emails</div>
              </div>
            </button>
            
            {localSharingOption === 'specific' && (
              <div className="mt-2 px-3">
                <label htmlFor="specific-emails" className="block text-xs font-medium text-gray-700 mb-1">
                  Enter email addresses (comma separated)
                </label>
                <textarea
                  id="specific-emails"
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  rows="2"
                  value={tempSpecificEmails}
                  onChange={handleSpecificEmailsChange}
                  placeholder="email1@example.com, email2@example.com"
                ></textarea>
                <div className="mt-2 flex justify-end space-x-2">
                  <div className="text-xs text-gray-500 flex items-center">
                    {Array.isArray(specificEmails) && specificEmails.length > 0 ? 
                      `${specificEmails.length} email(s) saved` : ''}
                  </div>
                  <button
                    type="button"
                    className="px-3 py-1 text-xs font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary-500"
                    onClick={saveSpecificEmails}
                  >
                    Save
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div className="px-3 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
            Large files are automatically uploaded to Google Drive
          </div>
        </div>
      )}
    </div>
  );
};

export default GDriveShareButton;
