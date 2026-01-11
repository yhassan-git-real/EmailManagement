import React from 'react';

/**
 * Compact header component for Email Records page - Modern SaaS style
 */
const EmailRecordsHeader = () => {
    return (
        <div className="flex items-center justify-between py-3 mb-3 border-b border-dark-300/30">
            {/* Left: Title and Description */}
            <div>
                <h1 className="text-xl font-semibold text-text-primary">Email Records</h1>
                <p className="text-xs text-text-muted mt-0.5">View and manage email records with search, filter, and bulk actions</p>
            </div>

            {/* Right: Status chips */}
            <div className="flex items-center gap-2">
                {/* Date chip */}
                <div className="text-xs text-text-muted bg-dark-500/40 px-2 py-1 rounded border border-dark-300/40 flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {new Date().toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                    })}
                </div>

                {/* Last updated chip */}
                <div className="text-xs text-primary-400 bg-primary-500/10 px-2 py-1 rounded border border-primary-500/20 flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Updated today
                </div>
            </div>
        </div>
    );
};

export default EmailRecordsHeader;
