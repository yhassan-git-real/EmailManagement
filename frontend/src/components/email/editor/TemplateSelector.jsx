import React, { useState, useEffect } from 'react';
import { XMarkIcon, DocumentTextIcon, PencilIcon } from '@heroicons/react/24/outline';
import { fetchEmailTemplates } from '../../../utils/apiClient';
import TemplateEditor from './TemplateEditor';

const TemplateSelector = ({ onSelectTemplate, onClose, initialTemplateId = 'default', directSelect = false }) => {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState(initialTemplateId);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [templateToEdit, setTemplateToEdit] = useState(null);

  // Load templates on component mount
  useEffect(() => {
    const loadTemplates = async () => {
      setIsLoading(true);
      try {
        // Use the updated fetchEmailTemplates function from apiClient.js
        const response = await fetchEmailTemplates(true); // Only get active templates
        if (response.success) {
          setTemplates(response.data);
          // If no initialTemplateId is provided or it doesn't exist, select the first template
          if (!initialTemplateId || !response.data.find(t => t.id === initialTemplateId)) {
            setSelectedTemplateId(response.data[0]?.id || 'default');
          }
        }
      } catch (error) {
        console.error('Failed to load email templates:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTemplates();
  }, [initialTemplateId]);

  // Handle template selection
  const handleTemplateChange = (templateId) => {
    setSelectedTemplateId(templateId);
  };  // Handle template confirmation
  const handleConfirm = () => {
    const selectedTemplate = templates.find(t => t.id === selectedTemplateId);
    if (selectedTemplate && onSelectTemplate) {
      // Pass the complete template object, not just the ID
      onSelectTemplate(selectedTemplate);
    }
  };

  // Handle opening the template editor
  const handleEditTemplate = (template) => {
    setTemplateToEdit(template);
    setShowEditor(true);
  };

  // Handle saving template from editor
  const handleSaveTemplate = async (updatedTemplate) => {
    try {
      // Save the template to the server
      const { updateTemplate, getEmailTemplates } = await import('../../../utils/automationApi');

      // Save template
      await updateTemplate(updatedTemplate.id, {
        name: updatedTemplate.name,
        body: updatedTemplate.body
      });

      // Reload templates from the server
      const response = await getEmailTemplates();
      if (response.success) {
        setTemplates(response.data);
      }

      setShowEditor(false);

      // Select the edited template
      setSelectedTemplateId(updatedTemplate.id);

      // Show success toast using React-Toastify
      const { toast } = await import('react-toastify');
      toast.success(`Template "${updatedTemplate.name}" saved successfully`);
    } catch (error) {
      console.error('Failed to save template:', error);

      // Show error toast
      const { toast } = await import('react-toastify');
      toast.error('Failed to save template');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-dark-600 rounded-xl shadow-2xl max-w-md w-full border border-dark-300/50">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-dark-300/50 bg-dark-700/80 rounded-t-xl">
          <h2 className="text-lg font-medium text-text-primary font-display">Select Email Template</h2>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary transition-colors"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Template List */}
        <div className="p-4 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
            </div>
          ) : (
            <div className="space-y-2">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className={`w-full text-left p-3 rounded-lg flex items-start transition-all ${selectedTemplateId === template.id
                    ? 'bg-primary-500/20 border border-primary-500/50'
                    : 'bg-dark-500/50 border border-dark-300/50 hover:bg-dark-400/50'
                    }`}
                >
                  <div
                    className="flex-grow cursor-pointer"
                    onClick={() => {
                      handleTemplateChange(template.id);
                      // If directSelect is true, immediately select this template
                      if (directSelect) {
                        console.log(`Direct selecting template: ${template.id}`);
                        onSelectTemplate(template);
                        onClose(); // Close the selector after selection in direct mode
                      }
                    }}
                  >
                    <div className="flex items-center">
                      <DocumentTextIcon className={`h-5 w-5 mr-3 ${selectedTemplateId === template.id ? 'text-primary-400' : 'text-text-muted'
                        }`} />
                      <div>
                        <div className={`font-medium ${selectedTemplateId === template.id ? 'text-primary-300' : 'text-text-primary'
                          }`}>
                          {template.name}
                        </div>
                        {template.subject && (
                          <div className="text-xs text-text-muted mt-1">
                            Subject prefix: {template.subject}
                          </div>
                        )}
                        <div className="text-xs text-text-muted mt-1 line-clamp-2">
                          {template.body ? template.body.substring(0, 100) + '...' : 'No preview available'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Edit button */}
                  <button
                    onClick={() => handleEditTemplate(template)}
                    className="ml-2 p-1 text-text-muted hover:text-primary-400 rounded-full hover:bg-primary-500/20 flex-shrink-0 transition-all"
                    title="Edit template"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-dark-300/50 flex justify-end space-x-3 bg-dark-700/50 rounded-b-xl">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-dark-300/50 rounded-lg text-sm font-medium text-text-secondary bg-dark-500/50 hover:bg-dark-400/50 transition-all"
          >
            Cancel
          </button>
          {!directSelect && (
            <button
              onClick={handleConfirm}
              className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-primary-500 to-accent-violet hover:from-primary-600 hover:to-accent-violet/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-600 focus:ring-primary-500 transition-all"
              disabled={isLoading || !selectedTemplateId}
            >
              Use Selected Template
            </button>
          )}
          {directSelect && selectedTemplateId && (
            <div className="text-sm text-text-muted">
              Click on a template to select it
            </div>
          )}
        </div>
      </div>

      {/* Template Editor Modal */}
      {showEditor && (
        <TemplateEditor
          initialTemplate={templateToEdit}
          onSave={handleSaveTemplate}
          onClose={() => setShowEditor(false)}
        />
      )}
    </div>
  );
};

export default TemplateSelector;
