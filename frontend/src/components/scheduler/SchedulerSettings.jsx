import React, { useState, useEffect } from 'react';
import { getScheduleSettings, updateScheduleSettings } from '../../utils/automationApi';
import { ClockIcon } from '@heroicons/react/24/outline';

const SchedulerSettings = ({ onSettingsChange }) => {
  const [settings, setSettings] = useState({
    enabled: false,
    frequency: 'daily',
    time: '09:00',
    days: [],
    lastRun: null,
    nextRun: null
  });
  const [loading, setLoading] = useState(false);

  // Fetch current schedule settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const response = await getScheduleSettings();
        
        if (response.success) {
          setSettings(response.data);
        }
      } catch (error) {
        console.error('Error fetching schedule settings:', error);
        // Removed toast notification as per requirement
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // Handle toggling scheduler
  const handleToggleScheduler = async (enabled) => {
    try {
      setLoading(true);
      const updatedSettings = { ...settings, enabled };
      
      const response = await updateScheduleSettings(updatedSettings);
      
      if (response.success) {
        setSettings(response.data);
        // Removed toast notification for toggling scheduler - improves UX
        
        if (onSettingsChange) {
          onSettingsChange(response.data);
        }
      }
    } catch (error) {
      console.error('Error updating scheduler settings:', error);
      // Removed toast notification as per requirement
    } finally {
      setLoading(false);
    }
  };

  // Handle frequency change
  const handleFrequencyChange = async (frequency) => {
    try {
      setLoading(true);
      let updatedSettings = { ...settings, frequency };
      
      // Reset days when switching frequency
      if (frequency === 'daily') {
        updatedSettings.days = [];
      } else if (frequency === 'weekly' && (!settings.days || settings.days.length === 0)) {
        updatedSettings.days = [1]; // Default to Monday
      } else if (frequency === 'monthly' && (!settings.days || settings.days.length === 0)) {
        updatedSettings.days = [1]; // Default to 1st of month
      }
      
      const response = await updateScheduleSettings(updatedSettings);
      
      if (response.success) {
        setSettings(response.data);
        
        if (onSettingsChange) {
          onSettingsChange(response.data);
        }
      }
    } catch (error) {
      console.error('Error updating scheduler frequency:', error);
      // Removed toast notification as per requirement
    } finally {
      setLoading(false);
    }
  };

  // Handle time change
  const handleTimeChange = async (time) => {
    try {
      setLoading(true);
      const updatedSettings = { ...settings, time };
      
      const response = await updateScheduleSettings(updatedSettings);
      
      if (response.success) {
        setSettings(response.data);
        
        if (onSettingsChange) {
          onSettingsChange(response.data);
        }
      }
    } catch (error) {
      console.error('Error updating scheduler time:', error);
      // Removed toast notification as per requirement
    } finally {
      setLoading(false);
    }
  };

  // Handle days change for weekly/monthly
  const handleDayChange = async (day, isChecked) => {
    try {
      setLoading(true);
      let newDays = [...(settings.days || [])];
      
      if (isChecked && !newDays.includes(day)) {
        newDays.push(day);
      } else if (!isChecked && newDays.includes(day)) {
        newDays = newDays.filter(d => d !== day);
      }
      
      // Ensure at least one day is selected
      if (newDays.length === 0) {
        // Removed toast notification as per requirement
        // Still return early to prevent invalid state
        setLoading(false);
        return;
      }
      
      const updatedSettings = { ...settings, days: newDays };
      const response = await updateScheduleSettings(updatedSettings);
      
      if (response.success) {
        setSettings(response.data);
        
        if (onSettingsChange) {
          onSettingsChange(response.data);
        }
      }
    } catch (error) {
      console.error('Error updating scheduler days:', error);
      // Removed toast notification as per requirement
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Not scheduled';
    
    const date = new Date(dateString);
    const options = { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric', 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    };
    return date.toLocaleString(undefined, options);
  };

  return (
    <div className="bg-white rounded-lg p-3.5 border border-gray-200 shadow-sm">
      <div className="flex items-center mb-3.5">
        <input
          type="checkbox"
          id="schedulerEnabled"
          checked={settings.enabled}
          onChange={(e) => handleToggleScheduler(e.target.checked)}
          disabled={loading}
          className="h-4 w-4 text-primary-600 focus:ring-primary-400 focus:ring-offset-0 focus:ring-1 border-gray-300 rounded shadow-sm"
        />
        <label htmlFor="schedulerEnabled" className="ml-2 text-sm font-semibold text-gray-800 tracking-tight">
          Enable automated scheduling
        </label>
      </div>
      
      <div className={`transition-opacity duration-200 ${settings.enabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
        <div className="flex flex-wrap md:flex-nowrap gap-3 items-end">
          {/* Frequency Selector - Compact Fixed Width */}
          <div className="w-full md:w-[150px] transition-all duration-200">
            <label htmlFor="frequency" className="block text-xs font-semibold text-gray-700 mb-1 tracking-tight">
              Frequency
            </label>
            <div className="relative">
              <select
                id="frequency"
                value={settings.frequency}
                onChange={(e) => handleFrequencyChange(e.target.value)}
                disabled={loading || !settings.enabled}
                className="block w-full pl-3 pr-8 py-1.5 text-sm font-medium border border-gray-300 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-200 rounded-md shadow-sm bg-white appearance-none text-gray-800"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-primary-500">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
            </div>
          </div>

          {/* Time Selector - Compact Fixed Width */}
          <div className="w-full md:w-[120px] transition-all duration-200">
            <label htmlFor="time" className="block text-xs font-semibold text-gray-700 mb-1 tracking-tight">
              Time
            </label>
            <div className="relative">
              <input
                type="time"
                id="time"
                value={settings.time}
                onChange={(e) => handleTimeChange(e.target.value)}
                disabled={loading || !settings.enabled}
                className="block w-full pl-3 pr-8 py-1.5 text-sm font-medium border border-gray-300 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-200 rounded-md shadow-sm text-gray-800"
              />
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-primary-500">
                <ClockIcon className="h-4 w-4" />
              </div>
            </div>
          </div>
          
          {/* Spacer for the right side */}
          <div className="hidden md:block flex-grow"></div>
        </div>

        {/* Weekly Day Selector - Enhanced UI */}
        {settings.frequency === 'weekly' && (
          <div className="mt-3.5 w-full md:w-[290px] animate-fadeIn">
            <label className="block text-xs font-semibold text-gray-700 mb-2 tracking-tight">
              Days of the Week
            </label>
            <div className="flex justify-between gap-1.5">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                <div key={index} 
                  className={`w-8 h-8 flex items-center justify-center rounded-full cursor-pointer text-xs font-medium transition-all duration-150
                    ${(settings.days || []).includes(index) 
                      ? 'bg-primary-100 border border-primary-300 text-primary-700 shadow-sm font-semibold' 
                      : 'bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100 hover:border-gray-300'}`}
                  onClick={() => !loading && settings.enabled && handleDayChange(index, !(settings.days || []).includes(index))}>
                  {day}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Monthly Day Selector - Enhanced Grid UI */}
        {settings.frequency === 'monthly' && (
          <div className="mt-3.5 animate-fadeIn">
            <label className="block text-xs font-semibold text-gray-700 mb-2 tracking-tight">
              Days of the Month
            </label>
            <div className="grid grid-cols-7 gap-1 max-h-[130px] overflow-y-auto p-1.5 bg-gray-50 rounded-md border border-gray-200">
              {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                <div key={day}
                  className={`w-7 h-7 flex items-center justify-center rounded-md cursor-pointer text-xs font-medium transition-all duration-150
                    ${(settings.days || []).includes(day) 
                      ? 'bg-primary-100 border border-primary-300 text-primary-700 shadow-sm font-semibold' 
                      : 'bg-white border border-gray-100 text-gray-600 hover:bg-gray-100'}`}
                  onClick={() => !loading && settings.enabled && handleDayChange(day, !(settings.days || []).includes(day))}>
                  {day}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Next Run Information - Enhanced UI */}
        {settings.enabled && settings.nextRun && (
          <div className="mt-3 bg-primary-50 p-2 rounded-md border border-primary-100 shadow-sm flex items-start">
            <div className="bg-primary-100 rounded-full p-1 mr-2 flex-shrink-0">
              <ClockIcon className="h-3.5 w-3.5 text-primary-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-primary-800 leading-tight">
                Next run: <span className="text-primary-700">{formatDate(settings.nextRun)}</span>
              </p>
              {settings.lastRun && (
                <p className="text-2xs font-medium text-primary-600 mt-0.5 opacity-80">
                  Last run: {formatDate(settings.lastRun)}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SchedulerSettings;
