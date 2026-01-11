import React from 'react';
import { ClockIcon, EnvelopeIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const MetricCard = ({ title, value, description, icon, trend, colorClass, loading = false }) => {
  const trendColor = trend ? (trend.startsWith('+') ? 'bg-success/20 text-success-light' : 'bg-danger/20 text-danger-light') : '';

  return (
    <div className="card rounded-xl p-5 transition-all duration-300 hover:shadow-glow-sm hover:-translate-y-1 group animate-fadeIn">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={`p-2.5 rounded-xl ${colorClass} mr-1 group-hover:scale-110 transition-transform duration-300`}>
            {icon}
          </div>
          <div>
            <p className="text-xs text-text-muted font-medium">{title}</p>
            {loading ? (
              <div className="h-6 w-16 bg-dark-400 animate-pulse rounded mt-1"></div>
            ) : (
              <h3 className="text-lg font-bold text-text-primary animate-number">{value}</h3>
            )}
            {description && <p className="text-xs text-text-muted mt-0.5">{description}</p>}
          </div>
        </div>
        {trend && !loading && (
          <div className={`text-xs font-medium px-2 py-1 rounded-full ${trendColor} flex items-center`}>
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
          <div className="h-6 w-12 bg-dark-400 animate-pulse rounded-full"></div>
        )}
      </div>
    </div>
  );
};

const MetricsPanel = ({
  // Support both individual props and stats object
  stats = null,
  title,
  value,
  change,
  icon,
  positive,
  loading = false
}) => {
  // If individual props are provided, use them
  if (title) {
    let colorClass = "bg-primary-500/20 text-primary-400";
    if (positive === true) colorClass = "bg-success/20 text-success";
    if (positive === false) colorClass = "bg-danger/20 text-danger";

    return (
      <MetricCard
        title={title}
        value={value}
        description={title === "Total Emails" ? "This week" : null}
        trend={change}
        colorClass={colorClass}
        icon={icon}
        loading={loading}
      />
    );
  }

  // If stats object is provided, render all metrics
  return (
    <div className="col-span-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
      <div className="col-span-1">
        <MetricCard
          title="Total Emails"
          value={stats.totalSent}
          description="This week"
          trend={stats.weeklyChange}
          colorClass="bg-primary-500/20 text-primary-400"
          icon={<EnvelopeIcon className="h-5 w-5" />}
          loading={loading}
        />
      </div>

      <div className="col-span-1">
        <MetricCard
          title="Delivery Rate"
          value={stats.deliveryRate}
          description="Successfully delivered"
          colorClass="bg-success/20 text-success"
          icon={<CheckCircleIcon className="h-5 w-5" />}
          loading={loading}
        />
      </div>

      <div className="col-span-1">
        <MetricCard
          title="Bounce Rate"
          value={stats.bounceRate}
          description="Failed deliveries"
          colorClass="bg-danger/20 text-danger"
          icon={<ExclamationTriangleIcon className="h-5 w-5" />}
          loading={loading}
        />
      </div>

      <div className="col-span-1">
        <MetricCard
          title="Processing Time"
          value={stats.processingTime || "1.2s"}
          description="Avg. per email"
          colorClass="bg-accent-violet/20 text-accent-violet"
          icon={<ClockIcon className="h-5 w-5" />}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default MetricsPanel;
