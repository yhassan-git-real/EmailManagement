import React from 'react';
import EmailRecordsView from './EmailRecordsView';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const EmailRecordsPage = ({ connectionInfo, onDisconnect }) => {
    // Add a console log to verify when this component is rendered
    console.log('[EmailRecordsPage] Rendering Email Records Page component');

    return (
        <div className="flex flex-col min-h-screen">
            <Header connectionInfo={connectionInfo} onDisconnect={onDisconnect} />

            <div className="flex-grow bg-gray-50">
                <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    <div className="px-4 py-2 sm:px-0">
                        <EmailRecordsView key="email-records-view" />
                    </div>
                </main>
            </div>

            <Footer />
        </div>
    );
};

export default EmailRecordsPage;
