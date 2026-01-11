import React, { useState } from 'react';

/**
 * Date range filter component for dashboard
 * Allows selecting start and end dates for filtering dashboard data
 */
const DateRangeFilter = ({ onApplyFilter, disabled = false }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Define quick filter options
  const quickRanges = [
    { label: 'Last 7 days', value: 7 },
    { label: 'Last 15 days', value: 15 },
    { label: 'Last 30 days', value: 30 },
    { label: 'Last 90 days', value: 90 }
  ];

  const handleApply = () => {
    // Convert string dates to Date objects or null
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    // Call the parent handler with the selected date range
    onApplyFilter(start, end);
  };

  const handleClear = () => {
    setStartDate('');
    setEndDate('');
    onApplyFilter(null, null);
  };

  // Handle quick filter selection
  const handleQuickFilterChange = (e) => {
    const days = parseInt(e.target.value);
    if (!days) return; // Skip if no value selected

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    // Format dates for input fields (YYYY-MM-DD)
    setStartDate(startDate.toISOString().split('T')[0]);
    setEndDate(endDate.toISOString().split('T')[0]);

    // Call the parent handler with the selected date range
    onApplyFilter(startDate, endDate);
  };

  return (
    <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3 bg-dark-500/50 p-3 rounded-xl shadow-sm border border-dark-300/50 backdrop-blur-sm">
      <div className="text-sm font-medium text-text-secondary">Date Range:</div>
      <div className="flex items-center space-x-2">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="px-2 py-1.5 text-sm border border-dark-300/50 rounded-lg bg-dark-600/80 text-text-primary focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
          disabled={disabled}
        />
        <span className="text-text-muted">to</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="px-2 py-1.5 text-sm border border-dark-300/50 rounded-lg bg-dark-600/80 text-text-primary focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
          disabled={disabled}
        />
      </div>

      {/* Quick filter dropdown */}
      <select
        onChange={handleQuickFilterChange}
        className="px-2 py-1.5 text-sm border border-dark-300/50 rounded-lg bg-dark-600/80 text-text-primary focus:outline-none focus:ring-1 focus:ring-primary-500"
        disabled={disabled}
        defaultValue=""
      >
        <option value="" disabled>
          Select Quick Range
        </option>
        <option value="7">Last 7 Days</option>
        <option value="15">Last 15 Days</option>
        <option value="30">Last 30 Days</option>
        <option value="90">Last 90 Days</option>
      </select>

      <div className="flex space-x-2">
        <button
          onClick={handleApply}
          disabled={disabled}
          className="px-3 py-1.5 bg-primary-500/15 hover:bg-primary-500/25 text-primary-400 text-xs font-medium rounded-lg border border-primary-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-glow-sm"
        >
          Apply
        </button>
        <button
          onClick={handleClear}
          disabled={disabled}
          className="px-3 py-1.5 bg-dark-400/50 hover:bg-dark-300/50 text-text-secondary text-xs font-medium rounded-lg border border-dark-300/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Clear
        </button>
      </div>
    </div>
  );
};

export default DateRangeFilter;
