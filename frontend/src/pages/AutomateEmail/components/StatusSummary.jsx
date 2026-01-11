import React from 'react';
import { CheckCircleIcon, XCircleIcon, ClockIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

/**
 * StatusSummary - Modern redesigned status cards
 * Features: Gradient borders, animated progress, glassmorphism, hover effects
 */
const StatusSummary = ({ summary }) => {
  const { successful = 0, failed = 0, pending = 0, total = 0 } = summary || {};

  const stats = [
    {
      label: 'Successful',
      value: successful,
      icon: CheckCircleIcon,
      color: {
        text: '#10b981',
        gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        border: 'linear-gradient(135deg, rgba(16, 185, 129, 0.4) 0%, rgba(5, 150, 105, 0.6) 100%)',
        bg: 'rgba(16, 185, 129, 0.08)',
        glow: 'rgba(16, 185, 129, 0.2)'
      },
      percentage: total > 0 ? (successful / total) * 100 : 0
    },
    {
      label: 'Failed',
      value: failed,
      icon: XCircleIcon,
      color: {
        text: '#ef4444',
        gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        border: 'linear-gradient(135deg, rgba(239, 68, 68, 0.4) 0%, rgba(220, 38, 38, 0.6) 100%)',
        bg: 'rgba(239, 68, 68, 0.08)',
        glow: 'rgba(239, 68, 68, 0.2)'
      },
      percentage: total > 0 ? (failed / total) * 100 : 0
    },
    {
      label: 'Pending',
      value: pending,
      icon: ClockIcon,
      color: {
        text: '#f59e0b',
        gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        border: 'linear-gradient(135deg, rgba(245, 158, 11, 0.4) 0%, rgba(217, 119, 6, 0.6) 100%)',
        bg: 'rgba(245, 158, 11, 0.08)',
        glow: 'rgba(245, 158, 11, 0.2)'
      },
      percentage: total > 0 ? (pending / total) * 100 : 0
    },
    {
      label: 'Total',
      value: total,
      icon: DocumentTextIcon,
      color: {
        text: '#6366f1',
        gradient: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
        border: 'linear-gradient(135deg, rgba(99, 102, 241, 0.4) 0%, rgba(79, 70, 229, 0.6) 100%)',
        bg: 'rgba(99, 102, 241, 0.08)',
        glow: 'rgba(99, 102, 241, 0.2)'
      },
      percentage: 100
    }
  ];

  return (
    <div className="mb-3">
      {/* Header - More compact */}
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-xs font-semibold text-white flex items-center gap-1.5">
          <div className="p-1 rounded" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}>
            <DocumentTextIcon className="h-3.5 w-3.5 text-white" />
          </div>
          Email Processing Status
        </h3>
        <div className="flex items-center gap-1.5">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
          <span className="text-[10px] text-slate-400">Live Stats</span>
        </div>
      </div>

      {/* Cards Grid - Compact */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="group relative rounded-lg p-3 transition-all duration-300 hover:scale-105 hover:-translate-y-1"
              style={{
                background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                boxShadow: `0 4px 12px ${stat.color.glow}, 0 2px 6px rgba(0, 0, 0, 0.3)`,
              }}>

              {/* Gradient Border */}
              <div className="absolute inset-0 rounded-lg p-[1px]" style={{
                background: stat.color.border,
                WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                WebkitMaskComposite: 'xor',
                maskComposite: 'exclude'
              }}></div>

              {/* Content */}
              <div className="relative">
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: stat.color.text }}>
                    {stat.label}
                  </span>
                  <div className="p-1.5 rounded-lg transition-transform duration-300 group-hover:scale-110"
                    style={{ background: stat.color.bg }}>
                    <Icon className="h-4 w-4" style={{ color: stat.color.text }} />
                  </div>
                </div>

                {/* Value */}
                <div className="mb-2">
                  <div className="text-2xl font-bold text-white mb-0.5 transition-all duration-300 group-hover:scale-105">
                    {stat.value}
                  </div>
                  <div className="text-[10px] font-medium" style={{ color: stat.color.text }}>
                    {stat.percentage.toFixed(1)}% of total
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="relative h-1.5 bg-slate-800/50 rounded-full overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${stat.percentage}%`,
                      background: stat.color.gradient,
                      boxShadow: `0 0 8px ${stat.color.glow}`
                    }}>
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"
                      style={{ backgroundSize: '200% 100%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StatusSummary;
