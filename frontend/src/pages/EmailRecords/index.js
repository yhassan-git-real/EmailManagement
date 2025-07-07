import React from 'react';
import EmailRecordsPage from './EmailRecordsPage';

/**
 * Wrapper component for EmailRecordsPage that maintains backward compatibility
 * This replaces the standalone EmailRecordsPage.jsx in the pages directory
 */
const EmailRecordsWrapper = ({ connectionInfo, onDisconnect, ...otherProps }) => {
    console.log('[EmailRecordsWrapper] Rendering EmailRecords with connectionInfo:', connectionInfo);
    return <EmailRecordsPage connectionInfo={connectionInfo} onDisconnect={onDisconnect} {...otherProps} />;
};

export default EmailRecordsWrapper;
