import React, { useState, useEffect, useRef } from 'react';
import {
    PaperClipIcon,
    CheckIcon,
    ClockIcon,
    TrashIcon,
    ChevronDownIcon,
    CloudArrowUpIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import { getScheduleSettings, updateScheduleSettings } from '../../../utils/automationApi';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const FILE_TYPE_OPTIONS = [
    { id: 'all', label: 'All Files', short: 'All' },
    { id: 'excel', label: 'Excel (.xlsx, .xls)', short: 'Excel' },
    { id: 'csv', label: 'CSV (.csv)', short: 'CSV' },
    { id: 'txt', label: 'Text (.txt)', short: 'TXT' },
    { id: 'pdf', label: 'PDF (.pdf)', short: 'PDF' },
];

/**
 * ConsolidatedSettingsPanel - Ultra-compact inline settings panel
 * Supports compact mode for minimal vertical space
 */
const ConsolidatedSettingsPanel = ({
    automationSettings,
    onOpenTemplateSelector,
    cleanupDays,
    setCleanupDays,
    onCleanupArchive,
    isCleanupLoading,
    hideTemplateSelector = false,
    hideAttachment = false,
    compact = false
}) => {
    const [fileCountThreshold, setFileCountThreshold] = useState(5);
    const [selectedExtensions, setSelectedExtensions] = useState(['all']);
    const [attachmentDropdownOpen, setAttachmentDropdownOpen] = useState(false);
    const [attachmentHasChanges, setAttachmentHasChanges] = useState(false);
    const [originalThreshold, setOriginalThreshold] = useState(5);
    const [originalExtensions, setOriginalExtensions] = useState(['all']);

    const [scheduleSettings, setScheduleSettings] = useState({ enabled: false, frequency: 'daily', time: '09:00', days: [] });
    const [scheduleLoading, setScheduleLoading] = useState(false);

    const [sizeSettings, setSizeSettings] = useState({ emailMaxSizeMB: 25, emailSafeSizeMB: 20, gdriveUploadThresholdMB: 20 });
    const [originalSizeSettings, setOriginalSizeSettings] = useState({ emailMaxSizeMB: 25, emailSafeSizeMB: 20, gdriveUploadThresholdMB: 20 });
    const [sizeHasChanges, setSizeHasChanges] = useState(false);

    const attachmentDropdownRef = useRef(null);

    useEffect(() => { loadAttachmentSettings(); loadScheduleSettings(); loadSizeSettings(); }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (attachmentDropdownRef.current && !attachmentDropdownRef.current.contains(event.target)) {
                setAttachmentDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const thresholdChanged = fileCountThreshold !== originalThreshold;
        const extensionsChanged = JSON.stringify(selectedExtensions.sort()) !== JSON.stringify(originalExtensions.sort());
        setAttachmentHasChanges(thresholdChanged || extensionsChanged);
        if (thresholdChanged || extensionsChanged) {
            const timer = setTimeout(() => saveAttachmentSettings(), 1000);
            return () => clearTimeout(timer);
        }
    }, [fileCountThreshold, selectedExtensions, originalThreshold, originalExtensions]);

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
        } catch (error) { console.error('Failed to load attachment settings:', error); }
    };

    const saveAttachmentSettings = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/automation/attachment-settings`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fileCountThreshold, allowedExtensions: selectedExtensions }),
            });
            const data = await response.json();
            if (data.success) { setOriginalThreshold(fileCountThreshold); setOriginalExtensions([...selectedExtensions]); setAttachmentHasChanges(false); }
        } catch (error) { console.error('Failed to save attachment settings:', error); }
    };

    const loadScheduleSettings = async () => {
        try { const response = await getScheduleSettings(); if (response.success) { setScheduleSettings(response.data); } }
        catch (error) { console.error('Error fetching schedule settings:', error); }
    };

    const loadSizeSettings = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/automation/size-settings`);
            const data = await response.json();
            if (data.success) { setSizeSettings(data.data); setOriginalSizeSettings(data.data); }
        } catch (error) { console.error('Error fetching size settings:', error); }
    };

    useEffect(() => {
        const hasChanges = JSON.stringify(sizeSettings) !== JSON.stringify(originalSizeSettings);
        setSizeHasChanges(hasChanges);
        if (hasChanges) { const timer = setTimeout(() => saveSizeSettings(), 1000); return () => clearTimeout(timer); }
    }, [sizeSettings, originalSizeSettings]);

    const saveSizeSettings = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/automation/size-settings`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(sizeSettings),
            });
            const data = await response.json();
            if (data.success) { setOriginalSizeSettings({ ...sizeSettings }); setSizeHasChanges(false); }
        } catch (error) { console.error('Failed to save size settings:', error); }
    };

    const updateSizeField = (field, value) => {
        const numValue = Math.max(1, Math.min(100, parseInt(value) || 1));
        setSizeSettings(prev => ({ ...prev, [field]: numValue }));
    };

    const handleScheduleToggle = async (enabled) => {
        try {
            setScheduleLoading(true);
            const response = await updateScheduleSettings({ ...scheduleSettings, enabled });
            if (response.success) { setScheduleSettings(response.data); }
        } catch (error) { console.error('Error updating scheduler:', error); }
        finally { setScheduleLoading(false); }
    };

    const handleScheduleChange = async (field, value) => {
        try {
            setScheduleLoading(true);
            const response = await updateScheduleSettings({ ...scheduleSettings, [field]: value });
            if (response.success) { setScheduleSettings(response.data); }
        } catch (error) { console.error('Error updating schedule:', error); }
        finally { setScheduleLoading(false); }
    };

    const toggleExtension = (extensionId) => {
        if (extensionId === 'all') { setSelectedExtensions(['all']); }
        else {
            let newExtensions = selectedExtensions.filter(ext => ext !== 'all');
            if (newExtensions.includes(extensionId)) { newExtensions = newExtensions.filter(ext => ext !== extensionId); }
            else { newExtensions.push(extensionId); }
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

    // Compact stepper
    const CompactStepper = ({ value, onChange, min = 1, max = 999, color = 'slate' }) => {
        const colors = {
            amber: { bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.3)', text: '#fbbf24' },
            emerald: { bg: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.3)', text: '#34d399' },
            cyan: { bg: 'rgba(6, 182, 212, 0.1)', border: 'rgba(6, 182, 212, 0.3)', text: '#22d3ee' },
        };
        const style = colors[color] || colors.amber;
        const sz = compact ? 'h-2.5 w-2.5' : 'h-3 w-3';
        const py = compact ? 'py-0.5' : 'py-1';
        const px = compact ? 'px-1' : 'px-1.5';
        const textSz = compact ? 'text-[9px]' : 'text-xs';

        return (
            <div className="inline-flex items-center rounded" style={{ background: style.bg, border: `1px solid ${style.border}` }}>
                <button onClick={() => value > min && onChange(value - 1)} className={`${px} ${py} hover:bg-white/5`} style={{ color: style.text }}>
                    <svg className={sz} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
                </button>
                <span className={`px-1.5 ${textSz} font-medium min-w-[20px] text-center`} style={{ color: style.text }}>{value}</span>
                <button onClick={() => value < max && onChange(value + 1)} className={`${px} ${py} hover:bg-white/5`} style={{ color: style.text }}>
                    <svg className={sz} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                </button>
            </div>
        );
    };

    // Style helpers
    const containerClass = compact ? 'rounded' : 'rounded-lg';
    const labelPad = compact ? 'px-1.5 py-1' : 'px-2 py-1.5';
    const labelText = compact ? 'text-[9px]' : 'text-[10px]';
    const iconSz = compact ? 'h-2.5 w-2.5' : 'h-3 w-3';
    const bodyPad = compact ? 'px-1.5 py-1' : 'px-2 py-1.5';

    return (
        <div className={`flex flex-wrap items-center ${compact ? 'gap-1.5' : 'gap-2'}`}>
            {/* Schedule */}
            <div className={`inline-flex items-center ${containerClass} overflow-hidden`} style={{ border: '1px solid rgba(139, 92, 246, 0.25)' }}>
                <div className={`flex items-center ${labelPad} ${labelText} font-medium`} style={{ background: 'rgba(139, 92, 246, 0.12)', color: '#c4b5fd' }}>
                    <ClockIcon className={`${iconSz} mr-1`} />Schedule:
                </div>
                <button onClick={() => handleScheduleToggle(!scheduleSettings.enabled)} disabled={scheduleLoading}
                    className={`flex items-center ${bodyPad} ${labelText} font-medium transition-colors`}
                    style={{ background: scheduleSettings.enabled ? 'rgba(139, 92, 246, 0.15)' : 'rgba(30, 41, 59, 0.5)', color: scheduleSettings.enabled ? '#a78bfa' : '#94a3b8' }}>
                    <span className={`inline-block ${compact ? 'w-5 h-2.5' : 'w-6 h-3'} rounded-full relative ${scheduleSettings.enabled ? 'bg-violet-500' : 'bg-slate-600'}`}>
                        <span className={`absolute top-0.5 ${compact ? 'w-1.5 h-1.5' : 'w-2 h-2'} rounded-full bg-white transition-transform ${scheduleSettings.enabled ? (compact ? 'left-[11px]' : 'left-3') : 'left-0.5'}`}></span>
                    </span>
                    <span className="ml-1">{scheduleSettings.enabled ? 'On' : 'Off'}</span>
                </button>
                {scheduleSettings.enabled && (<>
                    <select value={scheduleSettings.frequency} onChange={(e) => handleScheduleChange('frequency', e.target.value)} disabled={scheduleLoading}
                        className={`${labelText} ${bodyPad} pr-4 focus:ring-0 focus:outline-none`} style={{ background: 'rgba(30, 41, 59, 0.5)', color: '#c4b5fd', border: 'none', borderLeft: '1px solid rgba(139, 92, 246, 0.15)' }}>
                        <option value="daily">Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option>
                    </select>
                    <input type="time" value={scheduleSettings.time} onChange={(e) => handleScheduleChange('time', e.target.value)} disabled={scheduleLoading}
                        className={`${labelText} ${bodyPad} w-20 focus:ring-0 focus:outline-none`} style={{ background: 'rgba(30, 41, 59, 0.5)', color: '#c4b5fd', border: 'none', borderLeft: '1px solid rgba(139, 92, 246, 0.15)' }} />
                </>)}
            </div>

            {/* Cleanup */}
            <div className={`inline-flex items-center ${containerClass} overflow-hidden`} style={{ border: '1px solid rgba(245, 158, 11, 0.25)' }}>
                <div className={`flex items-center ${labelPad} ${labelText} font-medium`} style={{ background: 'rgba(245, 158, 11, 0.12)', color: '#fbbf24' }}>
                    <TrashIcon className={`${iconSz} mr-1`} />Cleanup:
                </div>
                <div className={`flex items-center ${bodyPad} gap-1`} style={{ background: 'rgba(30, 41, 59, 0.5)' }}>
                    <CompactStepper value={cleanupDays} onChange={setCleanupDays} color="amber" />
                    <span className={`${labelText} text-amber-400/70`}>days</span>
                </div>
                <button onClick={onCleanupArchive} disabled={isCleanupLoading}
                    className={`${labelPad} ${labelText} font-medium hover:bg-amber-500/15 disabled:opacity-50`}
                    style={{ background: 'rgba(245, 158, 11, 0.08)', color: '#fbbf24', borderLeft: '1px solid rgba(245, 158, 11, 0.15)' }}>
                    {isCleanupLoading ? '...' : 'Clean'}
                </button>
            </div>

            {/* Attach */}
            {!hideAttachment && (
                <div className={`inline-flex items-center ${containerClass}`} style={{ border: '1px solid rgba(16, 185, 129, 0.25)' }} ref={attachmentDropdownRef}>
                    <div className={`flex items-center ${labelPad} ${labelText} font-medium`} style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#34d399' }}>
                        <PaperClipIcon className={`${iconSz} mr-1`} />Attach:
                    </div>
                    <div className="relative">
                        <button onClick={() => setAttachmentDropdownOpen(!attachmentDropdownOpen)}
                            className={`flex items-center ${bodyPad} ${labelText} font-medium hover:bg-emerald-500/10`}
                            style={{ background: 'rgba(30, 41, 59, 0.5)', color: '#a7f3d0' }}>
                            {getSelectedLabel()}<ChevronDownIcon className={`ml-1 ${compact ? 'h-2 w-2' : 'h-2.5 w-2.5'} ${attachmentDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {attachmentDropdownOpen && (
                            <div className="absolute z-[9999] mt-1 w-40 rounded-lg shadow-xl py-1 text-xs left-0" style={{ background: 'rgba(30, 41, 59, 0.98)', border: '1px solid rgba(71, 85, 105, 0.5)' }}>
                                {FILE_TYPE_OPTIONS.map((option) => (
                                    <div key={option.id} onClick={(e) => { e.stopPropagation(); toggleExtension(option.id); }} className="relative cursor-pointer py-1.5 pl-2.5 pr-8 hover:bg-emerald-500/15">
                                        <span className={selectedExtensions.includes(option.id) ? 'font-medium text-emerald-400' : 'text-slate-400'}>{option.label}</span>
                                        {selectedExtensions.includes(option.id) && <CheckIcon className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-emerald-400" />}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className={`flex items-center ${bodyPad} gap-1`} style={{ background: 'rgba(30, 41, 59, 0.5)', borderLeft: '1px solid rgba(16, 185, 129, 0.15)' }}>
                        <CompactStepper value={fileCountThreshold} onChange={setFileCountThreshold} color="emerald" />
                        <span className={`${labelText} text-emerald-400/70`}>files</span>
                    </div>
                </div>
            )
            }
            {/* Sizes */}
            <div className={`inline-flex items-center ${containerClass} overflow-hidden`} style={{ border: '1px solid rgba(6, 182, 212, 0.25)' }}>
                <div className={`flex items-center ${labelPad} ${labelText} font-medium`} style={{ background: 'rgba(6, 182, 212, 0.12)', color: '#22d3ee' }}>
                    <CloudArrowUpIcon className={`${iconSz} mr-1`} />Sizes:
                </div>
                <div className={`flex items-center ${bodyPad} gap-1`} style={{ background: 'rgba(30, 41, 59, 0.5)' }} title="Max email size">
                    <span className={`${labelText} text-cyan-400/60`}>Max</span>
                    <CompactStepper value={sizeSettings.emailMaxSizeMB} onChange={(v) => updateSizeField('emailMaxSizeMB', v)} color="cyan" />
                </div>
                <div className={`flex items-center ${bodyPad} gap-1`} style={{ background: 'rgba(30, 41, 59, 0.5)', borderLeft: '1px solid rgba(6, 182, 212, 0.1)' }} title="Safe size">
                    <span className={`${labelText} text-cyan-400/60`}>Safe</span>
                    <CompactStepper value={sizeSettings.emailSafeSizeMB} onChange={(v) => updateSizeField('emailSafeSizeMB', v)} color="cyan" />
                </div>
                <div className={`flex items-center ${bodyPad} gap-1`} style={{ background: 'rgba(30, 41, 59, 0.5)', borderLeft: '1px solid rgba(6, 182, 212, 0.1)' }} title="GDrive threshold">
                    <span className={`${labelText} text-cyan-400/60`}>GDrive</span>
                    <CompactStepper value={sizeSettings.gdriveUploadThresholdMB} onChange={(v) => updateSizeField('gdriveUploadThresholdMB', v)} color="cyan" />
                </div>
                <span className={`${labelPad} ${labelText} font-medium`} style={{ background: 'rgba(6, 182, 212, 0.12)', color: '#22d3ee' }}>MB</span>
            </div>
        </div>
    );
};

export default ConsolidatedSettingsPanel;
