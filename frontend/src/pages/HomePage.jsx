import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import StatusSummary from '../components/StatusSummary';

const HomePage = ({ connectionInfo, onDisconnect }) => {
    const [isLoading, setIsLoading] = useState(false);

    return (
        <div className="flex flex-col min-h-screen">
            <Header connectionInfo={connectionInfo} onDisconnect={onDisconnect} />
            <div className="flex flex-row flex-grow relative">
                <main className="flex-grow py-6 px-4 bg-gradient-to-b from-gray-50 to-gray-100 w-full">
                    <div className="w-full max-w-7xl mx-auto">
                        <h1 className="text-2xl font-bold mb-6 text-primary-600 pl-1 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                            </svg>
                            Home
                        </h1>

                        <div className="grid grid-cols-1 gap-8">
                            {/* Email Status Summary Section */}
                            <div className="bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
                                <h2 className="text-xl font-semibold mb-4 text-gray-800">Email Status Overview</h2>
                                <StatusSummary />
                            </div>

                            {/* Quick Actions Section */}
                            <div className="bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
                                <h2 className="text-xl font-semibold mb-4 text-gray-800">Quick Actions</h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <a href="/email-records" className="flex flex-col items-center p-4 bg-blue-50 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors duration-200">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600 mb-2" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
                                            <path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-blue-800 font-medium">View Email Records</span>
                                    </a>

                                    <a href="/automate" className="flex flex-col items-center p-4 bg-green-50 rounded-lg border border-green-100 hover:bg-green-100 transition-colors duration-200">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600 mb-2" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-green-800 font-medium">Configure Automation</span>
                                    </a>

                                    <button className="flex flex-col items-center p-4 bg-purple-50 rounded-lg border border-purple-100 hover:bg-purple-100 transition-colors duration-200">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600 mb-2" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-purple-800 font-medium">Generate Reports</span>
                                    </button>
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

export default HomePage;
