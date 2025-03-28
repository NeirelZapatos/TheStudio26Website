// searchUtils.ts
import { calculateSimilarity } from '@/utils/stringUtils/stringSimilarity';

/**
 * Check if a string could be an order ID
 * Assumes order IDs are alphanumeric and potentially have a specific format
 */
export const isOrderId = (str: string): boolean => {
  // This regex can be adjusted based on your actual order ID format
  return /^[a-zA-Z0-9]+$/.test(str) && str.length > 5;
};

/**
 * Check if a string is a date fragment or full date format
 * Expanded to catch partial dates like "2/", "3", or "2/5"
 */
export const isDateFragment = (str: string): boolean => {
  // Check for full date formats
  const fullDateRegexes = [
    /^\d{4}-\d{1,2}-\d{1,2}$/, // YYYY-MM-DD
    /^\d{1,2}\/\d{1,2}\/\d{4}$/, // MM/DD/YYYY
    /^\d{1,2}-\d{1,2}-\d{4}$/, // MM-DD-YYYY
    /^\d{1,2}\.\d{1,2}\.\d{4}$/, // MM.DD.YYYY
  ];
  
  // Check for date fragments
  const fragmentRegexes = [
    /^\d{1,2}\/\d{0,2}$/, // M/ or M/D
    /^\d{1,2}\/\d{1,2}\/\d{0,4}$/, // M/D/Y (partial)
    /^\d{1,2}-\d{0,2}$/, // M- or M-D
    /^\d{1,4}$/, // Just a number that could be day, month or year
    /^\d{1,2}\/\d{1,2}$/, // M/D
  ];
  
  return fullDateRegexes.some(regex => regex.test(str)) || 
         fragmentRegexes.some(regex => regex.test(str));
};

/**
 * Extract date components from a Date object in various formats
 * for flexible date matching
 */
export const getDateComponents = (date: Date | string | number): string[] => {
  // Ensure the input is a Date object
  const dateObj = date instanceof Date ? date : new Date(date);
  
  const components = [];
  
  // Add full date in various formats
  components.push(dateObj.toLocaleDateString('en-US')); // MM/DD/YYYY
  components.push(dateObj.toISOString().split('T')[0]); // YYYY-MM-DD
  
  // Add individual components
  const month = dateObj.getMonth() + 1;
  const day = dateObj.getDate();
  const year = dateObj.getFullYear();
  
  // Add MM/DD
  components.push(`${month}/${day}`);
  // Add single digits for month and day
  components.push(`${month}`);
  components.push(`${day}`);
  // Add month/day fragments
  components.push(`${month}/`);
  components.push(`${month}/${day}/`);
  
  // Add numeric components as strings
  components.push(month.toString());
  components.push(day.toString());
  components.push(year.toString());
  
  // Add MM/DD/YY format
  const shortYear = year.toString().slice(2);
  components.push(`${month}/${day}/${shortYear}`);
  
  return components;
};

/**
 * Calculate date match score - how well a query matches a date
 */
export const getDateMatchScore = (dateStr: string, query: string): number => {
  // Normalize both strings
  const normalizedDate = dateStr.toLowerCase().trim();
  const normalizedQuery = query.toLowerCase().trim();
  
  // Exact match
  if (normalizedDate === normalizedQuery) {
    return 10;
  }
  
  // Check if the date contains the query exactly
  if (normalizedDate.includes(normalizedQuery)) {
    return 9 + (normalizedQuery.length / normalizedDate.length);
  }
  
  // For single digit searches, check exact matches for day or month
  if (/^\d{1}$/.test(normalizedQuery)) {
    const dayMatch = normalizedDate.match(/\/(\d{1,2})\//);
    const monthMatch = normalizedDate.match(/^(\d{1,2})\//);
    
    if (dayMatch && dayMatch[1] === normalizedQuery) {
      return 8;
    }
    if (monthMatch && monthMatch[1] === normalizedQuery) {
      return 8;
    }
  }
  
  // Calculate similarity
  return calculateSimilarity(normalizedDate, normalizedQuery) * 7;
};