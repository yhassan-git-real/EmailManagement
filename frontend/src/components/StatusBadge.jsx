import React from 'react';

const StatusBadge = ({ status }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'running':
        return { 
          bg: 'bg-green-100', 
          text: 'text-green-800', 
          icon: '✅',
          label: 'Running'
        };
      case 'stopped':
        return { 
          bg: 'bg-red-100', 
          text: 'text-red-800', 
          icon: '🔴',
          label: 'Stopped'
        };
      case 'idle':
        return { 
          bg: 'bg-gray-100', 
          text: 'text-gray-800', 
          icon: '🕒',
          label: 'Idle'
        };
      case 'restarting':
        return { 
          bg: 'bg-yellow-100', 
          text: 'text-yellow-800', 
          icon: '🔄',
          label: 'Restarting'
        };
      default:
        return { 
          bg: 'bg-blue-100', 
          text: 'text-blue-800', 
          icon: '❓',
          label: 'Unknown'
        };
    }
  };

  const { bg, text, icon, label } = getStatusConfig();

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium ${bg} ${text}`}>
      <span className="mr-1">{icon}</span>
      {label}
    </span>
  );
};

export default StatusBadge;
