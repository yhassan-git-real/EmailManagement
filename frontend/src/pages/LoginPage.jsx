import React, { useState } from 'react';
import BrandingHeader from '../components/BrandingHeader';
import Footer from '../components/Footer';
import DatabaseConnector from '../components/DatabaseConnector';
import Alert from '../components/Alert';
import Welcome from '../components/Welcome';
import BackgroundIllustration from '../components/BackgroundIllustration';

const LoginPage = ({ isConnected, connectionInfo, onConnected, onConnectionInfoUpdate, onDisconnect }) => {
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    const localIsConnected = isConnected === undefined ? false : isConnected;

    // Handle successful connection
    const handleConnected = (connected) => {
        if (connected) {
            onConnected(connected);
            // No need to show success alert here since we're redirecting to dashboard page
        }
    };

    return (
        <div className="flex flex-col min-h-screen">
            {/* Enhanced gradient background with more contrast */}
            <div className="fixed inset-0 bg-gradient-to-br from-blue-100 via-white to-blue-200 z-0"></div>
            <div className="fixed inset-0 bg-gradient-to-tr from-transparent via-transparent to-indigo-100 opacity-70 z-0"></div>

            {/* SVG Pattern overlay for visual interest */}
            <div className="fixed inset-0 opacity-10 z-0 pointer-events-none">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
                    <defs>
                        <pattern id="smallGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-blue-500" />
                        </pattern>
                        <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
                            <rect width="100" height="100" fill="url(#smallGrid)" />
                            <path d="M 100 0 L 0 0 0 100" fill="none" stroke="currentColor" strokeWidth="1" className="text-blue-500" />
                        </pattern>
                        <pattern id="circles" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                            <circle cx="20" cy="20" r="2" fill="currentColor" className="text-blue-300" fillOpacity="0.5" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#circles)" />
                </svg>
            </div>

            {/* Animated blobs for subtle modern feel */}
            <div className="fixed top-1/4 right-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob z-0 pointer-events-none"></div>
            <div className="fixed bottom-0 left-1/4 w-96 h-96 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000 z-0 pointer-events-none"></div>
            <div className="fixed top-2/3 left-1/3 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000 z-0 pointer-events-none"></div>

            {/* Branding Header with navigation */}
            <BrandingHeader />

            {/* Main container with improved visuals */}
            <div className="flex-grow relative z-10">
                {/* Additional decorative elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-50">
                    <BackgroundIllustration />
                </div>

                {/* Main content */}
                <main className="relative py-12 px-4 sm:px-6 lg:px-8 w-full min-h-[calc(100vh-10rem)]">
                    <div className="max-w-6xl mx-auto">
                        <div className="animate-fadeIn transition-all duration-500">
                            {/* Enhanced two-column layout with improved styling and larger sizing */}
                            <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300">
                                <div className="grid grid-cols-1 lg:grid-cols-2 lg:divide-x lg:divide-gray-100">
                                    {/* Left column: Welcome section with improved styling and increased size */}
                                    <div className="p-8 lg:p-12 flex items-center bg-gradient-to-br from-white to-blue-50">
                                        <Welcome />
                                    </div>

                                    {/* Right column: Database connector with enhanced styling and increased size */}
                                    <div className="p-8 lg:p-12 bg-gradient-to-b from-white to-blue-50 relative overflow-hidden">
                                        {/* Enhanced decorative elements */}
                                        <div className="absolute -top-24 -right-24 w-56 h-56 bg-blue-100 rounded-full opacity-70 animate-pulse-slow"></div>
                                        <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-cyan-100 rounded-full opacity-60 animate-pulse-slower"></div>
                                        <div className="absolute -bottom-8 left-1/3 w-24 h-24 bg-indigo-100 rounded-full opacity-40"></div>

                                        {/* Database connector component with relative positioning */}
                                        <div className="relative">
                                            <DatabaseConnector
                                                onConnected={(connected) => handleConnected(connected)}
                                                onConnectionInfoUpdate={onConnectionInfoUpdate}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            <Footer />
        </div>
    );
};

export default LoginPage;
