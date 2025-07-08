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
          statusColor = 'bg-green-100 text-green-800';
          break;
        case 'Failed':
          statusColor = 'bg-red-100 text-red-800';
          break;
        case 'Pending':
          statusColor = 'bg-yellow-100 text-yellow-800';
          break;
        case 'Draft':
          statusColor = 'bg-gray-100 text-gray-800';
          break;
        default:
          statusColor = 'bg-blue-100 text-blue-800';
      }
      return (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColor}`}>
          {value}
        </span>
      );

    case 'file':
      if (!value || value === '-') return '-';
      const fileName = value.split('/').pop();
      return (
        <button
          className="text-primary-600 hover:text-primary-700 text-xs underline truncate max-w-[150px] inline-block"
          onClick={(e) => {
            e.stopPropagation(); // Prevent row selection
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
        <div className="flex space-x-2 justify-end">
          {value.map((action, i) => (
            <button
              key={i}
              onClick={(e) => {
                e.stopPropagation(); // Prevent row selection
                action.onClick && action.onClick(e);
              }}
              title={action.label}
              className={`p-1.5 rounded-md border shadow-sm transition-colors ${action.className || 'bg-gray-100 hover:bg-gray-200 border-gray-200'}`}
            >
              <span className="sr-only">{action.label}</span>
              {action.icon}
            </button>
          ))}
        </div>
      );

    default:
      return value || '-';
  }
};
