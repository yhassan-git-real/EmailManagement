import React from 'react';

const EmailStatusCard = ({ title, count, color, icon, description }) => {
  // Determine styling based on color type
  const styles = {
    green: {
      bgColor: 'bg-dark-500/50',
      iconBg: 'bg-success/20',
      textColor: 'text-success',
      countColor: 'text-success-light',
      borderColor: 'border-success/40',
      hoverBorderColor: 'hover:border-success/60',
      letterBg: 'bg-success/20',
      letterColor: 'text-success'
    },
    red: {
      bgColor: 'bg-dark-500/50',
      iconBg: 'bg-danger/20',
      textColor: 'text-danger',
      countColor: 'text-danger-light',
      borderColor: 'border-danger/40',
      hoverBorderColor: 'hover:border-danger/60',
      letterBg: 'bg-danger/20',
      letterColor: 'text-danger'
    },
    yellow: {
      bgColor: 'bg-dark-500/50',
      iconBg: 'bg-warning/20',
      textColor: 'text-warning',
      countColor: 'text-warning-light',
      borderColor: 'border-warning/40',
      hoverBorderColor: 'hover:border-warning/60',
      letterBg: 'bg-warning/20',
      letterColor: 'text-warning'
    }
  };

  const colorType =
    color.includes('green') || color.includes('success') ? 'green' :
      color.includes('red') || color.includes('danger') ? 'red' : 'yellow';

  const style = styles[colorType];
  return (
    <div className={`${style.bgColor} group rounded-xl border shadow-sm ${style.borderColor} ${style.hoverBorderColor} hover:shadow-glow-sm p-4 transition-all duration-300 backdrop-blur-sm`}>
      {/* Card header with status indicator */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          {/* Status letter indicator */}
          <div className={`flex items-center justify-center h-7 w-7 rounded-lg ${style.letterBg} ${style.letterColor}`}>
            <span className="text-xs font-semibold">
              {title.charAt(0).toUpperCase()}
            </span>
          </div>

          {/* Title */}
          <h3 className={`ml-2 font-medium text-sm ${style.textColor}`}>{title}</h3>
        </div>

        {/* Icon with background */}
        <div className={`p-1.5 rounded-lg ${style.iconBg} ${style.textColor}`}>
          {icon}
        </div>
      </div>

      {/* Count and description */}
      <div className="mt-1">
        <div className={`text-3xl font-bold ${style.countColor} animate-number tracking-tight mb-1`}>
          {count}
        </div>

        {/* Description */}
        <div className="text-xs text-text-muted">
          {description}
        </div>
      </div>

      {/* Interactive hover effect - subtle bottom border transition */}
      <div className={`h-0.5 w-0 group-hover:w-full ${style.letterBg} mt-3 transition-all duration-300 rounded-full`}></div>
    </div>
  );
};

export default EmailStatusCard;
