import React, { useState, useEffect } from 'react';
import { XMarkIcon, DocumentTextIcon, PencilIcon } from '@heroicons/react/24/outline';
import { getEmailTemplates } from '../utils/automationApi';
import TemplateEditor from './TemplateEditor';

const TemplateSelector = ({ onSelectTemplate, onClose, initialTemplateId = 'default' }) => {
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
        // Use real API instead of mock API
        const response = await getEmailTemplates();
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
      const { updateTemplate, getEmailTemplates } = await import('../utils/automationApi');
      
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-800">Select Email Template</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        
        {/* Template List */}
        <div className="p-4 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <div className="space-y-2">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className={`w-full text-left p-3 rounded-md flex items-start ${
                    selectedTemplateId === template.id 
                      ? 'bg-primary-50 border border-primary-300' 
                      : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex-grow cursor-pointer" onClick={() => handleTemplateChange(template.id)}>
                    <div className="flex items-center">
                      <DocumentTextIcon className={`h-5 w-5 mr-3 ${
                        selectedTemplateId === template.id ? 'text-primary-600' : 'text-gray-500'
                      }`} />
                      <div>
                        <div className={`font-medium ${
                          selectedTemplateId === template.id ? 'text-primary-700' : 'text-gray-700'
                        }`}>
                          {template.name}
                        </div>
                        {template.subject && (
                          <div className="text-xs text-gray-500 mt-1">
                            Subject prefix: {template.subject}
                          </div>
                        )}
                        <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {template.body ? template.body.substring(0, 100) + '...' : 'No preview available'}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Edit button */}
                  <button 
                    onClick={() => handleEditTemplate(template)}
                    className="ml-2 p-1 text-gray-500 hover:text-primary-600 rounded-full hover:bg-gray-100 flex-shrink-0"
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
        <div className="px-4 py-3 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            disabled={isLoading || !selectedTemplateId}
          >
            Use Selected Template
          </button>
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
