import React from 'react';
import EmailRecordsView from './EmailRecordsView';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Breadcrumb, { HomeIcon } from '../../components/Breadcrumb';
import { EnvelopeIcon } from '@heroicons/react/24/outline';

const EmailRecordsPage = ({ connectionInfo, onDisconnect }) => {
    // Add a console log to verify when this component is rendered
    console.log('[EmailRecordsPage] Rendering Email Records Page component');

    return (
        <div className="flex flex-col min-h-screen">
            <Header connectionInfo={connectionInfo} onDisconnect={onDisconnect} />

            <div className="flex-grow bg-gradient-to-b from-gray-50 to-gray-100">
                <main className="flex-grow py-3 px-3 w-full animate-fadeIn">
                    <div className="w-full max-w-full mx-auto px-2">
                    {/* Breadcrumb Navigation */}
                    <Breadcrumb
                        items={[
                            { label: 'Home', path: '/home', icon: <HomeIcon /> },
                            { label: 'Email Records', path: '/email-records', icon: <EnvelopeIcon className="h-3.5 w-3.5" /> }
                        ]}
                    />

                    <div className="w-full">
                        <EmailRecordsView key="email-records-view" />
                    </div>
                    </div>
                </main>
            </div>

            <Footer />
        </div>
    );
};

export default EmailRecordsPage;
