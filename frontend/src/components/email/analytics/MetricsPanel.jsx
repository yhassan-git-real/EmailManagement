import React from 'react';

const MetricCard = ({ title, value, description, icon, trend, colorClass }) => {
  const trendColor = trend ? (trend.startsWith('+') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600') : '';
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 transition-all duration-300 hover:shadow-md hover:-translate-y-1 group animate-fadeIn">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={`p-2.5 rounded-full ${colorClass} mr-1 group-hover:scale-110 transition-transform duration-300`}>
            {icon}
          </div>
          <div>
            <p className="text-xs text-gray-600 font-medium">{title}</p>
            <h3 className="text-lg font-bold text-gray-800 animate-number">{value}</h3>
            {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
          </div>
        </div>
        {trend && (
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
      </div>
    </div>
  );
};

const MetricsPanel = ({ stats }) => {
  return (
    <div className="col-span-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
      <div className="col-span-1">
        <MetricCard
          title="Total Emails"
          value={stats.totalSent}
          description="This week"
          trend={stats.weeklyChange}
          colorClass="bg-blue-100 text-blue-600"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
          }
        />
      </div>
      
      <div className="col-span-1">
        <MetricCard
          title="Delivery Rate"
          value={stats.deliveryRate}
          description="Successfully delivered"
          colorClass="bg-green-100 text-green-600"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          }
        />
      </div>
      
      <div className="col-span-1">
        <MetricCard
          title="Bounce Rate"
          value={stats.bounceRate}
          description="Failed deliveries"
          colorClass="bg-red-100 text-red-600"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          }
        />
      </div>
      
      <div className="col-span-1">
        <MetricCard
          title="Processing Time"
          value="1.2s"
          description="Avg. per email"
          colorClass="bg-purple-100 text-purple-600"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
          }
        />
      </div>
    </div>
  );
};

export default MetricsPanel;
