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
          icon: <LockClosedIcon className="h-5 w-5 mr-2 text-success" />,
          label: 'Private Access'
        };
      case 'specific':
        return {
          icon: <UserGroupIcon className="h-5 w-5 mr-2 text-accent-violet" />,
          label: 'Custom Access'
        };
      case 'anyone':
      default:
        return {
          icon: <GlobeAltIcon className="h-5 w-5 mr-2 text-primary-400" />,
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
        className="group inline-flex items-center px-3 py-1.5 border border-dark-300/50 text-xs font-medium rounded-lg shadow-sm text-text-secondary bg-dark-500/50 hover:bg-dark-400/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-700 focus:ring-primary-500 transition-all duration-200 transform hover:-translate-y-0.5 hover:border-primary-500/30 hover:shadow-glow-sm"
        title="Configure Google Drive sharing permissions"
      >
        <CloudIcon className="h-5 w-5 mr-2 text-text-muted transition-transform duration-200 group-hover:text-primary-400" />
        <span className="flex items-center">GDrive: {label} <ChevronDownIcon className={`h-4 w-4 ml-1 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} /></span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-dark-600 rounded-xl shadow-lg z-50 border border-dark-300/50 backdrop-blur-xl">
          <div className="p-3 border-b border-dark-300/50 bg-dark-700/80 rounded-t-xl">
            <h3 className="text-sm font-medium text-text-primary">Google Drive Sharing</h3>
            <p className="text-xs text-text-muted mt-1">Select who can access files when uploaded to Google Drive</p>
          </div>

          <div className="p-2">
            <button
              type="button"
              className={`w-full text-left px-3 py-2 text-sm rounded-lg flex items-center transition-all ${localSharingOption === 'anyone' ? 'bg-primary-500/20 text-primary-400' : 'hover:bg-dark-500/50 text-text-secondary'}`}
              onClick={() => handleChange('anyone')}
            >
              <GlobeAltIcon className="h-5 w-5 mr-2 text-primary-400" />
              <div>
                <div className="font-medium">Public Access</div>
                <div className="text-xs text-text-muted">Anyone with the link</div>
              </div>
            </button>

            <button
              type="button"
              className={`w-full text-left px-3 py-2 text-sm rounded-lg flex items-center transition-all ${localSharingOption === 'restricted' ? 'bg-success/20 text-success' : 'hover:bg-dark-500/50 text-text-secondary'}`}
              onClick={() => handleChange('restricted')}
            >
              <LockClosedIcon className="h-5 w-5 mr-2 text-success" />
              <div>
                <div className="font-medium">Private Access</div>
                <div className="text-xs text-text-muted">Recipient only</div>
              </div>
            </button>

            <button
              type="button"
              className={`w-full text-left px-3 py-2 text-sm rounded-lg flex items-center transition-all ${localSharingOption === 'specific' ? 'bg-accent-violet/20 text-accent-violet' : 'hover:bg-dark-500/50 text-text-secondary'}`}
              onClick={() => handleChange('specific')}
            >
              <UserGroupIcon className="h-5 w-5 mr-2 text-accent-violet" />
              <div>
                <div className="font-medium">Custom Access</div>
                <div className="text-xs text-text-muted">Specific emails</div>
              </div>
            </button>

            {localSharingOption === 'specific' && (
              <div className="mt-2 px-3">
                <label htmlFor="specific-emails" className="block text-xs font-medium text-text-secondary mb-1">
                  Enter email addresses (comma separated)
                </label>
                <textarea
                  id="specific-emails"
                  className="w-full px-2 py-1 text-xs border border-dark-300/50 rounded-lg bg-dark-700/80 text-text-primary placeholder-text-muted focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  rows="2"
                  value={tempSpecificEmails}
                  onChange={handleSpecificEmailsChange}
                  placeholder="email1@example.com, email2@example.com"
                ></textarea>
                <div className="mt-2 flex justify-end space-x-2">
                  <div className="text-xs text-text-muted flex items-center">
                    {Array.isArray(specificEmails) && specificEmails.length > 0 ?
                      `${specificEmails.length} email(s) saved` : ''}
                  </div>
                  <button
                    type="button"
                    className="px-3 py-1 text-xs font-medium rounded-lg text-white bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-700 focus:ring-primary-500 transition-all"
                    onClick={saveSpecificEmails}
                  >
                    Save
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="px-3 py-2 bg-dark-700/80 border-t border-dark-300/50 text-xs text-text-muted rounded-b-xl">
            Large files are automatically uploaded to Google Drive
          </div>
        </div>
      )}
    </div>
  );
};

export default GDriveShareButton;
