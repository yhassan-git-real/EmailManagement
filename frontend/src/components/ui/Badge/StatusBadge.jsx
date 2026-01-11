import React from 'react';
import {
  PlayCircleIcon,
  StopCircleIcon,
  PauseCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/solid';

/**
 * StatusBadge - Displays automation status with improved icons
 */
const StatusBadge = ({ status }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'running':
        return {
          bg: 'bg-emerald-500/20',
          border: 'border-emerald-400/40',
          text: 'text-emerald-400',
          Icon: PlayCircleIcon,
          label: 'Running'
        };
      case 'stopped':
        return {
          bg: 'bg-red-500/20',
          border: 'border-red-400/40',
          text: 'text-red-400',
          Icon: StopCircleIcon,
          label: 'Stopped'
        };
      case 'idle':
        return {
          bg: 'bg-slate-500/20',
          border: 'border-slate-400/40',
          text: 'text-slate-300',
          Icon: PauseCircleIcon,
          label: 'Idle'
        };
      case 'restarting':
        return {
          bg: 'bg-amber-500/20',
          border: 'border-amber-400/40',
          text: 'text-amber-400',
          Icon: ArrowPathIcon,
          label: 'Restarting'
        };
      default:
        return {
          bg: 'bg-blue-500/20',
          border: 'border-blue-400/40',
          text: 'text-blue-400',
          Icon: PauseCircleIcon,
          label: 'Unknown'
        };
    }
  };

  const { bg, border, text, Icon, label } = getStatusConfig();

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${bg} ${text} border ${border} transition-all duration-200`}>
      <Icon className={`w-4 h-4 mr-1.5 ${status === 'restarting' ? 'animate-spin' : ''}`} />
      {label}
    </span>
  );
};

export default StatusBadge;
