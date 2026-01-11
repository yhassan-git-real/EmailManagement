import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { XMarkIcon, PaperAirplaneIcon, FolderIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Template options
const TEMPLATE_OPTIONS = [
    { id: 'default', label: 'Default' },
    { id: 'followup', label: 'Follow-up' },
    { id: 'escalation', label: 'Escalation' },
    { id: 'reminder', label: 'Reminder' },
    { id: 'custom', label: 'Custom' },
    { id: 'none', label: 'No Template' },
];

/**
 * TestMailModal - Compact modal for sending test emails
 * Uses React Portal to render outside the component tree
 */
const TestMailModal = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({
        recipientEmail: '',
        subject: 'Test Email - {{company_name}}',
        body: '',
        templateId: 'default',
        folderPath: '',
        companyName: 'Test Company',
        saveAsDefault: false,
    });

    const [isLoading, setIsLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [sendResult, setSendResult] = useState(null);

    useEffect(() => {
        if (isOpen) {
            loadDefaults();
            setSendResult(null);
            // Prevent body scroll when modal is open
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    const loadDefaults = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/automation/test-mail/defaults`);
            const data = await response.json();
            if (data.success && data.data) {
                setFormData(prev => ({ ...prev, ...data.data, saveAsDefault: false }));
            }
        } catch (error) {
            console.error('Failed to load test mail defaults:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSend = async () => {
        if (!formData.recipientEmail) {
            toast.error('Please enter recipient email');
            return;
        }
        if (!formData.subject) {
            toast.error('Please enter subject');
            return;
        }

        setIsSending(true);
        setSendResult(null);

        try {
            const response = await fetch(`${API_BASE_URL}/api/automation/test-mail/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (data.success) {
                setSendResult({ success: true, message: data.message });
                toast.success('Test email sent!');
            } else {
                setSendResult({ success: false, message: data.details || data.message });
                toast.error(data.message || 'Failed to send');
            }
        } catch (error) {
            setSendResult({ success: false, message: error.message });
            toast.error('Failed to send test email');
        } finally {
            setIsSending(false);
        }
    };

    if (!isOpen) return null;

    const inputClass = "w-full px-2.5 py-1.5 text-sm border border-dark-300/50 rounded-lg bg-dark-500/50 text-text-primary placeholder-text-muted focus:ring-1 focus:ring-accent-violet focus:border-accent-violet";

    const modalContent = (
        <div
            className="test-mail-modal-overlay"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 99999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem',
            }}
        >
            {/* Backdrop */}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    backdropFilter: 'blur(4px)',
                }}
                onClick={onClose}
            />

            {/* Modal */}
            <div
                className="bg-dark-600 rounded-xl shadow-2xl w-full max-w-md border border-dark-300/50 overflow-hidden"
                style={{
                    position: 'relative',
                    zIndex: 1,
                }}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-accent-violet to-primary-600 px-4 py-2.5 flex items-center justify-between">
                    <div className="flex items-center">
                        <PaperAirplaneIcon className="h-4 w-4 text-white mr-2" />
                        <h2 className="text-sm font-semibold text-white font-display">Send Test Email</h2>
                    </div>
                    <button onClick={onClose} className="text-white/80 hover:text-white hover:bg-white/20 rounded p-1 transition-colors">
                        <XMarkIcon className="h-4 w-4" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 max-h-[60vh] overflow-y-auto">
                    {isLoading ? (
                        <div className="flex justify-center py-6">
                            <svg className="animate-spin h-6 w-6 text-accent-violet" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {/* Row 1: Email & Company */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-text-secondary mb-1">
                                        Recipient <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.recipientEmail}
                                        onChange={(e) => handleChange('recipientEmail', e.target.value)}
                                        placeholder="email@example.com"
                                        className={inputClass}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-text-secondary mb-1">Company Name</label>
                                    <input
                                        type="text"
                                        value={formData.companyName}
                                        onChange={(e) => handleChange('companyName', e.target.value)}
                                        placeholder="Test Company"
                                        className={inputClass}
                                    />
                                </div>
                            </div>

                            {/* Row 2: Subject */}
                            <div>
                                <label className="block text-xs font-medium text-text-secondary mb-1">
                                    Subject <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.subject}
                                    onChange={(e) => handleChange('subject', e.target.value)}
                                    placeholder="Test Email - {{company_name}}"
                                    className={inputClass}
                                />
                            </div>

                            {/* Row 3: Template & Folder */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-text-secondary mb-1">Template</label>
                                    <select
                                        value={formData.templateId}
                                        onChange={(e) => handleChange('templateId', e.target.value)}
                                        className={inputClass}
                                    >
                                        {TEMPLATE_OPTIONS.map(opt => (
                                            <option key={opt.id} value={opt.id}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-text-secondary mb-1">Attachments</label>
                                    <div className="relative">
                                        <FolderIcon className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                                        <input
                                            type="text"
                                            value={formData.folderPath}
                                            onChange={(e) => handleChange('folderPath', e.target.value)}
                                            placeholder="Folder path"
                                            className={`${inputClass} pl-7`}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Custom Body (only when no template) */}
                            {formData.templateId === 'none' && (
                                <div>
                                    <label className="block text-xs font-medium text-text-secondary mb-1">Email Body (HTML)</label>
                                    <textarea
                                        value={formData.body}
                                        onChange={(e) => handleChange('body', e.target.value)}
                                        placeholder="<p>Your custom email content...</p>"
                                        rows={3}
                                        className={`${inputClass} font-mono`}
                                    />
                                </div>
                            )}

                            {/* Save as Default */}
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="saveDefault"
                                    checked={formData.saveAsDefault}
                                    onChange={(e) => handleChange('saveAsDefault', e.target.checked)}
                                    className="h-3.5 w-3.5 text-accent-violet border-dark-300 rounded focus:ring-accent-violet bg-dark-500"
                                />
                                <label htmlFor="saveDefault" className="ml-2 text-xs text-text-secondary">
                                    Save as default
                                </label>
                            </div>

                            {/* Result Message */}
                            {sendResult && (
                                <div className={`p-2.5 rounded-lg text-xs ${sendResult.success ? 'bg-success/20 text-success-light border border-success/30' : 'bg-danger/20 text-danger-light border border-danger/30'}`}>
                                    {sendResult.message}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t border-dark-300/50 px-4 py-2.5 flex justify-end gap-2 bg-dark-700/50">
                    <button
                        onClick={onClose}
                        className="px-3 py-1.5 text-xs font-medium text-text-secondary bg-dark-500/50 border border-dark-300/50 rounded-lg hover:bg-dark-400/50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSend}
                        disabled={isSending || isLoading}
                        className="px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-accent-violet to-primary-600 rounded-lg hover:from-accent-violet/90 hover:to-primary-700 transition-colors disabled:opacity-50 flex items-center"
                    >
                        {isSending ? (
                            <>
                                <svg className="animate-spin -ml-0.5 mr-1.5 h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Sending...
                            </>
                        ) : (
                            <>
                                <PaperAirplaneIcon className="h-3.5 w-3.5 mr-1.5" />
                                Send Test
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );

    // Use React Portal to render modal at document.body level
    return ReactDOM.createPortal(modalContent, document.body);
};

export default TestMailModal;
