/**
 * Test file for session utility functions
 * Run with: npm test sessionUtils.test.js
 */

import { 
  saveConnectionToSession, 
  loadConnectionFromSession, 
  clearConnectionSession,
  updateActivityTimestamp,
  isSessionValid 
} from './sessionUtils';

// Mock storage
const mockStorage = () => {
  let store = {};
  
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = value; },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; }
  };
};

// Mock sessionStorage and localStorage
Object.defineProperty(window, 'sessionStorage', {
  value: mockStorage()
});

Object.defineProperty(window, 'localStorage', {
  value: mockStorage()
});

describe('sessionUtils', () => {
  beforeEach(() => {
    // Clear storage before each test
    window.sessionStorage.clear();
    window.localStorage.clear();
  });

  test('saveConnectionToSession should save to both storages', () => {
    const connectionInfo = { server: 'localhost', database: 'test' };
    
    const result = saveConnectionToSession(true, connectionInfo);
    
    expect(result).toBe(true);
    expect(window.sessionStorage.getItem('isConnected')).toBe('true');
    expect(window.localStorage.getItem('emailMgmt_isConnected')).toBe('true');
    expect(window.localStorage.getItem('emailMgmt_lastActivity')).toBeTruthy();
  });

  test('loadConnectionFromSession should load from sessionStorage first', () => {
    const connectionInfo = { server: 'localhost', database: 'test' };
    
    // Save to sessionStorage
    window.sessionStorage.setItem('isConnected', 'true');
    window.sessionStorage.setItem('connectionInfo', JSON.stringify(connectionInfo));
    
    const result = loadConnectionFromSession();
    
    expect(result.isConnected).toBe(true);
    expect(result.connectionInfo).toEqual(connectionInfo);
  });

  test('loadConnectionFromSession should fallback to localStorage', () => {
    const connectionInfo = { server: 'localhost', database: 'test' };
    
    // Save to localStorage only
    window.localStorage.setItem('emailMgmt_isConnected', 'true');
    window.localStorage.setItem('emailMgmt_connectionInfo', JSON.stringify(connectionInfo));
    window.localStorage.setItem('emailMgmt_lastActivity', Date.now().toString());
    
    const result = loadConnectionFromSession();
    
    expect(result.isConnected).toBe(true);
    expect(result.connectionInfo).toEqual(connectionInfo);
  });

  test('clearConnectionSession should clear both storages', () => {
    // Set up data
    window.sessionStorage.setItem('isConnected', 'true');
    window.localStorage.setItem('emailMgmt_isConnected', 'true');
    
    const result = clearConnectionSession();
    
    expect(result).toBe(true);
    expect(window.sessionStorage.getItem('isConnected')).toBe(null);
    expect(window.localStorage.getItem('emailMgmt_isConnected')).toBe(null);
  });

  test('updateActivityTimestamp should update timestamp', () => {
    const result = updateActivityTimestamp();
    
    expect(result).toBe(true);
    expect(window.localStorage.getItem('emailMgmt_lastActivity')).toBeTruthy();
  });

  test('isSessionValid should validate session age', () => {
    // Set recent activity
    window.localStorage.setItem('emailMgmt_lastActivity', Date.now().toString());
    
    expect(isSessionValid()).toBe(true);
    
    // Set old activity (9 hours ago)
    const oldTime = Date.now() - (9 * 60 * 60 * 1000);
    window.localStorage.setItem('emailMgmt_lastActivity', oldTime.toString());
    
    expect(isSessionValid()).toBe(false);
  });
});
