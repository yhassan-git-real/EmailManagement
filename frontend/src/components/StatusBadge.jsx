import React from 'react';

const StatusBadge = ({ status }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'running':
        return { 
          bg: 'bg-green-100', 
          border: 'border-green-300',
          text: 'text-green-800', 
          shadow: 'shadow-green-100',
          icon: '✅',
          label: 'Running'
        };
      case 'stopped':
        return { 
          bg: 'bg-red-100', 
          border: 'border-red-300',
          text: 'text-red-800', 
          shadow: 'shadow-red-100',
          icon: '🔴',
          label: 'Stopped'
        };
      case 'idle':
        return { 
          bg: 'bg-gray-100', 
          border: 'border-gray-300',
          text: 'text-gray-800', 
          shadow: 'shadow-gray-100',
          icon: '🕒',
          label: 'Idle'
        };
      case 'restarting':
        return { 
          bg: 'bg-yellow-100', 
          border: 'border-yellow-300',
          text: 'text-yellow-800', 
          shadow: 'shadow-yellow-100',
          icon: '🔄',
          label: 'Restarting'
        };
      default:
        return { 
          bg: 'bg-blue-100', 
          border: 'border-blue-300',
          text: 'text-blue-800', 
          shadow: 'shadow-blue-100',
          icon: '❓',
          label: 'Unknown'
        };
    }
  };

  const { bg, border, text, shadow, icon, label } = getStatusConfig();

  return (
    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold ${bg} ${text} border ${border} ${shadow} transition-all duration-200 hover:shadow-md transform hover:-translate-y-0.5`}>
      <span className="mr-2 text-base">{icon}</span>
      {label}
    </span>
  );
};

export default StatusBadge;
