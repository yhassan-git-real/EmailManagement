import React, { useState } from 'react';
import CustomRichTextEditor from './CustomRichTextEditor';
import { XMarkIcon, DocumentCheckIcon } from '@heroicons/react/24/outline';

const TemplateEditor = ({ initialTemplate, onSave, onClose }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [editorContent, setEditorContent] = useState(initialTemplate?.body || '<p>Start editing your template here...</p>');
  const [templateName, setTemplateName] = useState(initialTemplate?.name || 'Custom Template');

  const handleSave = () => {
    setIsSaving(true);
    
    onSave({
      name: templateName,
      body: editorContent,
      id: initialTemplate?.id || 'custom'
    });
  };
  
  // No modules needed for custom editor

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full h-4/5 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-800">Email Template Editor</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        
        {/* Editor */}
        <div className="p-4 flex-grow flex flex-col overflow-hidden">
          <div className="mb-4">
            <label htmlFor="templateName" className="block text-sm font-medium text-gray-700 mb-1">
              Template Name
            </label>
            <input
              type="text"
              id="templateName"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            />
          </div>
          
          <div className="flex-grow overflow-hidden p-1">
            <CustomRichTextEditor
              initialValue={editorContent}
              onChange={setEditorContent}
            />
          </div>
        </div>
        
        {/* Footer with save button */}
        <div className="px-4 py-3 border-t border-gray-200 flex justify-end flex-shrink-0">
          <button
            onClick={onClose}
            className="mr-3 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 flex items-center"
          >
            {isSaving ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              <>
                <DocumentCheckIcon className="h-4 w-4 mr-1" /> Save Template
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TemplateEditor;
