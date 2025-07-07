import React from 'react';
import { EnvelopeIcon } from '@heroicons/react/24/outline';

/**
 * Header component for Email Records page - simplified version as main layout handles the structure
 */
const EmailRecordsHeader = () => {
    return (
        <div className="mb-4 border-b border-gray-200 pb-3">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                    <div className="bg-primary-100 p-2 rounded-lg mr-3">
                        <EnvelopeIcon className="h-5 w-5 text-primary-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-primary-700 tracking-tight">Database Email Records</h1>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="text-xs text-gray-500 font-medium bg-gray-50 px-2 py-1 rounded-md border border-gray-200 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date().toLocaleDateString('en-US', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                        })}
                    </div>
                    <div className="text-xs text-primary-600 font-medium bg-primary-50 px-2 py-1 rounded-md border border-primary-100 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
                        </svg>
                        Last updated: Today
                    </div>
                </div>
            </div>
            <div className="text-sm text-gray-600 font-medium">
                View and manage email records with search, filter, and bulk actions functionality.
            </div>
        </div>
    );
};

export default EmailRecordsHeader;
