import React from 'react';
import { XMarkIcon, DocumentTextIcon, DocumentIcon, TableCellsIcon, ChartBarIcon, PhotoIcon } from '@heroicons/react/24/outline';

const FilePreviewer = ({ filePath, onClose }) => {
  if (!filePath) return null;
  
  // Get file extension
  const fileExtension = filePath.split('.').pop().toLowerCase();
  
  // Determine file type
  const getFileType = (ext) => {
    const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'];
    const documentTypes = ['pdf', 'doc', 'docx', 'txt', 'rtf'];
    const spreadsheetTypes = ['xlsx', 'xls', 'csv'];
    const presentationTypes = ['ppt', 'pptx'];
    
    if (imageTypes.includes(ext)) return 'image';
    if (documentTypes.includes(ext)) return 'document';
    if (spreadsheetTypes.includes(ext)) return 'spreadsheet';
    if (presentationTypes.includes(ext)) return 'presentation';
    return 'unknown';
  };
  
  const fileType = getFileType(fileExtension);
  const fileName = filePath.split('/').pop();
  
  // Get appropriate icon based on file type
  const getFileIcon = () => {
    switch (fileType) {
      case 'document':
        return <DocumentTextIcon className="h-12 w-12 text-blue-500" />;
      case 'spreadsheet':
        return <TableCellsIcon className="h-12 w-12 text-green-500" />;
      case 'presentation':
        return <ChartBarIcon className="h-12 w-12 text-orange-500" />;
      case 'image':
        return <PhotoIcon className="h-12 w-12 text-purple-500" />;
      default:
        return <DocumentIcon className="h-12 w-12 text-gray-500" />;
    }
  };
  
  return (
    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
        {/* Preview Header */}
        <div className="px-4 py-3 flex items-center justify-between border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 truncate max-w-lg">{fileName}</h3>
          <button
            type="button"
            className="text-gray-400 hover:text-gray-500"
            onClick={onClose}
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        
        {/* Preview Content */}
        <div className="p-6">
          {fileType === 'image' ? (
            // For images, show actual preview (in a real app, this would be the actual image URL)
            <div className="flex justify-center">
              <div className="bg-gray-100 p-4 rounded flex items-center justify-center">
                <div className="text-center">
                  {getFileIcon()}
                  <p className="mt-2 text-sm text-gray-500">Image preview not available in demo</p>
                </div>
              </div>
            </div>
          ) : (
            // For other file types, show a placeholder
            <div className="flex flex-col items-center justify-center py-8">
              {getFileIcon()}
              <p className="mt-2 text-sm text-gray-500">Preview not available for this file type</p>
              <p className="text-xs text-gray-400">{fileExtension.toUpperCase()} file</p>
            </div>
          )}
        </div>
        
        {/* Actions */}
        <div className="px-4 py-3 bg-gray-50 flex justify-end rounded-b-lg">
          <button
            type="button"
            className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilePreviewer;
