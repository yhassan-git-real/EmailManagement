import React from 'react';

/**
 * Format cell content based on column type
 * @param {any} value - Cell value
 * @param {string} type - Cell type (date, datetime, status, file, actions)
 * @param {Object} options - Additional options
 * @param {Function} options.onFileClick - File click handler for file type
 * @returns {React.ReactNode} - Formatted content
 */
export const formatCellContent = (value, type, options = {}) => {
  if (value === null || value === undefined) return '-';

  switch (type) {
    case 'date':
      return value ? new Date(value).toLocaleDateString() : '-';

    case 'datetime':
      return value ? new Date(value).toLocaleString() : '-';

    case 'status':
      let statusColor;
      switch (value) {
        case 'Success':
          statusColor = 'bg-emerald-500/15 text-emerald-400';
          break;
        case 'Failed':
          statusColor = 'bg-red-500/15 text-red-400';
          break;
        case 'Pending':
          statusColor = 'bg-amber-500/15 text-amber-400';
          break;
        case 'Draft':
          statusColor = 'bg-slate-500/15 text-slate-400';
          break;
        default:
          statusColor = 'bg-blue-500/15 text-blue-400';
      }
      return (
        <span className={`px-1.5 py-0.5 text-[11px] font-medium rounded ${statusColor}`}>
          {value}
        </span>
      );

    case 'file':
      if (!value || value === '-') return '-';
      const fileName = value.split('/').pop();
      return (
        <button
          className="text-primary-400 hover:text-primary-300 text-xs underline truncate max-w-[120px] inline-block"
          onClick={(e) => {
            e.stopPropagation();
            options.onFileClick && options.onFileClick(value);
          }}
          title={value}
        >
          {fileName}
        </button>
      );

    case 'actions':
      if (!value || !Array.isArray(value) || value.length === 0) return null;
      return (
        <div className="flex space-x-1 justify-end">
          {value.map((action, i) => (
            <button
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                action.onClick && action.onClick(e);
              }}
              title={action.label}
              className="p-1 rounded hover:bg-dark-500/60 text-text-muted hover:text-text-secondary transition-colors"
            >
              <span className="sr-only">{action.label}</span>
              {React.cloneElement(action.icon, { className: 'h-3.5 w-3.5' })}
            </button>
          ))}
        </div>
      );

    default:
      return value || '-';
  }
};
