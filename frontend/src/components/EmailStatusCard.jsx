import React from 'react';

const EmailStatusCard = ({ title, count, color, icon, description }) => {
  // Determine styling based on color type
  const styles = {
    green: {
      bgColor: 'bg-gradient-to-br from-green-50 to-green-100',
      iconBg: 'bg-green-100',
      textColor: 'text-green-600',
      countColor: 'text-green-700',
      ringColor: 'ring-green-400',
      hoverBg: 'hover:bg-green-50',
      accentColor: 'bg-green-500',
      shadowColor: 'shadow-green',
      letterBg: 'bg-green-100',
      letterColor: 'text-green-600'
    },
    red: {
      bgColor: 'bg-gradient-to-br from-red-50 to-red-100',
      iconBg: 'bg-red-100',
      textColor: 'text-red-600',
      countColor: 'text-red-700',
      ringColor: 'ring-red-400',
      hoverBg: 'hover:bg-red-50',
      accentColor: 'bg-red-500',
      shadowColor: 'shadow-red',
      letterBg: 'bg-red-100',
      letterColor: 'text-red-600'
    },
    yellow: {
      bgColor: 'bg-gradient-to-br from-amber-50 to-amber-100',
      iconBg: 'bg-amber-100',
      textColor: 'text-amber-600',
      countColor: 'text-amber-700',
      ringColor: 'ring-amber-400',
      hoverBg: 'hover:bg-amber-50',
      accentColor: 'bg-amber-500',
      shadowColor: 'shadow-amber',
      letterBg: 'bg-amber-100',
      letterColor: 'text-amber-600'
    }
  };
  
  const colorType = 
    color.includes('green') ? 'green' : 
    color.includes('red') ? 'red' : 'yellow';
    
  const style = styles[colorType];
  return (
    <div className={`card-glass group relative rounded-xl ${style.shadowColor} hover:shadow-xl p-7 transition-all duration-300`}>
      {/* Accent line */}
      <div className={`absolute top-0 left-0 h-2 w-full ${style.accentColor} rounded-t-xl`}></div>
        <div className="flex flex-col h-full">
        <div className="flex items-center mb-6 space-x-3">
          {/* Status letter indicator with soft inner shadow */}
          <div className={`flex items-center justify-center h-12 w-12 rounded-xl ${style.letterBg} ${style.letterColor} shadow-inner`}>
            <span className="text-lg font-bold">
              {title.charAt(0).toUpperCase()}
            </span>
          </div>
          
          {/* Title */}
          <h3 className={`font-semibold text-lg ${style.textColor}`}>{title}</h3>
        </div>
          {/* Icon and count side by side */}
        <div className="flex justify-between items-center mb-8">
          <div className={`text-5xl font-bold ${style.countColor} animate-number tracking-tight`}>
            {count}
          </div>
          
          {/* Icon with background */}
          <div className={`p-3.5 rounded-xl ${style.iconBg} ${style.textColor} shadow-sm`}>
            {icon}
          </div>
        </div>
          {/* Description */}
        <div className="text-sm mt-auto text-gray-600 font-medium">
          {description}
        </div>
      </div>
      
      {/* Interactive hover effect */}
      <div className={`absolute bottom-0 left-0 w-full h-1.5 ${style.accentColor} rounded-b-xl transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`}></div>
    </div>
  );
};

export default EmailStatusCard;
