import React, { useState, useRef, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './EmailComposer.css';
import Draggable from 'react-draggable';
import { XMarkIcon, PaperClipIcon, PaperAirplaneIcon, ArchiveBoxIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

const EmailComposer = ({ onClose, onSend }) => {  const [to, setTo] = useState([]);
  const [cc, setCc] = useState([]);
  const [bcc, setBcc] = useState([]);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [files, setFiles] = useState([]);
  const [toInput, setToInput] = useState('');
  const [ccInput, setCcInput] = useState('');
  const [bccInput, setBccInput] = useState('');
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [draftTimer, setDraftTimer] = useState(null);

  const toInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const dragNodeRef = useRef(null);

  // Validate email format
  const isValidEmail = (email) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };
  // Handle adding email chips
  const handleAddEmail = (type, value) => {
    if (!value.trim()) return;
    
    const emails = value.split(/[,;\s]+/).filter(email => email);
    
    const validEmails = emails.filter(email => isValidEmail(email));
    const invalidEmails = emails.filter(email => !isValidEmail(email));
    
    if (invalidEmails.length > 0) {
      toast.error(`Invalid email format: ${invalidEmails.join(', ')}`);
    }
    
    if (validEmails.length > 0) {
      if (type === 'to') {
        setTo(prev => [...prev, ...validEmails]);
        setToInput('');
      } else if (type === 'cc') {
        setCc(prev => [...prev, ...validEmails]);
        setCcInput('');
      } else if (type === 'bcc') {
        setBcc(prev => [...prev, ...validEmails]);
        setBccInput('');
      }
    }
  };

  // Handle removing email chips
  const handleRemoveEmail = (type, index) => {
    if (type === 'to') {
      setTo(prev => prev.filter((_, i) => i !== index));
    } else if (type === 'cc') {
      setCc(prev => prev.filter((_, i) => i !== index));
    } else if (type === 'bcc') {
      setBcc(prev => prev.filter((_, i) => i !== index));
    }
  };
  // Handle keydown for email input
  const handleKeyDown = (e, type) => {
    const inputValue = type === 'to' ? toInput : type === 'cc' ? ccInput : bccInput;
    
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddEmail(type, inputValue);
    } else if (e.key === 'Backspace' && inputValue === '') {
      e.preventDefault();
      // Remove the last email when backspace is pressed on empty input
      if (type === 'to' && to.length > 0) {
        setTo(prev => prev.slice(0, -1));
      } else if (type === 'cc' && cc.length > 0) {
        setCc(prev => prev.slice(0, -1));
      } else if (type === 'bcc' && bcc.length > 0) {
        setBcc(prev => prev.slice(0, -1));
      }
    }
  };

  // Handle file upload
  const handleFileUpload = (e) => {
    const uploadedFiles = Array.from(e.target.files);
    setFiles(prev => [...prev, ...uploadedFiles]);
  };

  // Remove file from attachments
  const handleRemoveFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Handle sending email
  const handleSend = () => {
    if (to.length === 0) {
      toast.error('Please add at least one recipient');
      return;
    }

    const emailData = {
      to,
      cc,
      bcc,
      subject,
      body,
      attachments: files
    };

    // Clear any pending draft autosave
    if (draftTimer) {
      clearTimeout(draftTimer);
      setDraftTimer(null);
    }

    if (onSend) {
      onSend(emailData);
    } else {
      // Simulate sending for demo
      toast.success('Email sent successfully!');
      handleClose();
    }
  };

  // Handle discard/close
  const handleClose = () => {
    // Clear any pending draft autosave
    if (draftTimer) {
      clearTimeout(draftTimer);
      setDraftTimer(null);
    }
    
    if (onClose) {
      onClose();
    }
  };

  // Save draft functionality
  const saveDraft = (showNotification = false) => {
    // Check if there's any content to save
    if (to.length > 0 || cc.length > 0 || bcc.length > 0 || subject || body || files.length > 0) {
      const draftData = {
        to,
        cc,
        bcc,
        subject,
        body,
        attachments: files,
        savedAt: new Date().toISOString()
      };
      
      // In a real app, you would save to localStorage or backend
      localStorage.setItem('emailDraft', JSON.stringify(draftData));
      setDraftSaved(true);
      
      // Only show toast notification when manually saving
      if (showNotification) {
        toast.info('Draft saved', { autoClose: 2000 });
      }
      
      // Reset the timer
      return setTimeout(() => saveDraft(false), 10000);
    }
    return null;
  };

  // Manual save draft
  const handleSaveDraft = () => {
    // Clear any existing timer
    if (draftTimer) {
      clearTimeout(draftTimer);
    }
    
    // Save immediately with notification
    saveDraft(true);
    
    // Set up a new timer
    const timer = setTimeout(() => saveDraft(false), 10000);
    setDraftTimer(timer);
  };
  // Load draft on component mount
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem('emailDraft');
      if (savedDraft) {
        const draftData = JSON.parse(savedDraft);
        setTo(draftData.to || []);
        setCc(draftData.cc || []);
        setBcc(draftData.bcc || []);
        setSubject(draftData.subject || '');
        setBody(draftData.body || '');
        if (draftData.cc && draftData.cc.length > 0) setShowCc(true);
        if (draftData.bcc && draftData.bcc.length > 0) setShowBcc(true);
        // Can't restore file attachments from localStorage
        setDraftSaved(true);
      }
    } catch (error) {
      console.error('Error loading draft:', error);
    }
  }, []);

  // Set up autosave
  useEffect(() => {
    // Start autosave timer (10 seconds)
    const timer = setTimeout(() => saveDraft(false), 10000);
    setDraftTimer(timer);
    
    // Clean up timer on component unmount
    return () => {
      if (draftTimer) {
        clearTimeout(draftTimer);
      }
    };
  }, [to, cc, bcc, subject, body, files]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyboardShortcuts = (e) => {
      // Ctrl+Enter or Cmd+Enter to send
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSend();
      }
      
      // Esc to close
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyboardShortcuts);
    
    return () => {
      window.removeEventListener('keydown', handleKeyboardShortcuts);
    };
  }, [to, cc, bcc, subject, body]);
  // Quill editor modules configuration
  const modules = {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{'list': 'ordered'}, {'list': 'bullet'}],
      ['link'],
      [{ 'color': [] }],
      ['clean']
    ],
  };// Email chip component
  const EmailChip = ({ email, onRemove }) => (
    <div className="email-chip flex items-center bg-primary-100 text-primary-800 rounded-full px-2 py-0.5 text-xs mr-1 mb-1">
      <span className="max-w-[120px] truncate">{email}</span>
      <button 
        type="button" 
        onClick={onRemove}
        className="ml-1 rounded-full text-primary-500 hover:text-primary-700 focus:outline-none"
      >
        <XMarkIcon className="h-3 w-3" />
      </button>
    </div>
  );

  return (    <Draggable
      handle=".composer-handle"
      nodeRef={dragNodeRef}
      bounds="body"
      onStart={() => setIsDragging(true)}
      onStop={() => setIsDragging(false)}
      defaultPosition={{ x: window.innerWidth - 450, y: window.innerHeight - 550 }}
    ><div 
        ref={dragNodeRef}
        className={`composer-container fixed bottom-4 right-4 flex flex-col w-full bg-white rounded-lg shadow-xl border border-gray-200 z-50 ${isDragging ? 'cursor-grabbing' : ''}`}
        style={{ height: '450px', maxHeight: 'calc(100vh - 100px)', maxWidth: '420px' }}
      >{/* Header */}
        <div className="composer-handle flex items-center justify-between px-3 py-2 border-b border-gray-200 rounded-t-lg bg-gray-50 cursor-grab">
          <h3 className="text-base font-medium text-gray-700">Compose Email</h3>
          <div className="flex items-center space-x-1">
            <button
              type="button"
              onClick={handleSaveDraft}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
              title="Save as Draft"
            >
              <ArchiveBoxIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
              title="Close"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
          {/* Email Form */}
        <div className="flex-grow flex flex-col overflow-hidden p-2">
          {/* To Field */}
          <div className="flex flex-wrap items-center mb-1 py-1 border-b border-gray-200">
            <span className="text-gray-600 font-medium mr-1 w-8 text-sm">To:</span>
            <div className="flex-grow flex flex-wrap items-center">
              {to.map((email, index) => (
                <EmailChip 
                  key={`to-${index}`} 
                  email={email} 
                  onRemove={() => handleRemoveEmail('to', index)} 
                />
              ))}              <input
                ref={toInputRef}
                type="text"
                value={toInput}
                onChange={(e) => setToInput(e.target.value)}
                onBlur={() => handleAddEmail('to', toInput)}
                onKeyDown={(e) => handleKeyDown(e, 'to')}
                className="flex-grow min-w-[100px] outline-none text-sm"
                placeholder="Enter recipients..."
              />
            </div>
          </div>
            {/* CC/BCC Toggle Links */}
          {!showCc && !showBcc && (
            <div className="flex mb-1">
              <button 
                type="button"
                onClick={() => setShowCc(true)}
                className="text-xs text-primary-600 hover:text-primary-800 mr-3"
              >
                Add Cc
              </button>
              <button 
                type="button"
                onClick={() => setShowBcc(true)}
                className="text-xs text-primary-600 hover:text-primary-800"
              >
                Add Bcc
              </button>
            </div>
          )}
            {/* CC Field */}
          {showCc && (
            <div className="flex flex-wrap items-center mb-1 py-1 border-b border-gray-200">
              <span className="text-gray-600 font-medium mr-1 w-8 text-sm">Cc:</span>
              <div className="flex-grow flex flex-wrap items-center">
                {cc.map((email, index) => (
                  <EmailChip 
                    key={`cc-${index}`} 
                    email={email} 
                    onRemove={() => handleRemoveEmail('cc', index)} 
                  />
                ))}                <input
                  type="text"
                  value={ccInput}
                  onChange={(e) => setCcInput(e.target.value)}
                  onBlur={() => handleAddEmail('cc', ccInput)}
                  onKeyDown={(e) => handleKeyDown(e, 'cc')}
                  className="flex-grow min-w-[100px] outline-none text-sm"
                  placeholder="Enter Cc recipients..."
                />
              </div>
            </div>
          )}
            {/* BCC Field */}
          {showBcc && (
            <div className="flex flex-wrap items-center mb-1 py-1 border-b border-gray-200">
              <span className="text-gray-600 font-medium mr-1 w-8 text-sm">Bcc:</span>
              <div className="flex-grow flex flex-wrap items-center">
                {bcc.map((email, index) => (
                  <EmailChip 
                    key={`bcc-${index}`} 
                    email={email} 
                    onRemove={() => handleRemoveEmail('bcc', index)} 
                  />
                ))}                <input
                  type="text"
                  value={bccInput}
                  onChange={(e) => setBccInput(e.target.value)}
                  onBlur={() => handleAddEmail('bcc', bccInput)}
                  onKeyDown={(e) => handleKeyDown(e, 'bcc')}
                  className="flex-grow min-w-[100px] outline-none text-sm"
                  placeholder="Enter Bcc recipients..."
                />
              </div>
            </div>
          )}
            {/* Subject Field */}
          <div className="mb-1 py-1 border-b border-gray-200">
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full outline-none text-sm"
              placeholder="Subject"
            />
          </div>
            {/* Rich Text Editor */}
          <div className="flex-grow mb-1 overflow-auto">
            <ReactQuill
              theme="snow"
              value={body}
              onChange={setBody}
              modules={modules}
              className="h-[160px]"
            />
          </div>
            {/* Attachments */}
          {files.length > 0 && (
            <div className="mb-2 border-t border-gray-200 pt-1">
              <div className="text-xs font-medium mb-1 text-gray-600">
                Attachments ({files.length})
              </div>
              <div className="flex flex-wrap">                {files.map((file, index) => (
                  <div 
                    key={`file-${index}`}
                    className="file-attachment flex items-center bg-gray-100 rounded-md px-2 py-0.5 mr-1 mb-1"
                  >
                    <span className="text-xs text-gray-800 truncate max-w-[120px]">
                      {file.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(index)}
                      className="ml-1 text-gray-500 hover:text-gray-700 focus:outline-none"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
          {/* Footer Actions */}
        <div className="px-3 py-2 border-t border-gray-200 bg-gray-50 rounded-b-lg flex items-center justify-between">
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => fileInputRef.current.click()}
              className="inline-flex items-center text-gray-700 hover:text-gray-900 focus:outline-none mr-3"
              title="Attach Files"
            >
              <PaperClipIcon className="h-4 w-4 mr-1" />
              <span className="text-xs">Attach</span>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileUpload}
              />
            </button>
            
            {draftSaved && (
              <span className="text-xs text-gray-500">Draft saved</span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-3 py-1 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-primary-500 text-xs"
            >
              Discard
            </button>
            
            <button
              type="button"
              onClick={handleSend}
              className="px-3 py-1 border border-transparent rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-1 focus:ring-primary-500 inline-flex items-center text-xs"
            >
              <span>Send</span>
              <PaperAirplaneIcon className="ml-1 h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </Draggable>
  );
};

export default EmailComposer;
