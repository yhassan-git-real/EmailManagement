import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import EmailComposer from '../components/EmailComposer';
import TemplateSelector from '../components/TemplateSelector';
import EmailSettingsModal from '../components/EmailSettingsModal';
import { EnvelopeIcon, PencilSquareIcon, DocumentTextIcon, Cog8ToothIcon } from '@heroicons/react/24/outline';
import { sendManualEmail, fetchEmailTemplates } from '../utils/apiClient';
import { toast } from 'react-toastify';

const ComposePage = ({ connectionInfo, onDisconnect }) => {
  const [showComposer, setShowComposer] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [showEmailSettings, setShowEmailSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailPreData, setEmailPreData] = useState({
    to: [],
    subject: '',
    templateId: 'default'
  });

  // Use ref to track if we should reload data to prevent infinite loops
  const shouldLoadRef = React.useRef(true);
  const loadingRef = React.useRef(false);
  const isInitialRender = React.useRef(true);

  // Handle email send action
  const handleSendEmail = async (emailData) => {
    setIsLoading(true);

    try {
      const response = await sendManualEmail(emailData);
      if (response.success) {
        toast.success('Email sent successfully');
        setShowComposer(false);
        // Reset email pre-data
        setEmailPreData({
          to: [],
          subject: '',
          templateId: 'default'
        });
      } else {
        toast.error(response.message || 'Failed to send email');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('Error sending email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle compose button click
  const handleComposeClick = () => {
    setShowComposer(true);
  };

  // Handle template button click
  const handleTemplateClick = () => {
    setShowTemplateSelector(true);
  };

  // Handle settings button click
  const handleSettingsClick = () => {
    setShowEmailSettings(true);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header connectionInfo={connectionInfo} onDisconnect={onDisconnect} />

      <div className="flex-grow bg-gray-50">
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-2 sm:px-0">
            {/* Main Section */}
            <div className="bg-white shadow-sm rounded-lg p-4 mb-6">
              <div className="mb-4 flex justify-between items-center">
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">Email Composer</h1>
                  <p className="text-sm text-gray-500">Compose and send emails manually</p>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={handleComposeClick}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    <PencilSquareIcon className="h-4 w-4 mr-1" />
                    Compose
                  </button>

                  <button
                    onClick={handleTemplateClick}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    <DocumentTextIcon className="h-4 w-4 mr-1" />
                    Templates
                  </button>

                  <button
                    onClick={handleSettingsClick}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    <Cog8ToothIcon className="h-4 w-4 mr-1" />
                    Settings
                  </button>
                </div>
              </div>

              <div className="flex-grow">
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-center">
                  <EnvelopeIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No emails in draft</h3>
                  <p className="text-sm text-gray-500 mb-4">Click the Compose button to create a new email</p>
                  <button
                    onClick={handleComposeClick}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    <PencilSquareIcon className="h-4 w-4 mr-2" />
                    Compose New Email
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Email Composer Modal */}
      {showComposer && (
        <EmailComposer
          onClose={() => setShowComposer(false)}
          onSend={handleSendEmail}
          isLoading={isLoading}
          preData={emailPreData}
        />
      )}

      {/* Template Selector Modal */}
      {showTemplateSelector && (
        <TemplateSelector
          onClose={() => setShowTemplateSelector(false)}
          onSelect={(templateId) => {
            setEmailPreData(prev => ({
              ...prev,
              templateId
            }));
            setShowTemplateSelector(false);
            setShowComposer(true);
          }}
        />
      )}

      {/* Email Settings Modal */}
      {showEmailSettings && (
        <EmailSettingsModal
          onClose={() => setShowEmailSettings(false)}
        />
      )}

      <Footer />
    </div>
  );
};

export default ComposePage;
