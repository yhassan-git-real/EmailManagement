import React from 'react';
import PropTypes from 'prop-types';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

/**
 * Email-specific action buttons component for edit and delete operations
 */
const EmailActionButtons = ({ record, onEdit, onDelete }) => {
  return (
    <div className="flex space-x-2 justify-end">
      {/* Edit button */}
      <button
        onClick={(e) => {
          e.stopPropagation(); // Prevent row selection when clicking edit
          onEdit && onEdit(record);
        }}
        title="Edit"
        className="p-1.5 rounded-md border shadow-sm transition-colors bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700"
      >
        <span className="sr-only">Edit</span>
        <PencilIcon className="h-4 w-4 text-blue-600" />
      </button>
      
      {/* Delete button */}
      <button
        onClick={(e) => {
          e.stopPropagation(); // Prevent row selection when clicking delete
          onDelete && onDelete(record.id);
        }}
        title="Delete"
        className="p-1.5 rounded-md border shadow-sm transition-colors bg-red-50 hover:bg-red-100 border-red-200 text-red-700"
      >
        <span className="sr-only">Delete</span>
        <TrashIcon className="h-4 w-4 text-red-600" />
      </button>
    </div>
  );
};

EmailActionButtons.propTypes = {
  record: PropTypes.object.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default EmailActionButtons;
