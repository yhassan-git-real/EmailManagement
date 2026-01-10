import React, { useState, useEffect } from 'react';
import { PaperClipIcon, CheckIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Available file type options
const FILE_TYPE_OPTIONS = [
    { id: 'all', label: 'All Files', description: 'Attach all files in folder' },
    { id: 'excel', label: 'Excel', description: '.xlsx, .xls' },
    { id: 'csv', label: 'CSV', description: '.csv' },
    { id: 'txt', label: 'Text', description: '.txt' },
    { id: 'pdf', label: 'PDF', description: '.pdf' },
];

/**
 * AttachmentSettings - Controls smart attachment behavior
 * Allows users to configure file count threshold and file type filters
 */
const AttachmentSettings = () => {
    const [fileCountThreshold, setFileCountThreshold] = useState(5);
    const [selectedExtensions, setSelectedExtensions] = useState(['all']);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    // Original values for comparison
    const [originalThreshold, setOriginalThreshold] = useState(5);
    const [originalExtensions, setOriginalExtensions] = useState(['all']);

    // Load current settings on mount
    useEffect(() => {
        loadSettings();
    }, []);

    // Check for changes
    useEffect(() => {
        const thresholdChanged = fileCountThreshold !== originalThreshold;
        const extensionsChanged = JSON.stringify(selectedExtensions.sort()) !== JSON.stringify(originalExtensions.sort());
        setHasChanges(thresholdChanged || extensionsChanged);
    }, [fileCountThreshold, selectedExtensions, originalThreshold, originalExtensions]);

    const loadSettings = async () => {
        setIsLoading(true);
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
            toast.error('Failed to load attachment settings');
        } finally {
            setIsLoading(false);
        }
    };

    const saveSettings = async () => {
        setIsSaving(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/automation/attachment-settings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fileCountThreshold: fileCountThreshold,
                    allowedExtensions: selectedExtensions,
                }),
            });

            const data = await response.json();

            if (data.success) {
                toast.success('Attachment settings saved successfully');
                setOriginalThreshold(fileCountThreshold);
                setOriginalExtensions([...selectedExtensions]);
                setHasChanges(false);
            } else {
                toast.error('Failed to save attachment settings');
            }
        } catch (error) {
            console.error('Failed to save attachment settings:', error);
            toast.error('Failed to save attachment settings');
        } finally {
            setIsSaving(false);
        }
    };

    const resetToDefaults = () => {
        setFileCountThreshold(5);
        setSelectedExtensions(['all']);
    };

    const toggleExtension = (extensionId) => {
        if (extensionId === 'all') {
            // If clicking "All", select only "All"
            setSelectedExtensions(['all']);
        } else {
            // If clicking a specific type
            let newExtensions = [...selectedExtensions];

            // Remove 'all' if it was selected
            newExtensions = newExtensions.filter(ext => ext !== 'all');

            // Toggle the clicked extension
            if (newExtensions.includes(extensionId)) {
                newExtensions = newExtensions.filter(ext => ext !== extensionId);
            } else {
                newExtensions.push(extensionId);
            }

            // If nothing is selected, default to 'all'
            if (newExtensions.length === 0) {
                newExtensions = ['all'];
            }

            setSelectedExtensions(newExtensions);
        }
    };

    const getSelectedLabel = () => {
        if (selectedExtensions.includes('all')) {
            return 'All Files';
        }
        if (selectedExtensions.length === 1) {
            const option = FILE_TYPE_OPTIONS.find(opt => opt.id === selectedExtensions[0]);
            return option ? option.label : selectedExtensions[0];
        }
        return `${selectedExtensions.length} types selected`;
    };

    return (
        <div className="mt-10 mb-10">
            <div className="flex items-center mb-4">
                <PaperClipIcon className="h-5 w-5 text-gray-600 mr-2" />
                <h3 className="text-base font-semibold text-gray-800">Smart Attachment Settings</h3>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-5 sm:p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transform hover:-translate-y-1 transition-all duration-300 animate-fadeIn" style={{ animationDelay: '150ms' }}>
                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <svg className="animate-spin h-8 w-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                ) : (
                    <>
                        <p className="text-sm leading-relaxed text-gray-600 font-medium mb-6">
                            Configure how files are attached to emails. Files can be attached directly or compressed into a ZIP based on count and type.
                        </p>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* File Types Selection */}
                            <div>
                                <label className="block text-base font-medium text-gray-700 mb-2">
                                    File Types to Include
                                </label>
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setDropdownOpen(!dropdownOpen)}
                                        className="relative w-full bg-white border border-gray-300 rounded-lg shadow-sm pl-4 pr-10 py-3 text-left cursor-pointer hover:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                                    >
                                        <span className="block truncate text-gray-700">{getSelectedLabel()}</span>
                                        <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                            <svg className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </span>
                                    </button>

                                    {dropdownOpen && (
                                        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-lg py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none">
                                            {FILE_TYPE_OPTIONS.map((option) => (
                                                <div
                                                    key={option.id}
                                                    onClick={() => toggleExtension(option.id)}
                                                    className="cursor-pointer select-none relative py-3 pl-4 pr-9 hover:bg-primary-50 transition-colors duration-150"
                                                >
                                                    <div className="flex items-center">
                                                        <div className={`flex-shrink-0 h-5 w-5 rounded border-2 mr-3 flex items-center justify-center transition-all duration-150 ${selectedExtensions.includes(option.id)
                                                                ? 'bg-primary-600 border-primary-600'
                                                                : 'border-gray-300 bg-white'
                                                            }`}>
                                                            {selectedExtensions.includes(option.id) && (
                                                                <CheckIcon className="h-3 w-3 text-white" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <span className="font-medium text-gray-800">{option.label}</span>
                                                            <span className="ml-2 text-sm text-gray-500">{option.description}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <p className="mt-2 text-xs text-gray-500">
                                    Only files of selected types will be considered for attachment
                                </p>
                            </div>

                            {/* File Count Threshold */}
                            <div>
                                <label htmlFor="fileCountThreshold" className="block text-base font-medium text-gray-700 mb-2">
                                    Compression Threshold
                                </label>
                                <div className="flex items-center">
                                    <div className="flex items-center rounded-lg shadow-sm border border-gray-300 bg-white hover:border-primary-400 hover:shadow transition-all duration-200">
                                        {/* Minus button */}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (fileCountThreshold > 1) {
                                                    setFileCountThreshold(fileCountThreshold - 1);
                                                }
                                            }}
                                            className="px-4 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-700 active:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-l-lg transition-all duration-150"
                                            aria-label="Decrease threshold"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                                            </svg>
                                        </button>

                                        {/* Input field */}
                                        <input
                                            type="text"
                                            id="fileCountThreshold"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            value={fileCountThreshold}
                                            onChange={(e) => {
                                                const value = e.target.value.replace(/[^0-9]/g, '');
                                                const parsedValue = parseInt(value) || 1;
                                                setFileCountThreshold(Math.max(1, parsedValue));
                                            }}
                                            className="w-16 text-center border-0 focus:ring-0 focus:text-primary-700 text-lg font-semibold py-3 transition-colors duration-200"
                                        />

                                        {/* Plus button */}
                                        <button
                                            type="button"
                                            onClick={() => setFileCountThreshold(fileCountThreshold + 1)}
                                            className="px-4 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-700 active:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-r-lg transition-all duration-150"
                                            aria-label="Increase threshold"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </div>
                                    <span className="ml-3 text-gray-600 text-base">files</span>
                                </div>
                                <p className="mt-2 text-xs text-gray-500">
                                    Files ≤ {fileCountThreshold}: Attach directly | Files &gt; {fileCountThreshold}: Compress to ZIP
                                </p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-6 pt-4 border-t border-gray-200 flex flex-col sm:flex-row gap-3 sm:justify-end">
                            <button
                                type="button"
                                onClick={resetToDefaults}
                                className="px-4 py-2 rounded-lg text-gray-700 font-medium border border-gray-300 bg-white hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200"
                            >
                                Reset to Default
                            </button>
                            <button
                                type="button"
                                onClick={saveSettings}
                                disabled={isSaving || !hasChanges}
                                className={`px-6 py-2 rounded-lg text-white font-medium flex items-center justify-center min-w-[140px] shadow-sm hover:shadow transform hover:-translate-y-0.5 transition-all duration-200 ${hasChanges
                                        ? 'bg-primary-600 hover:bg-primary-700 active:bg-primary-800'
                                        : 'bg-gray-400 cursor-not-allowed hover:translate-y-0'
                                    } disabled:opacity-75`}
                            >
                                {isSaving ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <PaperClipIcon className="-ml-1 mr-2 h-5 w-5" />
                                        Save Settings
                                    </>
                                )}
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* Click outside to close dropdown */}
            {dropdownOpen && (
                <div
                    className="fixed inset-0 z-0"
                    onClick={() => setDropdownOpen(false)}
                />
            )}
        </div>
    );
};

export default AttachmentSettings;
