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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-dark-600 rounded-xl shadow-2xl max-w-4xl w-full h-4/5 flex flex-col overflow-hidden border border-dark-300/50">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-dark-300/50 bg-dark-700/80 rounded-t-xl">
          <h2 className="text-lg font-medium text-text-primary font-display">Email Template Editor</h2>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary transition-colors"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Editor */}
        <div className="p-4 flex-grow flex flex-col overflow-hidden">
          <div className="mb-4">
            <label htmlFor="templateName" className="block text-sm font-medium text-text-secondary mb-1">
              Template Name
            </label>
            <input
              type="text"
              id="templateName"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className="block w-full px-3 py-2 border border-dark-300/50 rounded-lg shadow-sm bg-dark-500/50 text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            />
          </div>

          <div className="flex-grow overflow-hidden p-1 bg-dark-500/30 rounded-lg border border-dark-300/30">
            <CustomRichTextEditor
              initialValue={editorContent}
              onChange={setEditorContent}
            />
          </div>
        </div>

        {/* Footer with save button */}
        <div className="px-4 py-3 border-t border-dark-300/50 flex justify-end flex-shrink-0 bg-dark-700/50 rounded-b-xl">
          <button
            onClick={onClose}
            className="mr-3 px-4 py-2 border border-dark-300/50 rounded-lg text-sm font-medium text-text-secondary bg-dark-500/50 hover:bg-dark-400/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-600 focus:ring-primary-500 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-primary-500 to-accent-violet hover:from-primary-600 hover:to-accent-violet/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-600 focus:ring-primary-500 flex items-center transition-all"
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
