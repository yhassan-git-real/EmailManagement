import React, { useState, useEffect } from 'react';
import { formatProcessingTime, formatPercentage, formatNumber } from '../utils/formatUtils';
import {
    Header,
    Footer,
    StatusSummary,
    EmailChart,
    MetricsPanel
} from '../components';
import QuickActionsBar from '../components/layout/QuickActionsBar';
import DateRangeFilter from '../components/email/filters/DateRangeFilter';
import useDashboardData from '../hooks/useDashboardData';

const HomePage = ({ connectionInfo, onDisconnect }) => {
    const { dashboardData, lastUpdated, loading, error, fetchData } = useDashboardData();
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    const emailTrends = dashboardData?.trends || null;
    const weeklyStats = dashboardData?.metrics || null;
    const statusSummary = dashboardData?.statusSummary || null;

    const handleRefresh = () => fetchData(startDate, endDate);

    const handleDateFilterApply = (start, end) => {
        setStartDate(start);
        setEndDate(end);
        fetchData(start, end);
    };

    // Generate date range label for display
    const getDateRangeLabel = () => {
        if (!startDate && !endDate) return "All time";
        if (startDate && endDate) {
            const daysDiff = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
            if (daysDiff <= 7) return "Last 7 days";
            if (daysDiff <= 30) return "Last 30 days";
            if (daysDiff <= 90) return "Last 90 days";
            return `${daysDiff} days`;
        }
        return "Custom range";
    };

    useEffect(() => {
        if (!dashboardData) fetchData();
    }, [dashboardData, fetchData]);

    return (
        <div className="flex flex-col min-h-screen bg-dark-800">
            <Header connectionInfo={connectionInfo} onDisconnect={onDisconnect} />

            <main className="flex-1 px-3 py-3 max-w-[1600px] mx-auto w-full">
                {/* Error Message */}
                {error && (
                    <div className="mb-3 px-3 py-2 bg-danger/10 border border-danger/30 rounded-lg text-danger-light text-sm">
                        {error}
                    </div>
                )}

                {/* Status Summary - TOP */}
                <section className="mb-3">
                    <StatusSummary />
                </section>

                {/* Quick Actions - SECOND */}
                <section className="mb-3">
                    <QuickActionsBar />
                </section>

                {/* Date Filter for Metrics */}
                <section className="mb-3">
                    <DateRangeFilter onApplyFilter={handleDateFilterApply} disabled={loading} />
                </section>

                {/* KPI Cards */}
                <section className="mb-3">
                    {weeklyStats ? (
                        <MetricsPanel
                            stats={{
                                totalRecords: formatNumber(weeklyStats.totalRecords) || 0,
                                processedCount: formatNumber(weeklyStats.processedCount) || 0,
                                weeklyChange: weeklyStats.weeklyChange || '0%',
                                deliveryRate: formatPercentage(weeklyStats.deliveryRate) || '0%',
                                bounceRate: formatPercentage(weeklyStats.bounceRate) || '0%',
                                processingTime: formatProcessingTime(weeklyStats.processingTime) || '0s'
                            }}
                            loading={loading}
                            dateRangeLabel={getDateRangeLabel()}
                        />
                    ) : (
                        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="bg-dark-600/60 rounded-xl p-3 border border-dark-300/40 animate-pulse">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 bg-dark-400 rounded-lg"></div>
                                        <div className="space-y-1.5">
                                            <div className="h-3 w-16 bg-dark-400 rounded"></div>
                                            <div className="h-5 w-12 bg-dark-400 rounded"></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Charts Section */}
                <section className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
                    {/* Delivery Breakdown */}
                    <div className="bg-dark-600/60 rounded-xl border border-dark-300/40 p-4">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-medium text-text-primary">Delivery Breakdown</h3>
                            <span className="text-xs text-text-muted">
                                {startDate && endDate
                                    ? `${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`
                                    : 'Last 7 days'}
                            </span>
                        </div>
                        <div className="h-56">
                            {loading ? (
                                <div className="h-full flex items-center justify-center">
                                    <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
                                </div>
                            ) : statusSummary ? (
                                <EmailChart
                                    type="pie"
                                    data={{
                                        labels: ['Delivered', 'Failed', 'Pending'],
                                        values: [
                                            statusSummary.success || 0,
                                            statusSummary.failed || 0,
                                            statusSummary.pending || 0
                                        ],
                                        colors: ['#10B981', '#EF4444', '#F59E0B']
                                    }}
                                />
                            ) : (
                                <div className="h-full flex items-center justify-center text-sm text-text-muted">
                                    No data available
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Trends Chart */}
                    <div className="bg-dark-600/60 rounded-xl border border-dark-300/40 p-4">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-medium text-text-primary">Email Trends</h3>
                            <span className="text-xs text-text-muted">
                                {startDate && endDate
                                    ? `${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`
                                    : 'Last 7 days'}
                            </span>
                        </div>
                        <div className="h-56">
                            {loading ? (
                                <div className="h-full flex items-center justify-center">
                                    <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
                                </div>
                            ) : emailTrends && emailTrends.dates?.length > 0 ? (
                                <EmailChart
                                    type="line"
                                    data={{
                                        labels: emailTrends.dates,
                                        datasets: [
                                            { label: 'Delivered', data: emailTrends.success, color: '#10B981' },
                                            { label: 'Failed', data: emailTrends.failed, color: '#EF4444' },
                                            { label: 'Pending', data: emailTrends.pending, color: '#F59E0B' }
                                        ]
                                    }}
                                />
                            ) : (
                                <div className="h-full flex items-center justify-center text-sm text-text-muted">
                                    No data available
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default HomePage;
