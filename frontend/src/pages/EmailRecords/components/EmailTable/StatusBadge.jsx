import React from 'react';
import PropTypes from 'prop-types';

/**
 * Email-specific status badge component with appropriate styling for email statuses
 */
const StatusBadge = ({ status }) => {
  let statusColor;
  
  switch (status) {
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
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
      {status}
    </span>
  );
};

StatusBadge.propTypes = {
  status: PropTypes.string.isRequired,
};

export default StatusBadge;
