import React from 'react';
import { ClockIcon, EnvelopeIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const MetricCard = ({ title, value, description, icon, trend, colorClass, loading = false }) => {
  const trendColor = trend
    ? (trend.startsWith('+') ? 'bg-success/20 text-success-light' : 'bg-danger/20 text-danger-light')
    : '';

  return (
    <div className="bg-dark-600/60 rounded-xl p-3 border border-dark-300/40 transition-all duration-200 hover:border-dark-300/60 hover:bg-dark-600/80">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`p-1.5 rounded-lg ${colorClass}`}>
            {icon}
          </div>
          <div>
            <p className="text-xs text-text-muted font-medium">{title}</p>
            {loading ? (
              <div className="h-5 w-14 bg-dark-400 animate-pulse rounded mt-0.5"></div>
            ) : (
              <h3 className="text-lg font-bold text-text-primary leading-tight">{value}</h3>
            )}
          </div>
        </div>
        {trend && !loading && (
          <div className={`text-xs font-medium px-1.5 py-0.5 rounded-md ${trendColor} flex items-center`}>
            {trend.startsWith('+') ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1v-5a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586l-4.293-4.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 12H12z" clipRule="evenodd" />
              </svg>
            )}
            {trend}
          </div>
        )}
        {loading && trend && (
          <div className="h-5 w-10 bg-dark-400 animate-pulse rounded-md"></div>
        )}
      </div>
      {description && <p className="text-xs text-text-muted mt-1 ml-8">{description}</p>}
    </div>
  );
};

const MetricsPanel = ({
  stats = null,
  title,
  value,
  change,
  icon,
  positive,
  loading = false,
  dateRangeLabel = "All time"
}) => {
  // Single card mode
  if (title) {
    let colorClass = "bg-primary-500/20 text-primary-400";
    if (positive === true) colorClass = "bg-success/20 text-success";
    if (positive === false) colorClass = "bg-danger/20 text-danger";

    return (
      <MetricCard
        title={title}
        value={value}
        trend={change}
        colorClass={colorClass}
        icon={icon}
        loading={loading}
      />
    );
  }

  // Grid mode with stats object
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
      <MetricCard
        title="Email Records"
        value={stats.totalRecords}
        description={dateRangeLabel}
        trend={stats.weeklyChange}
        colorClass="bg-primary-500/15 text-primary-400"
        icon={<EnvelopeIcon className="h-4 w-4" />}
        loading={loading}
      />

      <MetricCard
        title="Processed"
        value={stats.processedCount}
        description="From logs"
        colorClass="bg-accent-cyan/15 text-accent-cyan"
        icon={<CheckCircleIcon className="h-4 w-4" />}
        loading={loading}
      />

      <MetricCard
        title="Delivery Rate"
        value={stats.deliveryRate}
        colorClass="bg-success/15 text-success"
        icon={<CheckCircleIcon className="h-4 w-4" />}
        loading={loading}
      />

      <MetricCard
        title="Bounce Rate"
        value={stats.bounceRate}
        colorClass="bg-danger/15 text-danger"
        icon={<ExclamationTriangleIcon className="h-4 w-4" />}
        loading={loading}
      />

      <MetricCard
        title="Avg. Time"
        value={stats.processingTime || "0s"}
        colorClass="bg-accent-violet/15 text-accent-violet"
        icon={<ClockIcon className="h-4 w-4" />}
        loading={loading}
      />
    </div>
  );
};

export default MetricsPanel;
