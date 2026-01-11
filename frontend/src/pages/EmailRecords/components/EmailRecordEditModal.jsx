import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * Modal component for editing email records - Compact two-column layout
 */
const EmailRecordEditModal = ({ record, onSave, onCancel, isLoading = false }) => {
    const [formData, setFormData] = useState({
        id: record.id,
        company_name: record.company_name || '',
        email: record.email || '',
        subject: record.subject || '',
        file_path: record.display_file_path || '',
        email_status: record.email_status || 'Pending',
        reason: record.reason || '',
        email_send_date: record.email_send_date || new Date().toISOString()
    });
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'email_send_date') {
            setFormData(prev => ({
                ...prev,
                [name]: value ? new Date(value).toISOString() : new Date().toISOString()
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }

        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: undefined
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.company_name.trim()) newErrors.company_name = 'Required';
        if (!formData.email.trim()) {
            newErrors.email = 'Required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Invalid email';
        }
        if (!formData.subject.trim()) newErrors.subject = 'Required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            onSave(formData);
        }
    };

    const inputClass = (hasError) => `w-full px-2.5 py-1.5 text-sm border ${hasError ? 'border-danger' : 'border-dark-300/50'} rounded-lg bg-dark-500/50 text-text-primary focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500`;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-center justify-center min-h-screen p-4">
                {/* Background overlay */}
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" aria-hidden="true" onClick={onCancel}></div>

                {/* Modal panel - Compact */}
                <div className="relative bg-dark-600 rounded-xl shadow-2xl w-full max-w-lg border border-dark-300/50 overflow-hidden">
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-dark-300/50 bg-dark-700/80">
                        <h3 className="text-base font-medium text-text-primary font-display">Edit Email Record</h3>
                    </div>

                    <form onSubmit={handleSubmit} className="p-4">
                        {/* Two column grid */}
                        <div className="grid grid-cols-2 gap-3">
                            {/* Company Name */}
                            <div>
                                <label className="block text-xs font-medium text-text-secondary mb-1">
                                    Company <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="company_name"
                                    value={formData.company_name}
                                    onChange={handleChange}
                                    className={inputClass(errors.company_name)}
                                    disabled={isLoading}
                                />
                                {errors.company_name && <p className="mt-0.5 text-xs text-danger-light">{errors.company_name}</p>}
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-xs font-medium text-text-secondary mb-1">
                                    Email <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={inputClass(errors.email)}
                                    disabled={isLoading}
                                />
                                {errors.email && <p className="mt-0.5 text-xs text-danger-light">{errors.email}</p>}
                            </div>

                            {/* Subject - Full width */}
                            <div className="col-span-2">
                                <label className="block text-xs font-medium text-text-secondary mb-1">
                                    Subject <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    className={inputClass(errors.subject)}
                                    disabled={isLoading}
                                />
                                {errors.subject && <p className="mt-0.5 text-xs text-danger-light">{errors.subject}</p>}
                            </div>

                            {/* File Path - Full width */}
                            <div className="col-span-2">
                                <label className="block text-xs font-medium text-text-secondary mb-1">File Path</label>
                                <input
                                    type="text"
                                    name="file_path"
                                    value={formData.file_path}
                                    onChange={handleChange}
                                    className={inputClass(false)}
                                    disabled={isLoading}
                                />
                            </div>

                            {/* Status */}
                            <div>
                                <label className="block text-xs font-medium text-text-secondary mb-1">Status</label>
                                <select
                                    name="email_status"
                                    value={formData.email_status}
                                    onChange={handleChange}
                                    className={inputClass(false)}
                                    disabled={isLoading}
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="Success">Success</option>
                                    <option value="Failed">Failed</option>
                                </select>
                            </div>

                            {/* Send Date */}
                            <div>
                                <label className="block text-xs font-medium text-text-secondary mb-1">Send Date</label>
                                <input
                                    type="datetime-local"
                                    name="email_send_date"
                                    value={formData.email_send_date ? new Date(formData.email_send_date).toISOString().slice(0, 16) : ''}
                                    onChange={handleChange}
                                    className={inputClass(false)}
                                    disabled={isLoading}
                                />
                            </div>

                            {/* Reason - Full width, shorter */}
                            <div className="col-span-2">
                                <label className="block text-xs font-medium text-text-secondary mb-1">Reason / Notes</label>
                                <textarea
                                    name="reason"
                                    value={formData.reason}
                                    onChange={handleChange}
                                    rows={2}
                                    className={inputClass(false)}
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-4 flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={onCancel}
                                disabled={isLoading}
                                className="px-3 py-1.5 text-sm font-medium text-text-secondary bg-dark-500/50 border border-dark-300/50 rounded-lg hover:bg-dark-400/50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="px-3 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-primary-500 to-accent-violet rounded-lg hover:from-primary-600 hover:to-accent-violet/90 transition-all"
                            >
                                {isLoading ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

EmailRecordEditModal.propTypes = {
    record: PropTypes.object.isRequired,
    onSave: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    isLoading: PropTypes.bool
};

export default EmailRecordEditModal;
