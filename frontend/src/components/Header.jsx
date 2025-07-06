import React, { useState } from 'react';
import HeaderNav from './HeaderNav';
import { formatConnectionTime, getFormattedDate } from '../utils/dateUtils';

const Header = ({ connectionInfo, onDisconnect }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  return (
    <header className="bg-white bg-opacity-90 backdrop-blur-md shadow-sm sticky top-0 z-50 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-primary-500 to-secondary-500 p-2 rounded-lg shadow-lg mr-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-8 h-8 text-white"
              >
                <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
                <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-secondary-600">EmailManagement</h1>
              <p className="text-xs text-gray-500">Email Delivery Management System</p>
            </div>
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
      {/* Add HeaderNav component below the header content */}
      <HeaderNav />
    </header>
  );
};

export default Header;
