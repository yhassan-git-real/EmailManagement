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
        <div className="border-t border-dark-300/50 pt-4 mt-1">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-3">

                {/* Template Setting */}
                <div className="inline-flex items-center">
                    <div className="inline-flex items-center px-2 py-1.5 text-xs font-medium text-primary-400 bg-primary-500/15 border border-primary-500/30 rounded-l-lg">
                        <DocumentTextIcon className="h-4 w-4 mr-1 text-primary-400" />
                        <span className="hidden sm:inline">Template:</span>
                    </div>
                    <button
                        onClick={onOpenTemplateSelector}
                        className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-primary-300 bg-dark-500/50 border border-primary-500/30 rounded-r-lg hover:bg-primary-500/15 focus:outline-none focus:ring-1 focus:ring-primary-400 transition-all"
                    >
                        {getTemplateName()}
                        <ChevronDownIcon className="ml-1 h-3 w-3" />
                    </button>
                </div>

                {/* Separator */}
                <div className="hidden sm:block w-px h-6 bg-dark-300/50"></div>

                {/* Scheduler Setting */}
                <div className="inline-flex items-center gap-2">
                    <div className="inline-flex items-center px-2 py-1.5 text-xs font-medium text-accent-violet bg-accent-violet/15 border border-accent-violet/30 rounded-l-lg">
                        <ClockIcon className="h-4 w-4 mr-1 text-accent-violet" />
                        <span className="hidden sm:inline">Schedule:</span>
                    </div>
                    <div className="inline-flex items-center border border-accent-violet/30 rounded-r-lg bg-dark-500/50">
                        <label className="inline-flex items-center px-2 py-1.5 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={scheduleSettings.enabled}
                                onChange={(e) => handleScheduleToggle(e.target.checked)}
                                disabled={scheduleLoading}
                                className="h-3.5 w-3.5 text-accent-violet focus:ring-accent-violet border-dark-300 rounded bg-dark-600"
                            />
                            <span className="ml-1.5 text-xs text-text-secondary">{scheduleSettings.enabled ? 'On' : 'Off'}</span>
                        </label>
                        {scheduleSettings.enabled && (
                            <>
                                <select
                                    value={scheduleSettings.frequency}
                                    onChange={(e) => handleScheduleChange('frequency', e.target.value)}
                                    disabled={scheduleLoading}
                                    className="text-xs border-0 border-l border-accent-violet/30 py-1.5 pl-2 pr-6 text-text-secondary bg-transparent focus:ring-0 focus:outline-none"
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
                                    className="text-xs border-0 border-l border-accent-violet/30 py-1.5 px-2 text-text-secondary bg-transparent focus:ring-0 focus:outline-none w-20"
                                />
                            </>
                        )}
                    </div>
                </div>

                {/* Separator */}
                <div className="hidden sm:block w-px h-6 bg-dark-300/50"></div>

                {/* Archive Cleanup Setting */}
                <div className="inline-flex items-center">
                    <div className="inline-flex items-center px-2 py-1.5 text-xs font-medium text-warning bg-warning/15 border border-warning/30 rounded-l-lg">
                        <TrashIcon className="h-4 w-4 mr-1 text-warning" />
                        <span className="hidden sm:inline">Cleanup:</span>
                    </div>
                    <div className="inline-flex items-center border-y border-warning/30 bg-dark-500/50">
                        <button
                            onClick={() => cleanupDays > 1 && setCleanupDays(cleanupDays - 1)}
                            className="px-1.5 py-1.5 text-text-muted hover:bg-dark-400/50 hover:text-text-secondary"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                            </svg>
                        </button>
                        <span className="px-1.5 text-xs font-medium text-text-secondary min-w-[24px] text-center">{cleanupDays}</span>
                        <button
                            onClick={() => setCleanupDays(cleanupDays + 1)}
                            className="px-1.5 py-1.5 text-text-muted hover:bg-dark-400/50 hover:text-text-secondary"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                    <span className="px-2 py-1.5 text-xs text-warning border border-warning/30 bg-warning/15">days</span>
                    <button
                        onClick={onCleanupArchive}
                        disabled={isCleanupLoading}
                        className="px-2.5 py-1.5 text-xs font-medium text-warning bg-dark-500/50 border border-warning/30 rounded-r-lg hover:bg-warning/15 focus:outline-none transition-all disabled:opacity-50"
                    >
                        {isCleanupLoading ? '...' : 'Clean'}
                    </button>
                </div>

                {/* Separator */}
                <div className="hidden sm:block w-px h-6 bg-dark-300/50"></div>

                {/* Attachment Setting */}
                <div className="inline-flex items-center" ref={attachmentDropdownRef}>
                    <div className="inline-flex items-center px-2 py-1.5 text-xs font-medium text-success bg-success/15 border border-success/30 rounded-l-lg">
                        <PaperClipIcon className="h-4 w-4 mr-1 text-success" />
                        <span className="hidden sm:inline">Attach:</span>
                    </div>

                    {/* File Types Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setAttachmentDropdownOpen(!attachmentDropdownOpen)}
                            className="inline-flex items-center px-2 py-1.5 border-y border-success/30 text-xs font-medium bg-dark-500/50 hover:bg-dark-400/50"
                        >
                            <span className="text-text-secondary">{getSelectedLabel()}</span>
                            <ChevronDownIcon className={`ml-1 h-3 w-3 text-text-muted transition-transform ${attachmentDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {attachmentDropdownOpen && (
                            <div className="absolute z-50 mt-1 w-48 bg-dark-600 shadow-lg rounded-lg py-1 text-sm ring-1 ring-dark-300/50 border border-dark-300/50">
                                {FILE_TYPE_OPTIONS.map((option) => (
                                    <div
                                        key={option.id}
                                        onClick={() => toggleExtension(option.id)}
                                        className="cursor-pointer select-none relative py-2 pl-3 pr-8 hover:bg-success/15 transition-colors"
                                    >
                                        <span className={`block truncate ${selectedExtensions.includes(option.id) ? 'font-medium text-success' : 'text-text-secondary'}`}>
                                            {option.label}
                                        </span>
                                        {selectedExtensions.includes(option.id) && (
                                            <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-success">
                                                <CheckIcon className="h-4 w-4" />
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Threshold Controls */}
                    <div className="inline-flex items-center border-y border-success/30 bg-dark-500/50">
                        <button
                            onClick={() => fileCountThreshold > 1 && setFileCountThreshold(fileCountThreshold - 1)}
                            className="px-1.5 py-1.5 text-text-muted hover:bg-dark-400/50 hover:text-text-secondary"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                            </svg>
                        </button>
                        <span className="px-1 text-xs font-medium text-text-secondary min-w-[18px] text-center">{fileCountThreshold}</span>
                        <button
                            onClick={() => setFileCountThreshold(fileCountThreshold + 1)}
                            className="px-1.5 py-1.5 text-text-muted hover:bg-dark-400/50 hover:text-text-secondary"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                    <span className="px-2 py-1.5 text-xs text-success border border-success/30 bg-success/15 rounded-r-lg">files</span>

                    {attachmentHasChanges && <span className="ml-1 text-xs text-warning animate-pulse">●</span>}
                </div>

                {/* Separator */}
                <div className="hidden sm:block w-px h-6 bg-dark-300/50"></div>

                {/* Size Settings */}
                <div className="inline-flex items-center">
                    <div className="inline-flex items-center px-2 py-1.5 text-xs font-medium text-secondary-400 bg-secondary-500/15 border border-secondary-500/30 rounded-l-lg">
                        <CloudArrowUpIcon className="h-4 w-4 mr-1 text-secondary-400" />
                        <span className="hidden sm:inline">Sizes:</span>
                    </div>

                    {/* Max Size */}
                    <div className="inline-flex items-center border-y border-secondary-500/30 bg-dark-500/50" title="Max email attachment size">
                        <span className="px-1.5 text-xs text-text-muted">Max</span>
                        <button
                            onClick={() => updateSizeField('emailMaxSizeMB', sizeSettings.emailMaxSizeMB - 1)}
                            className="px-1 py-1.5 text-text-muted hover:bg-dark-400/50"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                            </svg>
                        </button>
                        <span className="text-xs font-medium text-text-secondary min-w-[16px] text-center">{sizeSettings.emailMaxSizeMB}</span>
                        <button
                            onClick={() => updateSizeField('emailMaxSizeMB', sizeSettings.emailMaxSizeMB + 1)}
                            className="px-1 py-1.5 text-text-muted hover:bg-dark-400/50"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>

                    {/* Safe Size */}
                    <div className="inline-flex items-center border-y border-l-0 border-secondary-500/30 bg-dark-500/50" title="Safe size for direct attachment">
                        <span className="px-1.5 text-xs text-text-muted border-l border-secondary-500/30">Safe</span>
                        <button
                            onClick={() => updateSizeField('emailSafeSizeMB', sizeSettings.emailSafeSizeMB - 1)}
                            className="px-1 py-1.5 text-text-muted hover:bg-dark-400/50"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                            </svg>
                        </button>
                        <span className="text-xs font-medium text-text-secondary min-w-[16px] text-center">{sizeSettings.emailSafeSizeMB}</span>
                        <button
                            onClick={() => updateSizeField('emailSafeSizeMB', sizeSettings.emailSafeSizeMB + 1)}
                            className="px-1 py-1.5 text-text-muted hover:bg-dark-400/50"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>

                    {/* GDrive Threshold */}
                    <div className="inline-flex items-center border-y border-l-0 border-secondary-500/30 bg-dark-500/50" title="Size threshold for Google Drive upload">
                        <span className="px-1.5 text-xs text-text-muted border-l border-secondary-500/30">GDrive</span>
                        <button
                            onClick={() => updateSizeField('gdriveUploadThresholdMB', sizeSettings.gdriveUploadThresholdMB - 1)}
                            className="px-1 py-1.5 text-text-muted hover:bg-dark-400/50"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                            </svg>
                        </button>
                        <span className="text-xs font-medium text-text-secondary min-w-[16px] text-center">{sizeSettings.gdriveUploadThresholdMB}</span>
                        <button
                            onClick={() => updateSizeField('gdriveUploadThresholdMB', sizeSettings.gdriveUploadThresholdMB + 1)}
                            className="px-1 py-1.5 text-text-muted hover:bg-dark-400/50"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>

                    <span className="px-2 py-1.5 text-xs text-secondary-400 border border-secondary-500/30 bg-secondary-500/15 rounded-r-lg">MB</span>

                    {sizeHasChanges && <span className="ml-1 text-xs text-warning animate-pulse">●</span>}
                </div>
            </div>
        </div>
    );
};

export default ConsolidatedSettingsPanel;
