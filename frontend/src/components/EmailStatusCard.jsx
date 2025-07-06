import React from 'react';

const EmailStatusCard = ({ title, count, color, icon, description }) => {
  // Determine styling based on color type
  const styles = {
    green: {
      bgColor: 'bg-white',
      iconBg: 'bg-green-50',
      textColor: 'text-green-600',
      countColor: 'text-green-700',
      borderColor: 'border-green-500',
      hoverBorderColor: 'hover:border-green-400',
      hoverBg: 'hover:bg-green-50',
      badgeBg: 'bg-green-500',
      badgeText: 'text-white',
      letterBg: 'bg-green-100',
      letterColor: 'text-green-700'
    },
    red: {
      bgColor: 'bg-white',
      iconBg: 'bg-red-50',
      textColor: 'text-red-600',
      countColor: 'text-red-700',
      borderColor: 'border-red-500',
      hoverBorderColor: 'hover:border-red-400',
      hoverBg: 'hover:bg-red-50',
      badgeBg: 'bg-red-500',
      badgeText: 'text-white',
      letterBg: 'bg-red-100',
      letterColor: 'text-red-700'
    },
    yellow: {
      bgColor: 'bg-white',
      iconBg: 'bg-amber-50',
      textColor: 'text-amber-600',
      countColor: 'text-amber-700',
      borderColor: 'border-amber-500',
      hoverBorderColor: 'hover:border-amber-400',
      hoverBg: 'hover:bg-amber-50',
      badgeBg: 'bg-amber-500',
      badgeText: 'text-white',
      letterBg: 'bg-amber-100',
      letterColor: 'text-amber-700'
    }
  };
  
  const colorType = 
    color.includes('green') ? 'green' : 
    color.includes('red') ? 'red' : 'yellow';
    
  const style = styles[colorType];
  return (
    <div className={`bg-white group rounded-lg border shadow-sm ${style.borderColor} hover:shadow-md p-4 transition-all duration-200`}>
      {/* Card header with status indicator */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          {/* Status letter indicator */}
          <div className={`flex items-center justify-center h-7 w-7 rounded-md ${style.letterBg} ${style.letterColor}`}>
            <span className="text-xs font-semibold">
              {title.charAt(0).toUpperCase()}
            </span>
          </div>
          
          {/* Title */}
          <h3 className={`ml-2 font-medium text-sm ${style.textColor}`}>{title}</h3>
        </div>
        
        {/* Icon with background */}
        <div className={`p-1.5 rounded-md ${style.iconBg} ${style.textColor}`}>
          {icon}
        </div>
      </div>
      
      {/* Count and description */}
      <div className="mt-1">
        <div className={`text-3xl font-bold ${style.countColor} animate-number tracking-tight mb-1`}>
          {count}
        </div>
        
        {/* Description */}
        <div className="text-xs text-gray-500">
          {description}
        </div>
      </div>
      
      {/* Interactive hover effect - subtle bottom border transition */}
      <div className="h-0.5 w-0 group-hover:w-full bg-gray-200 mt-3 transition-all duration-300"></div>
    </div>
  );
};

export default EmailStatusCard;
