import React, { useState, useEffect, useRef } from 'react';
import {
    PaperClipIcon,
    CheckIcon,
    DocumentTextIcon,
    ClockIcon,
    TrashIcon,
    ChevronDownIcon,
    CloudArrowUpIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import { getScheduleSettings, updateScheduleSettings } from '../../../utils/automationApi';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// File type options for attachment settings
const FILE_TYPE_OPTIONS = [
    { id: 'all', label: 'All Files', short: 'All' },
    { id: 'excel', label: 'Excel (.xlsx, .xls)', short: 'Excel' },
    { id: 'csv', label: 'CSV (.csv)', short: 'CSV' },
    { id: 'txt', label: 'Text (.txt)', short: 'TXT' },
    { id: 'pdf', label: 'PDF (.pdf)', short: 'PDF' },
];

/**
 * ConsolidatedSettingsPanel - Compact inline settings panel for all automation options
 * Includes: Template, Scheduler, Archive Cleanup, and Attachment Settings
 */
const ConsolidatedSettingsPanel = ({
    automationSettings,
    onOpenTemplateSelector,
    cleanupDays,
    setCleanupDays,
    onCleanupArchive,
    isCleanupLoading
}) => {
    // Attachment Settings State
    const [fileCountThreshold, setFileCountThreshold] = useState(5);
    const [selectedExtensions, setSelectedExtensions] = useState(['all']);
    const [attachmentDropdownOpen, setAttachmentDropdownOpen] = useState(false);
    const [attachmentHasChanges, setAttachmentHasChanges] = useState(false);
    const [originalThreshold, setOriginalThreshold] = useState(5);
    const [originalExtensions, setOriginalExtensions] = useState(['all']);

    // Scheduler Settings State
    const [scheduleSettings, setScheduleSettings] = useState({
        enabled: false,
        frequency: 'daily',
        time: '09:00',
        days: [],
    });
    const [scheduleLoading, setScheduleLoading] = useState(false);

    // Size Settings State
    const [sizeSettings, setSizeSettings] = useState({
        emailMaxSizeMB: 25,
        emailSafeSizeMB: 20,
        gdriveUploadThresholdMB: 20
    });
    const [originalSizeSettings, setOriginalSizeSettings] = useState({
        emailMaxSizeMB: 25,
        emailSafeSizeMB: 20,
        gdriveUploadThresholdMB: 20
    });
    const [sizeHasChanges, setSizeHasChanges] = useState(false);

    const attachmentDropdownRef = useRef(null);

    // Load settings on mount
    useEffect(() => {
        loadAttachmentSettings();
        loadScheduleSettings();
        loadSizeSettings();
    }, []);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (attachmentDropdownRef.current && !attachmentDropdownRef.current.contains(event.target)) {
                setAttachmentDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Check for attachment changes and auto-save
    useEffect(() => {
        const thresholdChanged = fileCountThreshold !== originalThreshold;
        const extensionsChanged = JSON.stringify(selectedExtensions.sort()) !== JSON.stringify(originalExtensions.sort());
        setAttachmentHasChanges(thresholdChanged || extensionsChanged);

        if (thresholdChanged || extensionsChanged) {
            const timer = setTimeout(() => saveAttachmentSettings(), 1000);
            return () => clearTimeout(timer);
        }
    }, [fileCountThreshold, selectedExtensions, originalThreshold, originalExtensions]);

    // Load attachment settings
    const loadAttachmentSettings = async () => {
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
        }
    };

    // Save attachment settings
    const saveAttachmentSettings = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/automation/attachment-settings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fileCountThreshold, allowedExtensions: selectedExtensions }),
            });
            const data = await response.json();
            if (data.success) {
                setOriginalThreshold(fileCountThreshold);
                setOriginalExtensions([...selectedExtensions]);
                setAttachmentHasChanges(false);
            }
        } catch (error) {
            console.error('Failed to save attachment settings:', error);
        }
    };

    // Load schedule settings
    const loadScheduleSettings = async () => {
        try {
            const response = await getScheduleSettings();
            if (response.success) {
                setScheduleSettings(response.data);
            }
        } catch (error) {
            console.error('Error fetching schedule settings:', error);
        }
    };

    // Load size settings
    const loadSizeSettings = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/automation/size-settings`);
            const data = await response.json();
            if (data.success) {
                setSizeSettings(data.data);
                setOriginalSizeSettings(data.data);
            }
        } catch (error) {
            console.error('Error fetching size settings:', error);
        }
    };

    // Save size settings (debounced)
    useEffect(() => {
        const hasChanges = JSON.stringify(sizeSettings) !== JSON.stringify(originalSizeSettings);
        setSizeHasChanges(hasChanges);

        if (hasChanges) {
            const timer = setTimeout(() => saveSizeSettings(), 1000);
            return () => clearTimeout(timer);
        }
    }, [sizeSettings, originalSizeSettings]);

    const saveSizeSettings = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/automation/size-settings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(sizeSettings),
            });
            const data = await response.json();
            if (data.success) {
                setOriginalSizeSettings({ ...sizeSettings });
                setSizeHasChanges(false);
            }
        } catch (error) {
            console.error('Failed to save size settings:', error);
        }
    };

    const updateSizeField = (field, value) => {
        const numValue = Math.max(1, Math.min(100, parseInt(value) || 1));
        setSizeSettings(prev => ({ ...prev, [field]: numValue }));
    };

    // Handle schedule toggle
    const handleScheduleToggle = async (enabled) => {
        try {
            setScheduleLoading(true);
            const response = await updateScheduleSettings({ ...scheduleSettings, enabled });
            if (response.success) {
                setScheduleSettings(response.data);
            }
        } catch (error) {
            console.error('Error updating scheduler:', error);
        } finally {
            setScheduleLoading(false);
        }
    };

    // Handle schedule changes
    const handleScheduleChange = async (field, value) => {
        try {
            setScheduleLoading(true);
            const updatedSettings = { ...scheduleSettings, [field]: value };
            const response = await updateScheduleSettings(updatedSettings);
            if (response.success) {
                setScheduleSettings(response.data);
            }
        } catch (error) {
            console.error('Error updating schedule:', error);
        } finally {
            setScheduleLoading(false);
        }
    };

    // Toggle extension in attachment settings
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
            if (newExtensions.length === 0) newExtensions = ['all'];
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

    const getTemplateName = () => {
        switch (automationSettings.templateId) {
            case 'default': return 'Default';
            case 'followup': return 'Follow-up';
            case 'escalation': return 'Escalation';
            case 'reminder': return 'Reminder';
            default: return 'Custom';
        }
    };

    return (
        <div className="border-t border-gray-100 pt-4 mt-1">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-3">

                {/* Template Setting */}
                <div className="inline-flex items-center">
                    <div className="inline-flex items-center px-2 py-1.5 text-xs font-medium text-gray-600 bg-blue-50 border border-blue-200 rounded-l-md">
                        <DocumentTextIcon className="h-4 w-4 mr-1 text-blue-600" />
                        <span className="hidden sm:inline">Template:</span>
                    </div>
                    <button
                        onClick={onOpenTemplateSelector}
                        className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-700 bg-white border border-blue-200 rounded-r-md hover:bg-blue-50 focus:outline-none focus:ring-1 focus:ring-blue-400 transition-all"
                    >
                        {getTemplateName()}
                        <ChevronDownIcon className="ml-1 h-3 w-3" />
                    </button>
                </div>

                {/* Separator */}
                <div className="hidden sm:block w-px h-6 bg-gray-200"></div>

                {/* Scheduler Setting */}
                <div className="inline-flex items-center gap-2">
                    <div className="inline-flex items-center px-2 py-1.5 text-xs font-medium text-gray-600 bg-purple-50 border border-purple-200 rounded-l-md">
                        <ClockIcon className="h-4 w-4 mr-1 text-purple-600" />
                        <span className="hidden sm:inline">Schedule:</span>
                    </div>
                    <div className="inline-flex items-center border border-purple-200 rounded-r-md bg-white">
                        <label className="inline-flex items-center px-2 py-1.5 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={scheduleSettings.enabled}
                                onChange={(e) => handleScheduleToggle(e.target.checked)}
                                disabled={scheduleLoading}
                                className="h-3.5 w-3.5 text-purple-600 focus:ring-purple-400 border-gray-300 rounded"
                            />
                            <span className="ml-1.5 text-xs text-gray-700">{scheduleSettings.enabled ? 'On' : 'Off'}</span>
                        </label>
                        {scheduleSettings.enabled && (
                            <>
                                <select
                                    value={scheduleSettings.frequency}
                                    onChange={(e) => handleScheduleChange('frequency', e.target.value)}
                                    disabled={scheduleLoading}
                                    className="text-xs border-0 border-l border-purple-200 py-1.5 pl-2 pr-6 text-gray-700 bg-transparent focus:ring-0 focus:outline-none"
                                >
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="monthly">Monthly</option>
                                </select>
                                <input
                                    type="time"
                                    value={scheduleSettings.time}
                                    onChange={(e) => handleScheduleChange('time', e.target.value)}
                                    disabled={scheduleLoading}
                                    className="text-xs border-0 border-l border-purple-200 py-1.5 px-2 text-gray-700 bg-transparent focus:ring-0 focus:outline-none w-20"
                                />
                            </>
                        )}
                    </div>
                </div>

                {/* Separator */}
                <div className="hidden sm:block w-px h-6 bg-gray-200"></div>

                {/* Archive Cleanup Setting */}
                <div className="inline-flex items-center">
                    <div className="inline-flex items-center px-2 py-1.5 text-xs font-medium text-gray-600 bg-orange-50 border border-orange-200 rounded-l-md">
                        <TrashIcon className="h-4 w-4 mr-1 text-orange-600" />
                        <span className="hidden sm:inline">Cleanup:</span>
                    </div>
                    <div className="inline-flex items-center border-y border-orange-200 bg-white">
                        <button
                            onClick={() => cleanupDays > 1 && setCleanupDays(cleanupDays - 1)}
                            className="px-1.5 py-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                            </svg>
                        </button>
                        <span className="px-1.5 text-xs font-medium text-gray-700 min-w-[24px] text-center">{cleanupDays}</span>
                        <button
                            onClick={() => setCleanupDays(cleanupDays + 1)}
                            className="px-1.5 py-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                    <span className="px-2 py-1.5 text-xs text-gray-500 border border-orange-200 bg-orange-50">days</span>
                    <button
                        onClick={onCleanupArchive}
                        disabled={isCleanupLoading}
                        className="px-2.5 py-1.5 text-xs font-medium text-orange-700 bg-white border border-orange-200 rounded-r-md hover:bg-orange-50 focus:outline-none transition-all disabled:opacity-50"
                    >
                        {isCleanupLoading ? '...' : 'Clean'}
                    </button>
                </div>

                {/* Separator */}
                <div className="hidden sm:block w-px h-6 bg-gray-200"></div>

                {/* Attachment Setting */}
                <div className="inline-flex items-center" ref={attachmentDropdownRef}>
                    <div className="inline-flex items-center px-2 py-1.5 text-xs font-medium text-gray-600 bg-green-50 border border-green-200 rounded-l-md">
                        <PaperClipIcon className="h-4 w-4 mr-1 text-green-600" />
                        <span className="hidden sm:inline">Attach:</span>
                    </div>

                    {/* File Types Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setAttachmentDropdownOpen(!attachmentDropdownOpen)}
                            className="inline-flex items-center px-2 py-1.5 border-y border-green-200 text-xs font-medium bg-white hover:bg-gray-50"
                        >
                            <span className="text-gray-700">{getSelectedLabel()}</span>
                            <ChevronDownIcon className={`ml-1 h-3 w-3 text-gray-400 transition-transform ${attachmentDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {attachmentDropdownOpen && (
                            <div className="absolute z-20 mt-1 w-48 bg-white shadow-lg rounded-md py-1 text-sm ring-1 ring-black ring-opacity-5">
                                {FILE_TYPE_OPTIONS.map((option) => (
                                    <div
                                        key={option.id}
                                        onClick={() => toggleExtension(option.id)}
                                        className="cursor-pointer select-none relative py-2 pl-3 pr-8 hover:bg-green-50 transition-colors"
                                    >
                                        <span className={`block truncate ${selectedExtensions.includes(option.id) ? 'font-medium text-green-700' : 'text-gray-700'}`}>
                                            {option.label}
                                        </span>
                                        {selectedExtensions.includes(option.id) && (
                                            <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-green-600">
                                                <CheckIcon className="h-4 w-4" />
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Threshold Controls */}
                    <div className="inline-flex items-center border-y border-green-200 bg-white">
                        <button
                            onClick={() => fileCountThreshold > 1 && setFileCountThreshold(fileCountThreshold - 1)}
                            className="px-1.5 py-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                            </svg>
                        </button>
                        <span className="px-1 text-xs font-medium text-gray-700 min-w-[18px] text-center">{fileCountThreshold}</span>
                        <button
                            onClick={() => setFileCountThreshold(fileCountThreshold + 1)}
                            className="px-1.5 py-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                    <span className="px-2 py-1.5 text-xs text-gray-500 border border-green-200 bg-green-50 rounded-r-md">files</span>

                    {attachmentHasChanges && <span className="ml-1 text-xs text-amber-600 animate-pulse">●</span>}
                </div>

                {/* Separator */}
                <div className="hidden sm:block w-px h-6 bg-gray-200"></div>

                {/* Size Settings */}
                <div className="inline-flex items-center">
                    <div className="inline-flex items-center px-2 py-1.5 text-xs font-medium text-gray-600 bg-indigo-50 border border-indigo-200 rounded-l-md">
                        <CloudArrowUpIcon className="h-4 w-4 mr-1 text-indigo-600" />
                        <span className="hidden sm:inline">Sizes:</span>
                    </div>

                    {/* Max Size */}
                    <div className="inline-flex items-center border-y border-indigo-200 bg-white" title="Max email attachment size">
                        <span className="px-1.5 text-xs text-gray-500">Max</span>
                        <button
                            onClick={() => updateSizeField('emailMaxSizeMB', sizeSettings.emailMaxSizeMB - 1)}
                            className="px-1 py-1.5 text-gray-500 hover:bg-gray-100"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                            </svg>
                        </button>
                        <span className="text-xs font-medium text-gray-700 min-w-[16px] text-center">{sizeSettings.emailMaxSizeMB}</span>
                        <button
                            onClick={() => updateSizeField('emailMaxSizeMB', sizeSettings.emailMaxSizeMB + 1)}
                            className="px-1 py-1.5 text-gray-500 hover:bg-gray-100"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>

                    {/* Safe Size */}
                    <div className="inline-flex items-center border-y border-l-0 border-indigo-200 bg-white" title="Safe size for direct attachment">
                        <span className="px-1.5 text-xs text-gray-500 border-l border-indigo-200">Safe</span>
                        <button
                            onClick={() => updateSizeField('emailSafeSizeMB', sizeSettings.emailSafeSizeMB - 1)}
                            className="px-1 py-1.5 text-gray-500 hover:bg-gray-100"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                            </svg>
                        </button>
                        <span className="text-xs font-medium text-gray-700 min-w-[16px] text-center">{sizeSettings.emailSafeSizeMB}</span>
                        <button
                            onClick={() => updateSizeField('emailSafeSizeMB', sizeSettings.emailSafeSizeMB + 1)}
                            className="px-1 py-1.5 text-gray-500 hover:bg-gray-100"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>

                    {/* GDrive Threshold */}
                    <div className="inline-flex items-center border-y border-l-0 border-indigo-200 bg-white" title="Size threshold for Google Drive upload">
                        <span className="px-1.5 text-xs text-gray-500 border-l border-indigo-200">GDrive</span>
                        <button
                            onClick={() => updateSizeField('gdriveUploadThresholdMB', sizeSettings.gdriveUploadThresholdMB - 1)}
                            className="px-1 py-1.5 text-gray-500 hover:bg-gray-100"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                            </svg>
                        </button>
                        <span className="text-xs font-medium text-gray-700 min-w-[16px] text-center">{sizeSettings.gdriveUploadThresholdMB}</span>
                        <button
                            onClick={() => updateSizeField('gdriveUploadThresholdMB', sizeSettings.gdriveUploadThresholdMB + 1)}
                            className="px-1 py-1.5 text-gray-500 hover:bg-gray-100"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>

                    <span className="px-2 py-1.5 text-xs text-gray-500 border border-indigo-200 bg-indigo-50 rounded-r-md">MB</span>

                    {sizeHasChanges && <span className="ml-1 text-xs text-amber-600 animate-pulse">●</span>}
                </div>
            </div>
        </div>
    );
};

export default ConsolidatedSettingsPanel;
