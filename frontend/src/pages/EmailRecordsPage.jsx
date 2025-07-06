// EmailRecordsPage.jsx
// This page is now a routing wrapper for the Email Records feature.
// All logic and UI are handled in features/email-records/index.js (EmailRecordsPage).
// This maintains routing consistency and allows future extension if needed.

import React from 'react';
import EmailRecordsPage from '../features/email-records';

const EmailRecordsPageWrapper = (props) => {
    return <EmailRecordsPage {...props} />;
};

export default EmailRecordsPageWrapper;
