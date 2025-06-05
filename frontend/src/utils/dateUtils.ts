/**
 * Date and time utility functions for consistent formatting across the application
 */
 
// Ensure that this file is treated as a proper ES module
export {};

/**
 * Formats a timestamp (either Date object or string) to a time string (HH:MM)
 * 
 * @param timestamp - Date object or string representation of a date
 * @returns Formatted time string (HH:MM format)
 */
export const formatTimeString = (timestamp: Date | string): string => {
  if (!timestamp) {
    return 'Unknown time';
  }

  try {
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid time';
    }
    
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  } catch (e) {
    console.error('Error formatting timestamp:', e);
    return typeof timestamp === 'string' ? timestamp : 'Invalid time';
  }
};

/**
 * Formats a timestamp (either Date object or string) to a date string (MM/DD/YYYY)
 * 
 * @param timestamp - Date object or string representation of a date
 * @returns Formatted date string
 */
export const formatDateString = (timestamp: Date | string): string => {
  if (!timestamp) {
    return 'Unknown date';
  }

  try {
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    return date.toLocaleDateString();
  } catch (e) {
    console.error('Error formatting date:', e);
    return 'Invalid date';
  }
};

/**
 * Ensures a timestamp is a Date object
 * 
 * @param timestamp - Date object or string representation of a date
 * @returns Date object
 */
export const ensureDate = (timestamp: Date | string | undefined | null): Date => {
  if (!timestamp) {
    return new Date();
  }

  if (timestamp instanceof Date) {
    return timestamp;
  }
  
  try {
    const date = new Date(timestamp);
    return isNaN(date.getTime()) ? new Date() : date;
  } catch (e) {
    console.error('Error parsing date:', e);
    return new Date();
  }
};
