import React from 'react';

/**
 * LogBadge component for displaying log level indicators
 * Supports Info, Warning, Error, and Success log types
 */
const LogBadge = ({ level, className = '' }) => {
  const getBadgeConfig = () => {
    switch (level?.toLowerCase()) {
      case 'info':
        return {
          bg: 'bg-blue-100',
          text: 'text-blue-800',
          border: 'border-blue-200',
          icon: '📘',
          label: 'Info'
        };
      case 'warning':
      case 'warn':
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-800',
          border: 'border-yellow-200',
          icon: '⚠️',
          label: 'Warning'
        };
      case 'error':
        return {
          bg: 'bg-red-100',
          text: 'text-red-800',
          border: 'border-red-200',
          icon: '❌',
          label: 'Error'
        };
      case 'success':
        return {
          bg: 'bg-green-100',
          text: 'text-green-800',
          border: 'border-green-200',
          icon: '✅',
          label: 'Success'
        };
      case 'debug':
        return {
          bg: 'bg-purple-100',
          text: 'text-purple-800',
          border: 'border-purple-200',
          icon: '🔍',
          label: 'Debug'
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-800',
          border: 'border-gray-200',
          icon: '📄',
          label: level || 'Unknown'
        };
    }
  };

  const { bg, text, border, icon, label } = getBadgeConfig();

  return (
    <span 
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${bg} ${text} border ${border} ${className}`}
      title={`Log Level: ${label}`}
    >
      <span className="mr-1.5 text-sm">{icon}</span>
      {label}
    </span>
  );
};

export default LogBadge;
