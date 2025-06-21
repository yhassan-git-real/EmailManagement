import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = (props) => {
  const location = useLocation();
  const currentPath = location.pathname;
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  // Check if screen is mobile size on mount and when window resizes
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsCollapsed(true);
      }
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
      path: '/dashboard',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
             strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
      )
    },
    {
      id: 'compose',
      label: 'Manual Email Compose',
      path: '/compose',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
             strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
        </svg>
      )
    },
    {
      id: 'automate',
      label: 'Automate Email',
      path: '/automate',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
             strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
      )
    }
  ];

  // Future navigation items (commented out for now)
  const futureNavItems = [
    // {
    //   id: 'logs',
    //   label: 'Logs',
    //   path: '/logs',
    //   icon: (
    //     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
    //          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    //       <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    //       <polyline points="14 2 14 8 20 8"></polyline>
    //       <line x1="16" y1="13" x2="8" y2="13"></line>
    //       <line x1="16" y1="17" x2="8" y2="17"></line>
    //       <polyline points="10 9 9 9 8 9"></polyline>
    //     </svg>
    //   )
    // },
    // {
    //   id: 'settings',
    //   label: 'Settings',
    //   path: '/settings',
    //   icon: (
    //     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
    //          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    //       <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"></path>
    //       <path d="M7 7h.01"></path>
    //     </svg>
    //   )
    // }
  ];  // Check if a nav item is active based on current path
  const isActive = (path) => {
    // Home/Dashboard is active on root path, /dashboard, and /status (for backward compatibility)
    if (path === '/dashboard' && (currentPath === '/' || currentPath === '/dashboard' || currentPath === '/status')) {
      return true;
    }
    return currentPath === path || currentPath.startsWith(`${path}/`);
  };  return (
    <>
      {/* Mobile sidebar backdrop */}
      {isMobile && isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed md:static h-full min-h-screen bg-white border-r border-gray-200 shadow-sm flex flex-col transition-all duration-300 z-30
          ${isCollapsed ? 'w-20' : 'w-60'} 
          ${isMobile ? (isMobileOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'}
        `}
      >        {/* Toggle button for mobile */}        <button 
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="md:hidden fixed left-4 top-20 z-[120] bg-white text-primary-600 p-2 rounded-full shadow-lg border border-gray-200 hover:bg-primary-50 transition-colors"
        >
          {isMobileOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          )}
        </button>
        {/* Sidebar Header with Logo */}        <div className="p-2.5 border-b border-gray-100 flex items-center justify-between relative">
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
            <div className="bg-gradient-to-r from-secondary-500 to-primary-600 p-2 rounded-lg shadow-md">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="currentColor" 
                className="w-6 h-6 text-white"
              >
                <path d="M11.25 4.533A9.707 9.707 0 006 3a9.735 9.735 0 00-3.25.555.75.75 0 00-.5.707v14.25a.75.75 0 001 .707A8.237 8.237 0 016 18.75c1.995 0 3.823.707 5.25 1.886V4.533zM12.75 20.636A8.214 8.214 0 0118 18.75c.966 0 1.89.166 2.75.47a.75.75 0 001-.708V4.262a.75.75 0 00-.5-.707A9.735 9.735 0 0018 3a9.707 9.707 0 00-5.25 1.533v16.103z" />
              </svg>
            </div>            {!isCollapsed && (
              <div>
                <h1 className="text-sm font-medium text-primary-600">
                  Control Panel
                </h1>
                <p className="text-xs text-gray-500">Email Services</p>
              </div>
            )}
          </div>
            {/* Collapse toggle button (only on desktop) */}          
          {!isMobile && (            
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="absolute -right-4 top-6 w-6 h-6 rounded-full bg-white hover:bg-primary-50 text-gray-500 hover:text-primary-600 flex items-center justify-center transition-colors shadow-md border border-gray-200 z-[120]"
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              )}            </button>
          )}
        </div>      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto p-2.5 mt-1">
        <ul className="space-y-3 mt-2">
          {navItems.map(item => (
            <li key={item.id}>
              <Link 
                to={item.path}
                className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} p-3 rounded-lg transition-all duration-200 ${
                  isActive(item.path)
                    ? isCollapsed 
                      ? 'bg-primary-50 text-primary-700 shadow-sm' 
                      : 'bg-primary-50 text-primary-700 border-l-4 border-primary-500 pl-2.5' 
                    : 'text-gray-700 hover:bg-gray-50 hover:text-primary-600'
                }`}
                aria-label={item.label}
                title={isCollapsed ? item.label : ''}
              >
                <div className={`${isCollapsed && isActive(item.path) ? 'p-1 bg-primary-100 rounded-lg' : ''} 
                                ${isCollapsed ? 'flex items-center justify-center w-8 h-8' : 'flex items-center justify-center w-7 h-7'}`}>
                  <span className={`${isActive(item.path) ? 'text-primary-600' : 'text-gray-500'}`}>
                    {item.icon}
                  </span>
                </div>
                {!isCollapsed && <span className="font-medium text-sm">{item.label}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>{/* Bottom Section (Optional) */}
      <div className="p-3 border-t border-gray-100">
        <div className={`text-xs text-gray-400 ${isCollapsed ? 'text-center' : ''}`}>
          {isCollapsed ? (
            <span className="inline-block mt-1">•••</span>
          ) : (
            <div className="flex items-center justify-between px-1">
              <span>© {new Date().getFullYear()}</span>
              <span className="text-primary-500 font-medium">v1.0</span>
            </div>
          )}
        </div>
      </div>
      </aside>
    </>
  );
};

export default Sidebar;
