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

  // Navigation items
  const navItems = [
    { name: 'About', href: '#about' },
    { name: 'Features', href: '#features' },
    { name: 'Resources', href: '#resources' },
    { name: 'Help', href: '#help' }
  ];

  return (
    <header className="bg-white bg-opacity-95 backdrop-blur-sm shadow-sm w-full border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and App Name */}
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-2 rounded-lg shadow-md mr-3 hover:shadow-lg transition-all duration-300">
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
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-600">EmailManagement</h1>
              <p className="text-xs text-gray-500">Email Delivery Management System</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <nav className="flex space-x-6 mr-6">
              {navItems.map((item) => (
                <a 
                  key={item.name} 
                  href={item.href}
                  className="text-gray-600 hover:text-blue-600 transition-colors text-sm font-medium relative group"
                >
                  {item.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 group-hover:w-full transition-all duration-300"></span>
                </a>
              ))}
            </nav>
            <span className="text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-md border border-gray-100 hover:border-blue-200 transition-colors">
              {getFormattedDate()}
            </span>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <span className="text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-md border border-gray-100 mr-3">
              {getFormattedDate()}
            </span>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
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
        <div className="md:hidden border-t border-gray-100 bg-white">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
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
