import React from 'react';
import { XMarkIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

const SelectionPreview = ({ selectedRows = [], onClose, onComposeWithSelected }) => {
  if (!selectedRows || selectedRows.length === 0) return null;
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 mb-4 relative">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium text-primary-600 flex items-center">
          <EnvelopeIcon className="h-3.5 w-3.5 mr-1" />
          Selected Email Data Preview
        </h3>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-gray-500"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      </div>
        <div className="space-y-2 text-xs text-gray-600">
        <div>
          <span className="font-medium">Selected rows:</span> {selectedRows.length}
        </div>
        
        <div className="mt-3">          <button
            onClick={onComposeWithSelected}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            <EnvelopeIcon className="mr-1 h-4 w-4" />
            Compose With Selected
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectionPreview;
