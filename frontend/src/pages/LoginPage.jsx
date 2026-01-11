import React, { useState } from 'react';
import {
    Footer,
    DatabaseConnector,
    Alert,
    Welcome,
    BackgroundIllustration,
    BrandingHeader
} from '../components';

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
            {/* Dark gradient background matching app theme */}
            <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 z-0"></div>

            {/* Branding Header */}
            <BrandingHeader />

            {/* Subtle grid pattern overlay */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="darkGrid" width="32" height="32" patternUnits="userSpaceOnUse">
                            <path d="M 32 0 L 0 0 0 32" fill="none" stroke="rgba(99, 102, 241, 0.1)" strokeWidth="0.5" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#darkGrid)" />
                </svg>
            </div>

            {/* Animated gradient blobs */}
            <div className="fixed top-1/4 right-0 w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob z-0 pointer-events-none"></div>
            <div className="fixed bottom-0 left-1/4 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000 z-0 pointer-events-none"></div>
            <div className="fixed top-2/3 left-1/3 w-96 h-96 bg-cyan-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000 z-0 pointer-events-none"></div>

            {/* Main container */}
            <div className="flex-grow relative z-10">
                {/* Main content */}
                <main className="relative py-12 px-4 sm:px-6 lg:px-8 w-full min-h-[calc(100vh-10rem)]">
                    <div className="max-w-6xl mx-auto">
                        <div className="animate-fadeIn transition-all duration-500">
                            {/* Dark glassmorphism two-column layout */}
                            <div className="rounded-xl overflow-hidden" style={{
                                background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.85) 100%)',
                                backdropFilter: 'blur(20px)',
                                WebkitBackdropFilter: 'blur(20px)',
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 60px rgba(99, 102, 241, 0.1)'
                            }}>
                                <div className="grid grid-cols-1 lg:grid-cols-2 lg:divide-x lg:divide-slate-700/30">
                                    {/* Left column: Welcome section */}
                                    <div className="p-8 lg:p-12 flex items-center" style={{
                                        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.5) 0%, rgba(15, 23, 42, 0.7) 100%)'
                                    }}>
                                        <Welcome />
                                    </div>

                                    {/* Right column: Database connector */}
                                    <div className="p-8 lg:p-12 relative overflow-hidden" style={{
                                        background: 'linear-gradient(135deg, rgba(20, 28, 45, 0.6) 0%, rgba(15, 20, 35, 0.8) 100%)'
                                    }}>
                                        {/* Decorative glowing elements */}
                                        <div className="absolute -top-24 -right-24 w-56 h-56 rounded-full opacity-20"
                                            style={{ background: 'radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, transparent 70%)' }}></div>
                                        <div className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full opacity-15"
                                            style={{ background: 'radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, transparent 70%)' }}></div>

                                        {/* Database connector component */}
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
