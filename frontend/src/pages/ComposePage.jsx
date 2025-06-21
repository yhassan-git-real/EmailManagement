import React, { useState } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import EmailComposer from '../components/EmailComposer';
import { EnvelopeIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import { mockSendEmail } from '../utils/mockApi';

const ComposePage = ({ connectionInfo, onDisconnect }) => {
  const [showComposer, setShowComposer] = useState(false);
    const handleSendEmail = async (emailData) => {
    try {
      // Show sending toast
      toast.info('Sending email...', { autoClose: 2000 });
      
      // Call mock API to simulate sending
      const response = await mockSendEmail(emailData);
      
      // Handle successful response
      console.log('Email sent successfully:', response);
      toast.success(`Email sent to ${emailData.to.length} recipient(s)`);
      
      // Close the composer
      setShowComposer(false);
      
      // Clear draft from localStorage if it exists
      localStorage.removeItem('emailDraft');
      
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error(error.message || 'Failed to send email. Please try again.');
    }
  };
    return (
    <div className="flex flex-col min-h-screen">
      <Header connectionInfo={connectionInfo} onDisconnect={onDisconnect} />
      <div className="flex flex-row flex-grow relative">
        <Sidebar />
        <main className="flex-grow py-3 px-1 bg-gradient-to-b from-gray-50 to-gray-100 w-full md:ml-14">
          <div className="w-full lg:px-1">            <h1 className="text-sm font-medium mb-2 text-primary-600 pl-1 flex items-center">
              <EnvelopeIcon className="h-3.5 w-3.5 mr-1" />
              Manual Email Compose
            </h1>
            <div className="bg-white rounded-lg shadow p-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                <div className="mb-3 sm:mb-0">
                  <h2 className="text-base font-medium text-gray-800">Create New Email</h2>
                  <p className="text-gray-600 max-w-md text-xs">
                    Compose and send emails with our modern email composer. 
                    Add recipients, attachments, and use the rich text editor for formatting.
                  </p>
                </div>
                <button
                  onClick={() => setShowComposer(true)}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <PencilSquareIcon className="mr-1 h-4 w-4" />
                  Compose New Email
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
      
      {showComposer && (
        <EmailComposer
          onClose={() => setShowComposer(false)}
          onSend={handleSendEmail}
        />
      )}
      
      <Footer />
    </div>
  );
};

export default ComposePage;
