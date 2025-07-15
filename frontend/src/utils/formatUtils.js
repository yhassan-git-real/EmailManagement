/**
 * Utility functions for formatting values in the UI
 */

/**
 * Format processing time from seconds to a human-readable format
 * @param {number|string} seconds - Processing time in seconds
 * @returns {string} - Formatted time string
 */
export const formatProcessingTime = (seconds) => {
  if (seconds === null || seconds === undefined) return '0s';
  
  // Convert to number if it's a string
  const numSeconds = typeof seconds === 'string' ? parseFloat(seconds) : seconds;
  
  // Handle invalid input
  if (isNaN(numSeconds)) return '0s';
  
  // If less than 1 second, show milliseconds
  if (numSeconds < 1) {
    return `${Math.round(numSeconds * 1000)}ms`;
  }
  
  // If less than 60 seconds, show as seconds with one decimal
  if (numSeconds < 60) {
    return `${numSeconds.toFixed(1)}s`;
  }
  
  // If less than an hour, show as minutes and seconds
  if (numSeconds < 3600) {
    const minutes = Math.floor(numSeconds / 60);
    const remainingSeconds = Math.round(numSeconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  }
  
  // Otherwise, show as hours, minutes, and seconds
  const hours = Math.floor(numSeconds / 3600);
  const minutes = Math.floor((numSeconds % 3600) / 60);
  const remainingSeconds = Math.round(numSeconds % 60);
  return `${hours}h ${minutes}m ${remainingSeconds}s`;
};

/**
 * Format percentage values to ensure they have consistent display
 * @param {number|string} percentage - Percentage value (with or without % sign)
 * @returns {string} - Formatted percentage string
 */
export const formatPercentage = (percentage) => {
  if (percentage === null || percentage === undefined) return '0%';
  
  // If it's already a string with a % sign, return it
  if (typeof percentage === 'string' && percentage.includes('%')) {
    return percentage;
  }
  
  // Convert to number if it's a string
  const numPercentage = typeof percentage === 'string' ? parseFloat(percentage) : percentage;
  
  // Handle invalid input
  if (isNaN(numPercentage)) return '0%';
  
  // Format with one decimal place and add % sign
  return `${numPercentage.toFixed(1)}%`;
};

/**
 * Format number values with thousands separators
 * @param {number|string} value - Numeric value
 * @returns {string} - Formatted number string
 */
export const formatNumber = (value) => {
  if (value === null || value === undefined) return '0';
  
  // Convert to number if it's a string
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  // Handle invalid input
  if (isNaN(numValue)) return '0';
  
  // Format with thousands separators
  return numValue.toLocaleString();
};
