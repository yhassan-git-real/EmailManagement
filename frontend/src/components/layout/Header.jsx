import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { formatConnectionTime } from '../../utils/dateUtils';

const Header = ({ connectionInfo, onDisconnect }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();
  const currentPath = location.pathname;
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const searchInputRef = useRef(null);

  // Check if screen is mobile size
  useEffect(() => {
    const checkIfMobile = () => setIsMobile(window.innerWidth < 768);
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Handle Ctrl+K shortcut for search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
        setTimeout(() => searchInputRef.current?.focus(), 100);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navItems = [
    { id: 'home', label: 'Dashboard', path: '/home' },
    { id: 'records', label: 'Records', path: '/email-records' },
    { id: 'automate', label: 'Automate', path: '/automate' }
  ];

  const isActive = (path) => {
    if (path === '/home' && ['/home', '/dashboard', '/status'].includes(currentPath)) return true;
    if (path === '/email-records' && ['/email-records', '/records'].includes(currentPath)) return true;
    return currentPath === path;
  };

  return (
    <header className="bg-dark-700/95 backdrop-blur-xl border-b border-dark-300/40 sticky top-0 z-50 w-full">
      <div className="max-w-full mx-auto px-3 lg:px-4">
        <div className="flex justify-between items-center h-14">
          {/* Left: Logo + Nav */}
          <div className="flex items-center gap-6">
            {/* Logo */}
            <Link to="/home" className="flex items-center gap-2.5 group">
              <div className="bg-gradient-to-br from-primary-500 to-accent-violet p-2 rounded-lg shadow-glow-sm transition-all duration-200 group-hover:shadow-glow-md">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
                  <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
                  <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
                </svg>
              </div>
              <span className="text-base font-semibold text-text-primary hidden sm:block">EmailManager</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-150 ${isActive(item.path)
                    ? 'text-text-primary bg-dark-500/80'
                    : 'text-text-muted hover:text-text-secondary hover:bg-dark-500/40'
                    }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right: Search + Date + Actions + Profile */}
          <div className="flex items-center gap-2">
            {/* Search Button */}
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-sm text-text-muted bg-dark-500/60 hover:bg-dark-500/80 rounded-lg border border-dark-300/50 transition-all duration-150"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              <span className="hidden lg:block">Search...</span>
              <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-xs bg-dark-400/60 rounded text-text-muted">
                ⌘K
              </kbd>
            </button>

            {/* Notifications */}
            <button className="p-2 text-text-muted hover:text-text-secondary hover:bg-dark-500/60 rounded-lg transition-all duration-150 relative">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
              </svg>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-500 rounded-full"></span>
            </button>

            {/* Connection/Profile */}
            {connectionInfo && (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-lg hover:bg-dark-500/60 transition-all duration-150"
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-accent-violet flex items-center justify-center">
                    <span className="text-xs font-semibold text-white">
                      {connectionInfo.databaseName?.charAt(0)?.toUpperCase() || 'D'}
                    </span>
                  </div>
                  <span className="hidden lg:block text-text-secondary text-sm">{connectionInfo.databaseName}</span>
                  <span className="w-2 h-2 bg-success rounded-full"></span>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-1 w-72 bg-dark-600/95 backdrop-blur-xl rounded-xl border border-dark-300/50 shadow-dark-lg py-2 z-50 animate-fadeIn">
                    <div className="px-4 py-2 border-b border-dark-300/50">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-text-primary">Database Connection</span>
                        <span className="px-2 py-0.5 text-xs bg-success/20 text-success-light rounded-full">Active</span>
                      </div>
                    </div>

                    <div className="px-4 py-3 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-text-muted">Server</span>
                        <span className="text-text-secondary truncate max-w-[140px]">{connectionInfo.serverName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-muted">Database</span>
                        <span className="text-text-secondary">{connectionInfo.databaseName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-muted">User</span>
                        <span className="text-text-secondary">{connectionInfo.username}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-muted">Connected</span>
                        <span className="text-text-secondary">{formatConnectionTime(connectionInfo.connectedAt)}</span>
                      </div>
                    </div>

                    <div className="px-3 pt-2 border-t border-dark-300/50">
                      <button
                        onClick={() => { onDisconnect(); setDropdownOpen(false); }}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-danger-light hover:bg-danger/10 rounded-lg transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5.636 5.636a9 9 0 1 0 12.728 0M12 3v9" />
                        </svg>
                        Disconnect
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-text-muted hover:text-text-secondary rounded-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d={mobileMenuOpen ? 'M6 18 18 6M6 6l12 12' : 'M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5'} />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobile && mobileMenuOpen && (
        <div className="md:hidden bg-dark-700/95 backdrop-blur-xl border-t border-dark-300/40 animate-fadeIn">
          <nav className="px-3 py-2 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.id}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 text-sm font-medium rounded-lg transition-colors ${isActive(item.path)
                  ? 'text-primary-400 bg-primary-500/10'
                  : 'text-text-secondary hover:bg-dark-500/40'
                  }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}

      {/* Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 bg-dark-900/80 backdrop-blur-sm z-50 flex items-start justify-center pt-24 animate-fadeIn" onClick={() => setSearchOpen(false)}>
          <div className="w-full max-w-lg mx-4 bg-dark-600/95 backdrop-blur-xl rounded-xl border border-dark-300/50 shadow-dark-lg overflow-hidden animate-scaleIn" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 px-4 py-3 border-b border-dark-300/50">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-text-muted">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search emails, records, settings..."
                className="flex-1 bg-transparent text-text-primary placeholder-text-muted outline-none text-sm"
                autoFocus
              />
              <kbd className="px-2 py-1 text-xs bg-dark-500/60 rounded text-text-muted">ESC</kbd>
            </div>
            <div className="px-4 py-8 text-center text-sm text-text-muted">
              Start typing to search...
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
