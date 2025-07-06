/**
 * Utility functions for date formatting
 */

/**
 * Format date in a clean, professional way (Month Day, Year)
 * @returns {string} Formatted date string
 */
export const getFormattedDate = () => {
    return new Date().toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

/**
 * Format time to be more readable (HH:MM AM/PM)
 * @param {string} dateString - ISO date string to format
 * @returns {string} Formatted time string
 */
export const formatConnectionTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};
