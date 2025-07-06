import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { connectToDatabase, testDatabaseConnection } from '../utils/apiClient';

const DatabaseConnector = ({ onConnected, onConnectionInfoUpdate }) => {
  const navigate = useNavigate();

  // Load saved suggestions from localStorage
  const loadSavedSuggestions = () => {
    try {
      return {
        serverNames: JSON.parse(localStorage.getItem('emailMgmt_serverNames')) || [],
        databaseNames: JSON.parse(localStorage.getItem('emailMgmt_databaseNames')) || [],
        usernames: JSON.parse(localStorage.getItem('emailMgmt_usernames')) || []
      };
    } catch (e) {
      console.error('Error loading suggestions from localStorage:', e);
      return {
        serverNames: [],
        databaseNames: [],
        usernames: []
      };
    }
  };

  const [suggestions, setSuggestions] = useState(loadSavedSuggestions());
  const [showSuggestions, setShowSuggestions] = useState({
    serverName: false,
    databaseName: false,
    username: false
  });

  const [credentials, setCredentials] = useState({
    serverName: '',
    databaseName: '',
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [testConnectionResult, setTestConnectionResult] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  // Reference for autofocus
  const serverNameInputRef = useRef(null);
  const suggestionsRefs = {
    serverName: useRef(null),
    databaseName: useRef(null),
    username: useRef(null)
  };

  // Handle clicks outside of suggestion boxes
  useEffect(() => {
    function handleClickOutside(event) {
      Object.keys(suggestionsRefs).forEach(key => {
        if (suggestionsRefs[key].current && !suggestionsRefs[key].current.contains(event.target)) {
          setShowSuggestions(prev => ({ ...prev, [key]: false }));
        }
      });
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Set focus on the first input field when component mounts
  useEffect(() => {
    if (serverNameInputRef.current) {
      serverNameInputRef.current.focus();
    }
  }, []);

  const validateField = (name, value) => {
    if (!value.trim()) {
      return `${name.charAt(0).toUpperCase() + name.slice(1).replace('Name', ' Name')} is required`;
    }
    return '';
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));

    // Show suggestions if we have any for this field
    if (name !== 'password' && suggestions[`${name}s`]?.length > 0) {
      setShowSuggestions(prev => ({
        ...prev,
        [name]: value.trim() !== ''
      }));
    }

    // Validate the field
    const error = validateField(name, value);
    setFieldErrors(prev => ({
      ...prev,
      [name]: error
    }));

    // Clear error when user starts typing again
    if (error) setError('');
    if (testConnectionResult) setTestConnectionResult(null);
  };

  const handleSuggestionClick = (field, value) => {
    setCredentials(prev => ({
      ...prev,
      [field]: value
    }));
    setShowSuggestions(prev => ({
      ...prev,
      [field]: false
    }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setFieldErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleTestConnection = async () => {
    // Validate all fields
    const errors = {};
    Object.keys(credentials).forEach(key => {
      const error = validateField(key, credentials[key]);
      if (error) errors[key] = error;
    });

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setTestingConnection(true);
    setError('');
    setTestConnectionResult(null);

    try {
      const response = await testDatabaseConnection(credentials);
      setTestConnectionResult({
        success: true,
        message: response.message,
        details: response.details
      });
      // Removed toast notification as per requirement
    } catch (err) {
      setError(err.message || 'Failed to test database connection');
      setTestConnectionResult({
        success: false,
        message: err.message || 'Failed to test database connection'
      });
      // Removed toast notification as per requirement
    } finally {
      setTestingConnection(false);
    }
  };
  const saveToLocalStorage = () => {
    try {
      // Update suggestions with the current values if they're not already in the list
      const updatedSuggestions = { ...suggestions };

      // Save server name
      if (credentials.serverName && !updatedSuggestions.serverNames.includes(credentials.serverName)) {
        updatedSuggestions.serverNames = [credentials.serverName, ...updatedSuggestions.serverNames].slice(0, 5);
        localStorage.setItem('emailMgmt_serverNames', JSON.stringify(updatedSuggestions.serverNames));
      }

      // Save database name
      if (credentials.databaseName && !updatedSuggestions.databaseNames.includes(credentials.databaseName)) {
        updatedSuggestions.databaseNames = [credentials.databaseName, ...updatedSuggestions.databaseNames].slice(0, 5);
        localStorage.setItem('emailMgmt_databaseNames', JSON.stringify(updatedSuggestions.databaseNames));
      }

      // Save username
      if (credentials.username && !updatedSuggestions.usernames.includes(credentials.username)) {
        updatedSuggestions.usernames = [credentials.username, ...updatedSuggestions.usernames].slice(0, 5);
        localStorage.setItem('emailMgmt_usernames', JSON.stringify(updatedSuggestions.usernames));
      }

      setSuggestions(updatedSuggestions);
    } catch (e) {
      console.error('Error saving to localStorage:', e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields
    const errors = {};
    Object.keys(credentials).forEach(key => {
      const error = validateField(key, credentials[key]);
      if (error) errors[key] = error;
    });

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await connectToDatabase(credentials);
      // Save valid credentials to localStorage
      saveToLocalStorage();
      // Update app state with connection information
      onConnected(true);
      if (onConnectionInfoUpdate) {
        onConnectionInfoUpdate(response.connectionInfo);
      }
      // Redirect to the new dashboard page
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to connect to database');
      // Removed toast notification as per requirement
    } finally {
      setLoading(false);
    }
  };

  // Helper function to determine input field classes based on validation
  const getInputClasses = (fieldName) => {
    const baseClasses = "w-full pl-10 pr-4 py-3 rounded-lg border bg-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm shadow-sm hover:shadow-md hover:border-blue-400 transform hover:-translate-y-0.5";
    if (fieldErrors[fieldName]) {
      return `${baseClasses} border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500`;
    }
    return `${baseClasses} border-gray-200 hover:border-blue-300 focus:border-blue-500`;
  };
  return (
    <div className="shadow-md rounded-lg border border-gray-200 bg-white p-4">
      <div className="relative">
        {/* Card header with accent gradient */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-t-lg"></div>
        <div className="pt-3 mb-3">
          <div className="flex items-center mb-6">
            <div className="mr-3 bg-gradient-to-br from-blue-500 to-blue-600 p-2.5 rounded-lg shadow-md transform transition-all duration-300 hover:scale-110 hover:shadow-lg group">
              <svg className="w-6 h-6 text-white transition-transform group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                Database Connection
                <span className="ml-3 inline-block text-xs py-1 px-2 bg-blue-100 text-blue-700 rounded-md shadow-sm transition-all hover:bg-blue-200">
                  SQL Server
                </span>
              </h2>
              <p className="text-gray-600 text-sm mt-1">Connect to your SQL Server database</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Row 1: SQL Server Name and Database Name side by side */}
          <div className="grid grid-cols-2 gap-x-4">
            {/* SQL Server Name */}
            <div className="input-group">
              <label htmlFor="serverName" className="block text-xs font-medium text-gray-700 mb-1">
                <span>SQL Server Name</span>
              </label>
              <div className="relative group" ref={suggestionsRefs.serverName}>
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none transition-all duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-blue-500 transition-all duration-300 group-hover:text-blue-600 group-hover:scale-110">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                    <path d="M8 21h8"></path>
                    <path d="M12 17v4"></path>
                  </svg>
                </div>
                <input
                  ref={serverNameInputRef}
                  type="text"
                  id="serverName"
                  name="serverName"
                  value={credentials.serverName}
                  onChange={handleChange}
                  className={getInputClasses('serverName')}
                  style={{ paddingLeft: '2.75rem' }}
                />
                {showSuggestions.serverName && suggestions.serverNames.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-sm max-h-60 overflow-auto">
                    <ul className="py-1">
                      {suggestions.serverNames
                        .filter(server => server.toLowerCase().includes(credentials.serverName.toLowerCase()))
                        .map((server, index) => (
                          <li
                            key={index}
                            className="px-3 py-1.5 text-xs hover:bg-blue-50 cursor-pointer flex items-center"
                            onClick={() => handleSuggestionClick('serverName', server)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                            </svg>
                            {server}
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
                {fieldErrors.serverName && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.serverName}</p>
                )}
              </div>
            </div>

            {/* Database Name */}
            <div className="input-group">
              <label htmlFor="databaseName" className="block text-xs font-medium text-gray-700 mb-1">
                <span>Database Name</span>
              </label>
              <div className="relative group" ref={suggestionsRefs.databaseName}>
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none transition-all duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-blue-500 transition-all duration-300 group-hover:text-blue-600 group-hover:scale-110">
                    <path d="M12 2C6.48 2 2 4.48 2 7.5v9c0 3.02 4.48 5.5 10 5.5s10-2.48 10-5.5v-9C22 4.48 17.52 2 12 2z"></path>
                    <path d="M22 7.5C22 10.52 17.52 13 12 13S2 10.52 2 7.5"></path>
                    <path d="M2 11.5C2 14.52 6.48 17 12 17s10-2.48 10-5.5"></path>
                  </svg>
                </div>
                <input
                  type="text"
                  id="databaseName"
                  name="databaseName"
                  value={credentials.databaseName}
                  onChange={handleChange}
                  className={getInputClasses('databaseName')}
                  style={{ paddingLeft: '2.75rem' }}
                />
                {showSuggestions.databaseName && suggestions.databaseNames.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-sm max-h-60 overflow-auto">
                    <ul className="py-1">
                      {suggestions.databaseNames
                        .filter(db => db.toLowerCase().includes(credentials.databaseName.toLowerCase()))
                        .map((db, index) => (
                          <li
                            key={index}
                            className="px-3 py-1.5 text-xs hover:bg-blue-50 cursor-pointer flex items-center"
                            onClick={() => handleSuggestionClick('databaseName', db)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                            </svg>
                            {db}
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
                {fieldErrors.databaseName && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.databaseName}</p>
                )}
              </div>
            </div>
          </div>

          {/* Row 2: Username and Password side by side */}
          <div className="grid grid-cols-2 gap-x-4">
            {/* Username */}
            <div className="input-group">
              <label htmlFor="username" className="block text-xs font-medium text-gray-700 mb-1">
                <span>Username</span>
              </label>
              <div className="relative group" ref={suggestionsRefs.username}>
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none transition-all duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-blue-500 transition-all duration-300 group-hover:text-blue-600 group-hover:scale-110">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={credentials.username}
                  onChange={handleChange}
                  className={getInputClasses('username')}
                  style={{ paddingLeft: '2.75rem' }}
                />
                {showSuggestions.username && suggestions.usernames.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-sm max-h-60 overflow-auto">
                    <ul className="py-1">
                      {suggestions.usernames
                        .filter(user => user.toLowerCase().includes(credentials.username.toLowerCase()))
                        .map((user, index) => (
                          <li
                            key={index}
                            className="px-3 py-1.5 text-xs hover:bg-blue-50 cursor-pointer flex items-center"
                            onClick={() => handleSuggestionClick('username', user)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                            </svg>
                            {user}
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
                {fieldErrors.username && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.username}</p>
                )}
              </div>
            </div>

            {/* Password */}
            <div className="input-group">
              <label htmlFor="password" className="block text-xs font-medium text-gray-700 mb-1">
                <span>Password</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none transition-all duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-blue-500 transition-all duration-300 group-hover:text-blue-600 group-hover:scale-110">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={credentials.password}
                  onChange={handleChange}
                  className={getInputClasses('password')}
                  style={{ paddingLeft: '2.75rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-400 hover:text-blue-600 transition-all duration-300 group"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <div className="p-1.5 rounded-md hover:bg-blue-50 transition-all duration-300 transform group-hover:scale-110">
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7A9.97 9.97 0 014.02 8.971m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </div>
                </button>
                {fieldErrors.password && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>
                )}
              </div>
            </div>
          </div>

          {/* Test Connection Result */}
          {testConnectionResult && (
            <div className={`p-2 rounded-md text-xs mb-3 border ${testConnectionResult.success
                ? 'bg-green-50 text-green-700 border-green-100'
                : 'bg-red-50 text-red-700 border-red-100'
              }`}>
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {testConnectionResult.success ? (
                    <div className="p-1 bg-green-100 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  ) : (
                    <div className="p-1 bg-red-100 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="ml-2">
                  <p className="font-medium text-xs">{testConnectionResult.message}</p>
                  {testConnectionResult.success && testConnectionResult.details && (
                    <div className="mt-1 text-xs space-y-0.5">
                      <div className="flex items-center gap-1">
                        <span className="text-gray-600">Server:</span>
                        <span className="font-medium">{testConnectionResult.details.server}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-gray-600">Database:</span>
                        <span className="font-medium">{testConnectionResult.details.database}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-gray-600">Status:</span>
                        <span className="font-medium text-green-600">{testConnectionResult.details.status}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Success message after test connection */}
          {testConnectionResult && testConnectionResult.success && (
            <div className="p-2.5 bg-green-50 text-green-700 border border-green-100 rounded-lg text-xs mb-4 transition-all duration-300 hover:shadow-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="p-1 bg-green-100 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="ml-2">
                  <p className="font-medium text-xs">Connection successful!</p>
                </div>
              </div>
            </div>
          )}

          {/* General error message */}
          {error && !testConnectionResult && (
            <div className="p-2.5 bg-red-50 text-red-700 border border-red-100 rounded-lg text-xs transition-all duration-300 hover:shadow-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="p-1 bg-red-100 rounded-full transition-all duration-300 group-hover:scale-110">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="ml-2">
                  <p className="font-medium text-xs">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-6 mb-6">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testingConnection || loading}
              className="flex items-center justify-center px-4 py-2.5 border border-blue-300 rounded-lg bg-white text-blue-600 hover:bg-blue-50 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 group"
            >
              {testingConnection ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-0.5 mr-2 h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Testing...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <svg className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:rotate-45" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                  Test Connection
                </span>
              )}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5 group"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-0.5 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Connecting...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <svg className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:translate-x-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14"></path>
                    <path d="M12 5l7 7-7 7"></path>
                  </svg>
                  Connect
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DatabaseConnector;