import React from 'react';
import EmailRecordsView from './EmailRecordsView';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { Link } from 'react-router-dom';
import { EnvelopeIcon } from '@heroicons/react/24/outline';

const EmailRecordsPage = ({ connectionInfo, onDisconnect }) => {
    // Add a console log to verify when this component is rendered
    console.log('[EmailRecordsPage] Rendering Email Records Page component');

    return (
        <div className="flex flex-col min-h-screen">
            <Header connectionInfo={connectionInfo} onDisconnect={onDisconnect} />

            <div className="flex-grow bg-gradient-to-b from-gray-50 to-gray-100">
                <main className="max-w-full mx-auto py-4 px-6 md:px-12 lg:px-6 xl:px-8 2xl:container">
                    {/* Breadcrumb Navigation - More Compact */}
                    <div className="mb-4 w-full bg-white shadow-sm rounded-lg p-2 border border-gray-200 animate-fadeIn">
                        <div className="flex items-center space-x-2 text-xs">
                            <Link to="/home" className="flex items-center text-gray-600 hover:text-primary-600 transition-colors duration-200 px-2 py-1 hover:bg-gray-50 rounded-md">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                                Home
                            </Link>
                            <span className="text-gray-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </span>
                            <span className="bg-primary-50 text-primary-700 text-xs font-medium px-2 py-1 rounded-md border border-primary-100 shadow-sm flex items-center">
                                <EnvelopeIcon className="h-3 w-3 mr-1" />
                                Email Records
                            </span>
                        </div>
                    </div>

                    <div className="w-full">
                        <EmailRecordsView key="email-records-view" />
                    </div>
                </main>
            </div>

            <Footer />
        </div>
    );
};

export default EmailRecordsPage;
