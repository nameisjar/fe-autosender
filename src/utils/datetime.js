/**
 * Utility functions untuk standardisasi datetime handling
 * Mengatasi masalah timezone dan format datetime yang konsisten
 */

/**
 * Convert datetime-local input to ISO string with proper timezone handling
 * @param {string} datetimeLocal - datetime-local value from input
 * @returns {string} ISO string
 */
export const convertToServerTime = (datetimeLocal) => {
  if (!datetimeLocal) return '';
  
  // Create date object from datetime-local input (assumes local timezone)
  const localDate = new Date(datetimeLocal);
  
  // Validate date
  if (isNaN(localDate.getTime())) {
    console.warn('Invalid datetime input:', datetimeLocal);
    return '';
  }
  
  // Convert to ISO string which includes timezone info
  // This ensures consistent behavior between local and deployed environments
  return localDate.toISOString();
};

/**
 * Format ISO string untuk display dengan timezone lokal Indonesia
 * @param {string} isoString - ISO datetime string
 * @returns {string} Formatted local time
 */
export const formatLocalTime = (isoString) => {
  if (!isoString) return '';
  
  try {
    const date = new Date(isoString);
    return date.toLocaleString('id-ID', {
      year: 'numeric',
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Jakarta'
    });
  } catch (error) {
    console.warn('Error formatting date:', error);
    return '';
  }
};

/**
 * Convert ISO string kembali ke format datetime-local untuk input
 * @param {string} isoString - ISO datetime string
 * @returns {string} datetime-local format
 */
export const convertToLocalInput = (isoString) => {
  if (!isoString) return '';
  
  try {
    const date = new Date(isoString);
    // Convert to local timezone and format for datetime-local input
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch (error) {
    console.warn('Error converting to local input:', error);
    return '';
  }
};

/**
 * Validate datetime input
 * @param {string} dateTime - datetime string to validate
 * @returns {boolean} true if valid
 */
export const isValidDateTime = (dateTime) => {
  if (!dateTime) return false;
  
  const date = new Date(dateTime);
  return !isNaN(date.getTime());
};

/**
 * Add time interval to date
 * @param {Date|string} baseDate - base date
 * @param {string} recurrence - 'minute', 'hourly', 'daily', 'weekly', 'monthly'
 * @param {number} interval - interval count
 * @returns {Date} new date with interval added
 */
export const addInterval = (baseDate, recurrence, interval) => {
  const date = new Date(baseDate);
  const intervalNum = Number(interval) || 1;
  
  switch (recurrence) {
    case 'minute':
      date.setMinutes(date.getMinutes() + intervalNum);
      break;
    case 'hourly':
      date.setHours(date.getHours() + intervalNum);
      break;
    case 'daily':
      date.setDate(date.getDate() + intervalNum);
      break;
    case 'weekly':
      date.setDate(date.getDate() + intervalNum * 7);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + intervalNum);
      break;
    default:
      console.warn('Unknown recurrence type:', recurrence);
  }
  
  return date;
};

/**
 * Calculate estimated count of recurring schedules
 * @param {string} startDate - start datetime
 * @param {string} endDate - end datetime
 * @param {string} recurrence - recurrence type
 * @param {number} interval - interval count
 * @returns {number} estimated count
 */
export const calculateEstimatedCount = (startDate, endDate, recurrence, interval) => {
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
      return 0;
    }
    
    let count = 0;
    const current = new Date(start);
    const maxIterations = 10000; // Safety limit
    
    while (current <= end && count < maxIterations) {
      count++;
      current.setTime(addInterval(current, recurrence, interval).getTime());
    }
    
    return count >= maxIterations ? `${maxIterations}+` : count;
  } catch (error) {
    console.warn('Error calculating estimated count:', error);
    return 0;
  }
};