import React, { useState, useEffect } from 'react';
import { getScheduleSettings, updateScheduleSettings } from '../utils/automationApi';
import { toast } from 'react-toastify';
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
        toast.error('Failed to load scheduler settings');
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
        toast.success(`Scheduler ${enabled ? 'enabled' : 'disabled'}`);
        
        if (onSettingsChange) {
          onSettingsChange(response.data);
        }
      }
    } catch (error) {
      console.error('Error updating scheduler settings:', error);
      toast.error('Failed to update scheduler settings');
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
      toast.error('Failed to update scheduler frequency');
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
      toast.error('Failed to update scheduler time');
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
        toast.error('Please select at least one day');
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
      toast.error('Failed to update scheduler days');
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Not scheduled';
    
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <h3 className="text-sm font-medium text-gray-700 mb-3">Email Automation Scheduler</h3>
      
      <div className="flex flex-col gap-4">
        {/* Enable/Disable Toggle */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="schedulerEnabled"
            checked={settings.enabled}
            onChange={(e) => handleToggleScheduler(e.target.checked)}
            disabled={loading}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label htmlFor="schedulerEnabled" className="ml-2 block text-sm text-gray-700">
            Enable automated scheduling
          </label>
        </div>

        {/* Schedule Settings */}
        <div className={settings.enabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}>
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Frequency Selector */}
            <div>
              <label htmlFor="frequency" className="block text-xs font-medium text-gray-700 mb-1">
                Frequency
              </label>
              <select
                id="frequency"
                value={settings.frequency}
                onChange={(e) => handleFrequencyChange(e.target.value)}
                disabled={loading || !settings.enabled}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            {/* Time Selector */}
            <div>
              <label htmlFor="time" className="block text-xs font-medium text-gray-700 mb-1">
                Time (24-hour format)
              </label>
              <input
                type="time"
                id="time"
                value={settings.time}
                onChange={(e) => handleTimeChange(e.target.value)}
                disabled={loading || !settings.enabled}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              />
            </div>
          </div>

          {/* Weekly Day Selector */}
          {settings.frequency === 'weekly' && (
            <div className="mt-4">
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Days of the Week
              </label>
              <div className="flex flex-wrap gap-2">
                {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, index) => (
                  <div key={day} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`day-${index}`}
                      checked={(settings.days || []).includes(index)}
                      onChange={(e) => handleDayChange(index, e.target.checked)}
                      disabled={loading || !settings.enabled}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`day-${index}`} className="ml-2 block text-xs text-gray-700">
                      {day}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Monthly Day Selector */}
          {settings.frequency === 'monthly' && (
            <div className="mt-4">
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Days of the Month
              </label>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border border-gray-200 rounded">
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                  <div key={day} className="flex items-center w-12">
                    <input
                      type="checkbox"
                      id={`monthly-day-${day}`}
                      checked={(settings.days || []).includes(day)}
                      onChange={(e) => handleDayChange(day, e.target.checked)}
                      disabled={loading || !settings.enabled}
                      className="h-3 w-3 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`monthly-day-${day}`} className="ml-1 block text-xs text-gray-700">
                      {day}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Next Run Information */}
          {settings.enabled && settings.nextRun && (
            <div className="mt-4 bg-blue-50 p-3 rounded-md border border-blue-100 flex items-start">
              <ClockIcon className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
              <div>
                <div className="text-xs font-medium text-blue-700">Next scheduled run:</div>
                <div className="text-sm text-blue-800">{formatDate(settings.nextRun)}</div>
                
                {settings.lastRun && (
                  <div className="text-xs text-blue-600 mt-1">
                    Last run: {formatDate(settings.lastRun)}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SchedulerSettings;
