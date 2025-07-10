import React, { useState, useEffect } from 'react';

const Alert = ({ 
  type = 'info', // 'info', 'success', 'warning', 'error'
  message, 
  onClose,
  autoDismiss = false,
  dismissTime = 5000
}) => {
  const [visible, setVisible] = useState(true);
  
  useEffect(() => {
    if (autoDismiss && type !== 'error') {
      const timer = setTimeout(() => {
        setVisible(false);
        if (onClose) onClose();
      }, dismissTime);
      
      return () => clearTimeout(timer);
    }
  }, [autoDismiss, onClose, dismissTime, type]);

  const handleClose = () => {
    setVisible(false);
    if (onClose) onClose();
  };

  if (!visible) return null;
  // Define color schemes for different alert types
  const colorSchemes = {
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: 'text-blue-600',
      hover: 'hover:bg-blue-100',
      ring: 'focus:ring-blue-500',
      shadow: 'shadow-blue',
      gradientFrom: 'from-blue-600',
      gradientTo: 'to-blue-800'
    },
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      icon: 'text-green-600',
      hover: 'hover:bg-green-100',
      ring: 'focus:ring-green-500',
      shadow: 'shadow-green',
      gradientFrom: 'from-green-600',
      gradientTo: 'to-green-800'
    },
    warning: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-800',
      icon: 'text-amber-600',
      hover: 'hover:bg-amber-100',
      ring: 'focus:ring-amber-500',
      shadow: 'shadow-amber',
      gradientFrom: 'from-amber-600',
      gradientTo: 'to-amber-800'
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: 'text-red-600',
      hover: 'hover:bg-red-100',
      ring: 'focus:ring-red-500',
      shadow: 'shadow-red',
      gradientFrom: 'from-red-600',
      gradientTo: 'to-red-800'
    }
  };

  const colors = colorSchemes[type] || colorSchemes.info;
  // Icons for different alert types
  const icons = {
    info: (
      <div className={`p-1 rounded-full ${colors.bg.replace('50', '100')} ${colors.icon}`}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
        </svg>
      </div>
    ),
    success: (
      <div className={`p-1 rounded-full ${colors.bg.replace('50', '100')} ${colors.icon}`}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
    ),
    warning: (
      <div className={`p-1 rounded-full ${colors.bg.replace('50', '100')} ${colors.icon}`}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      </div>
    ),
    error: (
      <div className={`p-1 rounded-full ${colors.bg.replace('50', '100')} ${colors.icon}`}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
    )
  };  return (
    <div className={`rounded-xl p-5 ${colors.bg} border ${colors.border} ${colors.shadow} animate-fadeIn transition-all duration-300`}>
      <div className="flex">
        <div className="flex-shrink-0">
          {icons[type] || icons.info}
        </div>
        <div className="ml-4 flex-1">
          <p className={`text-sm font-medium ${colors.text}`}>
            {message}
          </p>
        </div>
        <div className="ml-auto pl-3">
          <div className="-mx-1.5 -my-1.5">
            <button
              type="button"
              className={`inline-flex rounded-md p-1.5 ${colors.bg} ${colors.text} ${colors.hover} focus:outline-none focus:ring-2 focus:ring-offset-2 ${colors.ring} transition-all duration-200`}
              onClick={handleClose}
              aria-label="Close"
            >
              <span className="sr-only">Dismiss</span>
              <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Alert;
