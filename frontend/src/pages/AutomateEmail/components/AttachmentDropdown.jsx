import React, { useState, useEffect, useRef } from 'react';
import { PaperClipIcon, CheckIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const FILE_TYPE_OPTIONS = [
    { id: 'all', label: 'All Files', short: 'All' },
    { id: 'excel', label: 'Excel (.xlsx, .xls)', short: 'Excel' },
    { id: 'csv', label: 'CSV (.csv)', short: 'CSV' },
    { id: 'txt', label: 'Text (.txt)', short: 'TXT' },
    { id: 'pdf', label: 'PDF (.pdf)', short: 'PDF' },
];

/**
 * AttachmentDropdown - Standalone attachment settings dropdown
 * Can be placed in action buttons row or settings row
 */
const AttachmentDropdown = ({ compact = false }) => {
    const [fileCountThreshold, setFileCountThreshold] = useState(5);
    const [selectedExtensions, setSelectedExtensions] = useState(['all']);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [originalThreshold, setOriginalThreshold] = useState(5);
    const [originalExtensions, setOriginalExtensions] = useState(['all']);
    const dropdownRef = useRef(null);

    // Load settings on mount
    useEffect(() => {
        loadAttachmentSettings();
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Auto-save when settings change
    useEffect(() => {
        const thresholdChanged = fileCountThreshold !== originalThreshold;
        const extensionsChanged = JSON.stringify(selectedExtensions.sort()) !== JSON.stringify(originalExtensions.sort());
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
        } catch (error) {
            console.error('Failed to load attachment settings:', error);
        }
    };

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
            }
        } catch (error) {
            console.error('Failed to save attachment settings:', error);
        }
    };

    const toggleExtension = (extensionId) => {
        setSelectedExtensions(prev => {
            if (extensionId === 'all') return ['all'];
            const newExtensions = prev.includes(extensionId)
                ? prev.filter(id => id !== extensionId && id !== 'all')
                : [...prev.filter(id => id !== 'all'), extensionId];
            return newExtensions.length === 0 ? ['all'] : newExtensions;
        });
    };

    const getSelectedLabel = () => {
        if (selectedExtensions.includes('all') || selectedExtensions.length === 0) return 'All';
        if (selectedExtensions.length === 1) {
            const option = FILE_TYPE_OPTIONS.find(opt => opt.id === selectedExtensions[0]);
            return option ? option.short : 'All';
        }
        return `${selectedExtensions.length} types`;
    };

    const btnBase = "inline-flex items-center px-3 py-1.5 text-xs font-medium transition-all duration-200";

    return (
        <div className="relative inline-flex items-center rounded-md" style={{ border: '1px solid rgba(16, 185, 129, 0.25)' }} ref={dropdownRef}>
            {/* Label */}
            <div className="flex items-center px-2 py-1.5 font-medium text-xs" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#34d399' }}>
                <PaperClipIcon className="h-3.5 w-3.5 mr-1" />Attach:
            </div>

            {/* Dropdown button */}
            <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center px-2.5 py-1.5 text-xs font-medium hover:bg-emerald-500/10"
                style={{ background: 'rgba(30, 41, 59, 0.5)', color: '#a7f3d0' }}>
                {getSelectedLabel()}
                <ChevronDownIcon className={`ml-1 h-3 w-3 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* File count stepper */}
            <div className="flex items-center px-2 py-1.5 gap-1" style={{ background: 'rgba(30, 41, 59, 0.5)', borderLeft: '1px solid rgba(16, 185, 129, 0.15)' }}>
                <button
                    onClick={() => fileCountThreshold > 1 && setFileCountThreshold(fileCountThreshold - 1)}
                    className="hover:bg-white/5 rounded"
                    style={{ color: '#34d399' }}>
                    <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                </button>
                <span className="text-xs font-medium min-w-[20px] text-center" style={{ color: '#34d399' }}>
                    {fileCountThreshold}
                </span>
                <button
                    onClick={() => fileCountThreshold < 999 && setFileCountThreshold(fileCountThreshold + 1)}
                    className="hover:bg-white/5 rounded"
                    style={{ color: '#34d399' }}>
                    <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>

            {/* Files label */}
            <span className="px-2 py-1.5 text-xs font-medium" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#34d399', borderLeft: '1px solid rgba(16, 185, 129, 0.15)' }}>
                files
            </span>

            {/* Dropdown menu - positioned relative to outer container */}
            {dropdownOpen && (
                <div className="absolute z-[9999] top-full mt-1 w-40 rounded-lg shadow-xl py-1 text-xs left-0"
                    style={{ background: 'rgba(30, 41, 59, 0.98)', border: '1px solid rgba(71, 85, 105, 0.5)' }}>
                    {FILE_TYPE_OPTIONS.map((option) => (
                        <div
                            key={option.id}
                            onClick={(e) => { e.stopPropagation(); toggleExtension(option.id); }}
                            className="relative cursor-pointer py-1.5 pl-2.5 pr-8 hover:bg-emerald-500/15">
                            <span className={selectedExtensions.includes(option.id) ? 'font-medium text-emerald-400' : 'text-slate-400'}>
                                {option.label}
                            </span>
                            {selectedExtensions.includes(option.id) && (
                                <CheckIcon className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-emerald-400" />
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AttachmentDropdown;
