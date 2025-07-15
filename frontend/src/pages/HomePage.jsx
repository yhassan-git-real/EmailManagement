import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ClockIcon, EnvelopeIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { formatProcessingTime, formatPercentage, formatNumber } from '../utils/formatUtils';
import {
    Header,
    Footer,
    StatusSummary,
    EmailChart,
    MetricsPanel,
    Breadcrumb
} from '../components';
import DateRangeFilter from '../components/email/filters/DateRangeFilter';
import { HomeIcon } from '@heroicons/react/24/outline';
import useDashboardData from '../hooks/useDashboardData';

const HomePage = ({ connectionInfo, onDisconnect }) => {
    // Use our custom hook for dashboard data
    const { dashboardData, lastUpdated, loading, error, fetchData } = useDashboardData();

    // Local state for date filter
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    // Extract data from dashboardData or use null if not available
    const emailTrends = dashboardData?.trends || null;
    const weeklyStats = dashboardData?.metrics || null;

    // Handle refresh button click
    const handleRefresh = () => {
        fetchData(startDate, endDate);
    };

    // Handle date filter apply
    const handleDateFilterApply = (start, end) => {
        setStartDate(start);
        setEndDate(end);
        fetchData(start, end);
    };

    // Fetch data on component mount
    useEffect(() => {
        // Only fetch if we don't already have data
        if (!dashboardData) {
            fetchData();
        }
    }, [dashboardData, fetchData]);

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <Header connectionInfo={connectionInfo} onDisconnect={onDisconnect} />

            <div className="flex-grow flex flex-col">
                <main className="flex-grow py-2 px-4 w-full">
                    <div className="w-full max-w-7xl mx-auto">
                        {/* Breadcrumb Navigation */}
                        <Breadcrumb
                            items={[
                                { label: 'Home', icon: <HomeIcon /> }
                            ]}
                        />

                        <div className="flex flex-col space-y-2 mb-3">
                            {/* Dashboard Controls */}
                            {/* Empty controls section, keeping for structure */}
                            <div></div>

                            {/* Error Message */}
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                                    <p className="text-sm">{error}</p>
                                </div>
                            )}
                        </div>

                        <div className="bg-gradient-to-br from-primary-50/80 via-white to-blue-50/50 rounded-2xl p-5 shadow-md border border-primary-100/30 mb-4 relative overflow-hidden">
                            {/* Enhanced decorative background elements */}
                            <div className="absolute top-0 right-0 w-40 h-40 bg-primary-100/40 rounded-full -mr-10 -mt-10 z-0 blur-md animate-pulse-slower"></div>
                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-100/30 rounded-full -ml-8 -mb-8 z-0 blur-sm animate-blob"></div>
                            <div className="absolute bottom-10 right-20 w-16 h-16 bg-primary-50/40 rounded-full z-0 blur-sm animation-delay-2000 animate-blob"></div>
                            <div className="absolute top-20 left-40 w-24 h-24 bg-blue-50/30 rounded-full z-0 blur-md animation-delay-4000 animate-blob"></div>
                            <div className="absolute inset-0 bg-white/5 backdrop-blur-sm z-0"></div>

                            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between">
                                <div className="flex items-start">
                                    {/* Modern dashboard icon with animation */}
                                    <div className="mr-5 bg-gradient-to-br from-primary-500 to-primary-600 text-white p-3.5 rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105 hover:rotate-3 group">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 transition-all duration-300 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                                        </svg>
                                        <div className="absolute -right-1 -top-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                                    </div>

                                    <div>
                                        {/* Enhanced page title with subtitle and improved typography */}
                                        <div>
                                            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight leading-tight">Email Dashboard</h1>
                                            <p className="text-sm text-gray-600 mt-1.5 tracking-wide leading-relaxed max-w-lg font-light">Monitor and manage your email communication performance with real-time analytics</p>
                                            <div className="mt-4">
                                                <button 
                                                    onClick={handleRefresh}
                                                    disabled={loading}
                                                    className="px-4 py-2 bg-primary-50 hover:bg-primary-100 text-primary-600 text-sm font-medium rounded-lg border border-primary-200 transition-colors flex items-center group"
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        strokeWidth={2}
                                                        stroke="currentColor"
                                                        className={`w-4 h-4 mr-2 transition-transform duration-500 ${loading ? 'animate-spin' : 'group-hover:rotate-180'}`}
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                                                    </svg>
                                                    {loading ? 'Refreshing...' : 'Refresh Dashboard'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Enhanced date display with better typography */}
                                <div className="mt-4 md:mt-0 self-end md:self-center flex items-center bg-white/90 py-2 px-4 rounded-lg shadow-sm border border-gray-100 hover:border-primary-200 transition-all duration-300 hover:shadow-md group cursor-default">
                                    <div className="bg-primary-50 p-2 rounded-md mr-3 group-hover:bg-primary-100 transition-colors duration-300">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <span className="text-xs uppercase text-gray-500 block tracking-wider font-medium">Today's Date</span>
                                        <span className="text-sm font-semibold text-gray-700 block tracking-wide">
                                            {new Date().toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* KPI metrics */}
                        <div className="mb-4 animate-slideIn">
                            {weeklyStats ? (
                                <MetricsPanel
                                    stats={{
                                        totalSent: formatNumber(weeklyStats.totalSent) || 0,
                                        weeklyChange: weeklyStats.weeklyChange || '0%',
                                        deliveryRate: formatPercentage(weeklyStats.deliveryRate) || '0%',
                                        bounceRate: formatPercentage(weeklyStats.bounceRate) || '0%',
                                        processingTime: formatProcessingTime(weeklyStats.processingTime) || '0s'
                                    }}
                                    loading={loading}
                                />
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 h-24 animate-pulse">
                                            <div className="flex items-center space-x-4">
                                                <div className="rounded-full bg-gray-200 h-10 w-10"></div>
                                                <div className="space-y-2 flex-1">
                                                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                                    <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Date Range Filter */}
                        <div className="mb-4">
                            <DateRangeFilter onApplyFilter={handleDateFilterApply} disabled={loading} />
                        </div>

                        {/* Email Status Section - Compact Version */}
                        <div className="mb-4 transition-all duration-300 hover:shadow-sm">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-100">
                                <StatusSummary />
                            </div>
                        </div>

                        {/* Charts Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                            {/* Chart Section - Left Column */}
                            <div className="">
                                <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-200 h-full">
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-sm font-medium text-gray-700">Email Delivery Breakdown</h2>
                                        <div className="text-xs text-gray-500">{startDate && endDate ? `${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}` : 'Last 7 days'}</div>
                                    </div>
                                    {loading ? (
                                        <div className="flex items-center justify-center h-64">
                                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
                                        </div>
                                    ) : emailTrends ? (
                                        <EmailChart
                                            type="pie"
                                            data={{
                                                labels: ['Delivered', 'Failed', 'Pending'],
                                                values: [
                                                    emailTrends.sent.reduce((a, b) => a + b, 0),
                                                    emailTrends.failed.reduce((a, b) => a + b, 0),
                                                    emailTrends.pending.reduce((a, b) => a + b, 0)
                                                ],
                                                colors: ['#10B981', '#EF4444', '#F59E0B']
                                            }}
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-64 text-gray-500">
                                            No data available
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Trend Chart Section - Right Column */}
                            <div className="">
                                <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 h-full">
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-sm font-medium text-gray-700">Email Delivery Trends</h2>
                                        <div className="text-xs text-gray-500">{startDate && endDate ? `${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}` : 'Last 7 days'}</div>
                                    </div>
                                    {loading ? (
                                        <div className="flex items-center justify-center h-64">
                                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
                                        </div>
                                    ) : emailTrends ? (
                                        <EmailChart
                                            type="line"
                                            data={{
                                                labels: emailTrends.labels,
                                                datasets: [
                                                    { label: 'Delivered', data: emailTrends.sent, color: '#10B981' },
                                                    { label: 'Failed', data: emailTrends.failed, color: '#EF4444' },
                                                    { label: 'Pending', data: emailTrends.pending, color: '#F59E0B' }
                                                ]
                                            }}
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-64 text-gray-500">
                                            No data available
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions Section */}
                        <div className="mb-6">
                            {/* Quick Action Links Section */}
                            <div className="">
                                <div className="p-5 bg-white rounded-lg border border-gray-200 shadow-sm">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="font-medium text-gray-800 text-sm flex items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-1.5 text-primary-500">
                                                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                            </svg>
                                            Quick Actions
                                        </h3>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 stagger-children">
                                        <a href="/email-records" className="flex flex-col items-center justify-center p-4 bg-white rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-300 hover:shadow-md transition-all duration-300 group hover:-translate-y-1">
                                            <div className="p-3 rounded-full bg-blue-100 text-blue-600 mb-3 group-hover:scale-110 transition-transform duration-300 group-hover:bg-blue-600 group-hover:text-white">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                                                    <path d="M8.707 7.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l2-2a1 1 0 00-1.414-1.414L11 7.586V3a1 1 0 10-2 0v4.586l-.293-.293z" />
                                                    <path d="M3 5a2 2 0 012-2h1a1 1 0 010 2H5v7h2l1 2h4l1-2h2V5h-1a1 1 0 110-2h1a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5z" />
                                                </svg>
                                            </div>
                                            <span className="text-sm text-gray-700 group-hover:text-blue-700 font-medium text-center">Check Emails</span>
                                            <span className="text-xs text-gray-400 mt-1">View all records</span>
                                        </a>

                                        <a href="/automate" className="flex flex-col items-center justify-center p-4 bg-white rounded-lg border border-gray-200 hover:bg-green-50 hover:border-green-300 hover:shadow-md transition-all duration-300 group hover:-translate-y-1">
                                            <div className="p-3 rounded-full bg-green-100 text-green-600 mb-3 group-hover:scale-110 transition-transform duration-300 group-hover:bg-green-600 group-hover:text-white">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <span className="text-sm text-gray-700 group-hover:text-green-700 font-medium text-center">Automate Email</span>
                                            <span className="text-xs text-gray-400 mt-1">Create workflows</span>
                                        </a>

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        </div>
    );
};

export default HomePage;
