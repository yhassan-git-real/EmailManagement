import React, { useState, useEffect, useRef } from 'react';
import { PaperClipIcon, CheckIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Available file type options
const FILE_TYPE_OPTIONS = [
    { id: 'all', label: 'All Files', short: 'All' },
    { id: 'excel', label: 'Excel (.xlsx, .xls)', short: 'Excel' },
    { id: 'csv', label: 'CSV (.csv)', short: 'CSV' },
    { id: 'txt', label: 'Text (.txt)', short: 'TXT' },
    { id: 'pdf', label: 'PDF (.pdf)', short: 'PDF' },
];

/**
 * AttachmentSettingsCompact - Compact inline settings for smart attachment
 * Designed to fit within the control panel button row
 */
const AttachmentSettingsCompact = () => {
    const [fileCountThreshold, setFileCountThreshold] = useState(5);
    const [selectedExtensions, setSelectedExtensions] = useState(['all']);
    const [isLoading, setIsLoading] = useState(true);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const dropdownRef = useRef(null);

    // Original values for comparison
    const [originalThreshold, setOriginalThreshold] = useState(5);
    const [originalExtensions, setOriginalExtensions] = useState(['all']);

    // Load current settings on mount
    useEffect(() => {
        loadSettings();
    }, []);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Check for changes
    useEffect(() => {
        const thresholdChanged = fileCountThreshold !== originalThreshold;
        const extensionsChanged = JSON.stringify(selectedExtensions.sort()) !== JSON.stringify(originalExtensions.sort());
        setHasChanges(thresholdChanged || extensionsChanged);
    }, [fileCountThreshold, selectedExtensions, originalThreshold, originalExtensions]);

    // Auto-save when changes are made (debounced)
    useEffect(() => {
        if (!hasChanges || isLoading) return;

        const timer = setTimeout(() => {
            saveSettings();
        }, 1000);

        return () => clearTimeout(timer);
    }, [fileCountThreshold, selectedExtensions]);

    const loadSettings = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/automation/attachment-settings`);
            const data = await response.json();

            if (data.success) {
                setFileCountThreshold(data.data.fileCountThreshold);
                setSelectedExtensions(data.data.allowedExtensions);
                setOriginalThreshold(data.data.fileCountThreshold);
                setOriginalExtensions(data.data.allowedExtensions);
            }
        } catch (error) {
            console.error('Failed to load attachment settings:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const saveSettings = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/automation/attachment-settings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fileCountThreshold: fileCountThreshold,
                    allowedExtensions: selectedExtensions,
                }),
            });

            const data = await response.json();

            if (data.success) {
                setOriginalThreshold(fileCountThreshold);
                setOriginalExtensions([...selectedExtensions]);
                setHasChanges(false);
                toast.success('Attachment settings saved', { autoClose: 2000 });
            }
        } catch (error) {
            console.error('Failed to save attachment settings:', error);
            toast.error('Failed to save settings');
        }
    };

    const toggleExtension = (extensionId) => {
        if (extensionId === 'all') {
            setSelectedExtensions(['all']);
        } else {
            let newExtensions = selectedExtensions.filter(ext => ext !== 'all');

            if (newExtensions.includes(extensionId)) {
                newExtensions = newExtensions.filter(ext => ext !== extensionId);
            } else {
                newExtensions.push(extensionId);
            }

            if (newExtensions.length === 0) {
                newExtensions = ['all'];
            }

            setSelectedExtensions(newExtensions);
        }
    };

    const getSelectedLabel = () => {
        if (selectedExtensions.includes('all')) return 'All';
        if (selectedExtensions.length === 1) {
            const option = FILE_TYPE_OPTIONS.find(opt => opt.id === selectedExtensions[0]);
            return option ? option.short : selectedExtensions[0];
        }
        return `${selectedExtensions.length} types`;
    };

    if (isLoading) {
        return (
            <div className="inline-flex items-center px-3 py-1.5 border border-gray-200 text-xs font-medium rounded-md bg-gray-50 text-gray-400">
                <PaperClipIcon className="h-4 w-4 mr-1.5 animate-pulse" />
                Loading...
            </div>
        );
    }

    return (
        <div className="inline-flex items-center gap-1" ref={dropdownRef}>
            {/* Attachment Icon Label */}
            <div className="inline-flex items-center px-2 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-l-md">
                <PaperClipIcon className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Attach:</span>
            </div>

            {/* File Types Dropdown */}
            <div className="relative">
                <button
                    type="button"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="inline-flex items-center px-2 py-1.5 border border-gray-200 text-xs font-medium bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-all duration-200"
                    title="Select file types to include"
                >
                    <span className="text-gray-700">{getSelectedLabel()}</span>
                    <svg className={`ml-1 h-3 w-3 text-gray-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>

                {dropdownOpen && (
                    <div className="absolute z-20 mt-1 w-48 bg-white shadow-lg rounded-md py-1 text-sm ring-1 ring-black ring-opacity-5">
                        {FILE_TYPE_OPTIONS.map((option) => (
                            <div
                                key={option.id}
                                onClick={() => toggleExtension(option.id)}
                                className="cursor-pointer select-none relative py-2 pl-3 pr-8 hover:bg-primary-50 transition-colors duration-150"
                            >
                                <span className={`block truncate ${selectedExtensions.includes(option.id) ? 'font-medium text-primary-700' : 'text-gray-700'}`}>
                                    {option.label}
                                </span>
                                {selectedExtensions.includes(option.id) && (
                                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-primary-600">
                                        <CheckIcon className="h-4 w-4" />
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Threshold Controls */}
            <div className="inline-flex items-center border border-gray-200 bg-white">
                <button
                    type="button"
                    onClick={() => fileCountThreshold > 1 && setFileCountThreshold(fileCountThreshold - 1)}
                    className="px-1.5 py-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none transition-colors"
                    title="Decrease threshold"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                </button>
                <span className="px-1.5 py-1 text-xs font-medium text-gray-700 min-w-[20px] text-center" title={`Files ≤ ${fileCountThreshold}: direct | > ${fileCountThreshold}: ZIP`}>
                    {fileCountThreshold}
                </span>
                <button
                    type="button"
                    onClick={() => setFileCountThreshold(fileCountThreshold + 1)}
                    className="px-1.5 py-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none transition-colors"
                    title="Increase threshold"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>

            {/* Files label */}
            <span className="px-2 py-1.5 text-xs text-gray-500 border border-gray-200 bg-gray-50 rounded-r-md" title={`Files ≤ ${fileCountThreshold}: attach directly | Files > ${fileCountThreshold}: compress to ZIP`}>
                files
            </span>

            {/* Saving indicator */}
            {hasChanges && (
                <span className="ml-1 text-xs text-amber-600 animate-pulse">●</span>
            )}
        </div>
    );
};

export default AttachmentSettingsCompact;
