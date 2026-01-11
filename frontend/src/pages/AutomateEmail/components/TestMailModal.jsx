import React, { useState, useEffect } from 'react';
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
        }
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

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/50" onClick={onClose}></div>

            {/* Modal - Compact design */}
            <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-md z-10 overflow-hidden">
                {/* Header - Compact */}
                <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center">
                        <PaperAirplaneIcon className="h-5 w-5 text-white mr-2" />
                        <h2 className="text-sm font-semibold text-white">Send Test Email</h2>
                    </div>
                    <button onClick={onClose} className="text-white/80 hover:text-white hover:bg-white/20 rounded p-1">
                        <XMarkIcon className="h-4 w-4" />
                    </button>
                </div>

                {/* Content - Compact with smaller spacing */}
                <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <svg className="animate-spin h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        </div>
                    ) : (
                        <>
                            {/* Row 1: Email & Company */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">
                                        Recipient <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.recipientEmail}
                                        onChange={(e) => handleChange('recipientEmail', e.target.value)}
                                        placeholder="email@example.com"
                                        className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Company Name</label>
                                    <input
                                        type="text"
                                        value={formData.companyName}
                                        onChange={(e) => handleChange('companyName', e.target.value)}
                                        placeholder="Test Company"
                                        className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                                    />
                                </div>
                            </div>

                            {/* Row 2: Subject */}
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                    Subject <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.subject}
                                    onChange={(e) => handleChange('subject', e.target.value)}
                                    placeholder="Test Email - {{company_name}}"
                                    className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                                />
                            </div>

                            {/* Row 3: Template & Folder */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Template</label>
                                    <select
                                        value={formData.templateId}
                                        onChange={(e) => handleChange('templateId', e.target.value)}
                                        className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                                    >
                                        {TEMPLATE_OPTIONS.map(opt => (
                                            <option key={opt.id} value={opt.id}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Attachments Folder</label>
                                    <div className="relative">
                                        <FolderIcon className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <input
                                            type="text"
                                            value={formData.folderPath}
                                            onChange={(e) => handleChange('folderPath', e.target.value)}
                                            placeholder="D:\Email_Folders\Report1"
                                            className="w-full pl-7 pr-2.5 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Custom Body (only when no template) */}
                            {formData.templateId === 'none' && (
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Email Body (HTML)</label>
                                    <textarea
                                        value={formData.body}
                                        onChange={(e) => handleChange('body', e.target.value)}
                                        placeholder="<p>Your custom email content...</p>"
                                        rows={3}
                                        className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-purple-500 focus:border-purple-500 font-mono"
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
                                    className="h-3.5 w-3.5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                />
                                <label htmlFor="saveDefault" className="ml-2 text-xs text-gray-600">
                                    Save as default
                                </label>
                            </div>

                            {/* Result Message */}
                            {sendResult && (
                                <div className={`p-2.5 rounded text-xs ${sendResult.success ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                                    {sendResult.message}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer - Compact */}
                <div className="border-t border-gray-100 px-4 py-3 flex justify-end gap-2 bg-gray-50">
                    <button
                        onClick={onClose}
                        className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSend}
                        disabled={isSending || isLoading}
                        className="px-3 py-1.5 text-xs font-medium text-white bg-purple-600 rounded hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center"
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
};

export default TestMailModal;
