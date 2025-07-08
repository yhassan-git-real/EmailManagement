import React from 'react';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

/**
 * Email-specific table column configuration
 * @returns {Array} Array of column configuration objects
 */
export const getEmailColumns = () => [
  { key: 'company_name', label: 'Company', width: 'w-40' },
  { key: 'email', label: 'Email', width: 'w-48', editable: true },
  { key: 'subject', label: 'Subject', width: 'w-64', editable: true },
  { key: 'file_path', label: 'File', type: 'file', width: 'w-40', editable: true },
  { key: 'email_send_date', label: 'Send Date', type: 'datetime', width: 'w-40' },
  {
    key: 'email_status', 
    label: 'Status', 
    type: 'status', 
    width: 'w-28',
    filterOptions: ['Success', 'Failed', 'Pending']
  },
  { key: 'date', label: 'Created', type: 'date', width: 'w-32' },
  { key: 'reason', label: 'Reason', width: 'w-48' },
  { key: 'actions', label: 'Actions', type: 'actions', width: 'w-24' }
];

/**
 * Process email records to add action buttons
 * @param {Array} records - Raw email records
 * @param {Function} onEditRecord - Edit handler
 * @param {Function} onDeleteRecord - Delete handler
 * @returns {Array} Processed records with action buttons
 */
export const processEmailRecords = (records, onEditRecord, onDeleteRecord) => {
  if (!Array.isArray(records)) return [];
  
  return records.map(record => ({
    ...record,
    actions: [
      {
        icon: <PencilIcon className="h-4 w-4 text-blue-600" />,
        label: 'Edit',
        onClick: (e) => {
          e.stopPropagation(); // Prevent row selection when clicking edit
          onEditRecord(record);
        },
        className: 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700'
      },
      {
        icon: <TrashIcon className="h-4 w-4 text-red-600" />,
        label: 'Delete',
        onClick: (e) => {
          e.stopPropagation(); // Prevent row selection when clicking delete
          onDeleteRecord(record.id);
        },
        className: 'bg-red-50 hover:bg-red-100 border-red-200 text-red-700'
      }
    ]
  }));
};
