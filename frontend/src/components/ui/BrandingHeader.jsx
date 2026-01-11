import React, { useState } from 'react';

const BrandingHeader = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Format date in a clean, professional way
  const getFormattedDate = () => {
    return new Date().toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Information items for login page
  const infoItems = [
    { name: 'Documentation', href: '#' },
    { name: 'Support', href: '#' }
  ];

  return (
    <header className="w-full sticky top-0 z-50" style={{
      background: 'rgba(15, 23, 42, 0.8)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
    }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and App Name */}
          <div className="flex items-center">
            <div className="p-2 rounded-lg shadow-md mr-3 hover:shadow-lg transition-all duration-300" style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)'
            }}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-6 h-6 text-white"
              >
                <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
                <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">EmailManagement</h1>
              <p className="text-xs text-slate-400">Email Delivery Management System</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <nav className="flex space-x-6 mr-6">
              {infoItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-slate-300 hover:text-indigo-400 transition-colors text-sm font-medium relative group"
                >
                  {item.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-400 group-hover:w-full transition-all duration-300"></span>
                </a>
              ))}
            </nav>
            <span className="text-sm text-slate-300 px-3 py-1.5 rounded-md transition-colors" style={{
              background: 'rgba(30, 41, 59, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              {getFormattedDate()}
            </span>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <span className="text-sm text-slate-300 px-3 py-1.5 rounded-md mr-3" style={{
              background: 'rgba(30, 41, 59, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              {getFormattedDate()}
            </span>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-slate-400 hover:text-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500" style={{
                background: 'rgba(30, 41, 59, 0.6)'
              }}
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden" style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(15, 23, 42, 0.95)'
        }}>
          <div className="px-2 pt-2 pb-3 space-y-1">
            {infoItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="block px-3 py-2 text-base font-medium text-slate-300 hover:text-indigo-400 rounded-md transition-colors" style={{
                  background: 'transparent'
                }}
              >
                {item.name}
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default BrandingHeader;
