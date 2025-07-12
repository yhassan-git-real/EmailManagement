import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { formatConnectionTime, getFormattedDate } from '../../utils/dateUtils';

const Header = ({ connectionInfo, onDisconnect }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const location = useLocation();
  const currentPath = location.pathname;
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Check if screen is mobile size on mount and when window resizes
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);

    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);
  
  // Navigation items with their icons and routes
  const navItems = [
    {
      id: 'home',
      label: 'Home',
      path: '/home',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
          className="w-5 h-5">
          <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
          <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
        </svg>
      )
    },
    {
      id: 'records',
      label: 'Email Records',
      path: '/email-records',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
          className="w-5 h-5">
          <path fillRule="evenodd" d="M5.625 1.5H9a3.75 3.75 0 013.75 3.75v1.875c0 1.036.84 1.875 1.875 1.875H16.5a3.75 3.75 0 013.75 3.75v7.875c0 1.035-.84 1.875-1.875 1.875H5.625a1.875 1.875 0 01-1.875-1.875V3.375c0-1.036.84-1.875 1.875-1.875zm6.905 9.97a.75.75 0 00-1.06 0l-3 3a.75.75 0 101.06 1.06l1.72-1.72V18a.75.75 0 001.5 0v-4.19l1.72 1.72a.75.75 0 101.06-1.06l-3-3z" clipRule="evenodd" />
          <path d="M14.25 5.25a5.23 5.23 0 00-1.279-3.434 9.768 9.768 0 016.963 6.963A5.23 5.23 0 0016.5 7.5h-1.875a.375.375 0 01-.375-.375V5.25z" />
        </svg>
      )
    },
    {
      id: 'automate',
      label: 'Automate Email',
      path: '/automate',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
          className="w-5 h-5">
          <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z" clipRule="evenodd" />
        </svg>
      )
    }
  ];
  
  // Check if a nav item is active based on current path
  const isActive = (path) => {
    // Home is active for /home, /dashboard and /status (for backward compatibility)
    if (path === '/home' && (currentPath === '/home' || currentPath === '/dashboard' || currentPath === '/status')) {
      return true;
    }
    // Email Records is active for both /email-records and /records (for backward compatibility)
    if (path === '/email-records' && (currentPath === '/email-records' || currentPath === '/records')) {
      return true;
    }
    // Log Management path removed
    // Otherwise, check for exact path match
    return currentPath === path;
  };
  return (
    <header className="bg-white bg-opacity-98 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50 w-full shadow-sm">
      <div className="max-w-full mx-auto px-2 sm:px-3 lg:px-4">
        <div className="flex justify-between items-center py-2.5">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-primary-500 to-secondary-500 p-2.5 rounded-lg shadow-md mr-3 transform transition-transform duration-300 hover:scale-105">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-7 h-7 text-white"
              >
                <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
                <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-secondary-600 tracking-tight">EmailManagement</h1>
              <p className="text-xs text-gray-500 font-medium">Email Delivery Management System</p>
            </div>
          </div>
          
          {/* Navigation items - now on same line as header */}
          <div className="hidden md:flex items-center">
            {navItems.map((item) => (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`group flex items-center px-3 py-1.5 mx-1 relative ${isActive(item.path)
                    ? 'text-primary-600'
                    : 'text-gray-500 hover:text-primary-600'
                  } transition-all duration-300 hover:scale-105`}
                >
                  <div className={`p-1 rounded-full mr-1.5 ${isActive(item.path) 
                    ? 'bg-primary-100 text-primary-600 shadow-sm' 
                    : 'text-gray-400 group-hover:text-primary-500 group-hover:bg-primary-50'} 
                    transition-all duration-300 transform`}>
                    {item.icon}
                  </div>
                  <span className={`text-sm font-medium tracking-wide ${isActive(item.path) ? 'font-semibold' : ''}`}>
                    {item.label}
                  </span>
                  {isActive(item.path) && (
                    <span className="absolute -bottom-1.5 left-0 w-full h-0.5 bg-gradient-to-r from-primary-400 to-primary-600 rounded-full"></span>
                  )}
                </Link>
            ))}
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-md hidden sm:block">
              {new Date().toLocaleDateString()}
            </span>

            {/* Connection Info Badge */}
            {connectionInfo && (<div className="relative">                <button
              className="flex items-center bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg px-4 py-2 text-sm font-medium hover:shadow-lg hover:from-primary-600 hover:to-secondary-600 transition-all duration-300"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-2">
                <path fillRule="evenodd" d="M7.584 2.186a.75.75 0 01.832 0l7 4a.75.75 0 010 1.312l-7 4a.75.75 0 01-.832 0l-7-4a.75.75 0 010-1.312l7-4z" clipRule="evenodd" />
                <path fillRule="evenodd" d="M2.5 10.677v4.073c0 .342.192.66.5.847l7 4.2a.75.75 0 00.75 0l7-4.2a1 1 0 00.5-.847v-4.073a.75.75 0 00-1.5 0v3.927l-6.5 3.9-6.5-3.9v-3.927a.75.75 0 00-1.5 0z" clipRule="evenodd" />
              </svg>
              <span className="hidden sm:inline">{connectionInfo.databaseName}</span>
              <span className="px-2 py-1 ml-2 bg-green-100 text-green-800 text-xs font-medium rounded-full flex items-center">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1 animate-pulse"></span>
                Connected
              </span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 ml-2 opacity-70">
                <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 011.06 0L10 11.94l3.72-3.72a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.22 9.28a.75.75 0 010-1.06z" clipRule="evenodd" />
              </svg>
            </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-xl py-1 z-10 border border-gray-100">
                  <div className="px-6 py-4">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-3">
                      <p className="text-base font-bold text-gray-900">Database Connection</p>
                      <div className="px-1.5 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded">
                        Active
                      </div>
                    </div>

                    <div className="space-y-3 text-sm">
                      <div className="flex">
                        <div className="w-32 flex-shrink-0 text-gray-500">Server</div>
                        <div className="font-medium text-gray-800 break-all">{connectionInfo.serverName}</div>
                      </div>                        <div className="flex">
                        <div className="w-32 flex-shrink-0 text-gray-500">Database</div>
                        <div className="font-medium text-gray-800 break-all">{connectionInfo.databaseName}</div>
                      </div>
                      <div className="flex">
                        <div className="w-32 flex-shrink-0 text-gray-500">User</div>
                        <div className="font-medium text-gray-800 break-all">{connectionInfo.username}</div>
                      </div><div className="flex">
                        <div className="w-32 flex-shrink-0 text-gray-500">Connected at</div>
                        <div className="font-medium text-gray-800">{formatConnectionTime(connectionInfo.connectedAt)}</div>
                      </div>                        <div className="flex">
                        <div className="w-32 flex-shrink-0 text-gray-500">Status</div>
                        <div className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded-full flex items-center">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></span>
                          Active
                        </div>
                      </div>
                    </div>
                  </div>                    <div className="border-t border-gray-100 p-3">
                    <button
                      type="button"
                      className="flex w-full items-center justify-center px-4 py-2.5 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-all duration-200"
                      onClick={() => {
                        onDisconnect();
                        setDropdownOpen(false);
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-2">
                        <path fillRule="evenodd" d="M10 2a.75.75 0 01.75.75v7.5a.75.75 0 01-1.5 0v-7.5A.75.75 0 0110 2zM5.404 4.343a.75.75 0 010 1.06 6.5 6.5 0 109.192 0 .75.75 0 111.06-1.06 8 8 0 11-11.313 0 .75.75 0 011.06 0z" clipRule="evenodd" />
                      </svg>
                      Disconnect Database
                    </button>
                  </div>
                </div>
              )}
            </div>
            )}
          </div>
        </div>
      </div>
      {/* Navigation is now integrated directly in the header row above */}

      {/* Mobile menu button - only shown on mobile */}
      {isMobile && (
        <div className="md:hidden px-4 py-2 border-t border-gray-100 flex justify-between items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex items-center text-primary-600 hover:text-primary-700 focus:outline-none rounded-md px-2 py-1.5 hover:bg-primary-50 transition-colors duration-200 w-full justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-5 w-5 mr-1">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
            </svg>
            <span className="text-sm">{mobileMenuOpen ? 'Close Menu' : 'Menu'}</span>
          </button>
        </div>
      )}

      {/* Mobile navigation menu */}
      {isMobile && mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-md animate-fadeIn">
          <div className="px-3 pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
                <Link
                  key={item.id}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-2 rounded-lg text-sm font-medium flex items-center ${isActive(item.path)
                    ? 'bg-primary-50 text-primary-600 border-l-4 border-primary-500 pl-3'
                    : 'text-gray-600 hover:bg-primary-50/30 hover:text-primary-700'
                  } transition-all duration-200`}
                >
                  <span className={`mr-3 ${isActive(item.path) ? 'text-primary-500' : 'text-gray-400'}`}>
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
