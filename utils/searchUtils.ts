import { IOrder } from '@/app/models/Order';

/**
 * Calculates the Levenshtein distance between two strings
 * This measures how many single-character edits are needed to change one string into another
 */
export const levenshteinDistance = (str1: string, str2: string): number => {
  const track = Array(str2.length + 1).fill(null).map(() => 
    Array(str1.length + 1).fill(null));
  
  for (let i = 0; i <= str1.length; i += 1) {
    track[0][i] = i;
  }
  
  for (let j = 0; j <= str2.length; j += 1) {
    track[j][0] = j;
  }
  
  for (let j = 1; j <= str2.length; j += 1) {
    for (let i = 1; i <= str1.length; i += 1) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      track[j][i] = Math.min(
        track[j][i - 1] + 1, // deletion
        track[j - 1][i] + 1, // insertion
        track[j - 1][i - 1] + indicator, // substitution
      );
    }
  }
  
  return track[str2.length][str1.length];
};

/**
 * Calculate similarity score between two strings (0-1 range)
 * 1 means identical, 0 means completely different
 */
export const calculateSimilarity = (str1: string, str2: string): number => {
  if (!str1.length || !str2.length) return 0;
  
  const maxLength = Math.max(str1.length, str2.length);
  const distance = levenshteinDistance(str1, str2);
  return 1 - distance / maxLength;
};

/**
 * Break a string into tokens (words)
 */
export const tokenize = (str: string): string[] => {
  return str.toLowerCase()
    .replace(/[^\w\s/-]/g, '') // Remove punctuation except hyphens and slashes for dates
    .split(/\s+/) // Split on whitespace
    .filter(Boolean); // Remove empty tokens
};

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

/**
 * getMatchScore:
 * Calculates a match score for an order based on how well it matches the search query.
 * Uses fuzzy matching for customer names, improved date matching, and exact matching for order IDs.
 * 
 * @param order - The order object.
 * @param searchQuery - The search query.
 * @returns A score indicating the strength of the match (0-10 range).
 */
export const getMatchScore = (order: IOrder, searchQuery: string): number => {
  if (!searchQuery) return 0; // Return 0 if no search query

  // Normalize and tokenize search query
  const queryTokens = tokenize(searchQuery);
  if (queryTokens.length === 0) return 0;
  
  const queryLower = searchQuery.toLowerCase().trim();
  
  // Check for exact ID match first (highest priority)
  const orderId = order._id.toString().toLowerCase();
  if (orderId.includes(queryLower)) {
    // Score based on how much of the ID is matched
    return 10 * (queryLower.length / orderId.length) + 5;
  }
  
  // Check for date matches - improved to handle fragments
  const orderDateObj = new Date(order.order_date); // Ensure this is a Date object
  const dateComponents = getDateComponents(orderDateObj);
  
  // If query looks like a date fragment
  if (isDateFragment(queryLower)) {
    let bestDateScore = 0;
    
    // Check against all date format variations
    for (const dateStr of dateComponents) {
      const score = getDateMatchScore(dateStr, queryLower);
      bestDateScore = Math.max(bestDateScore, score);
    }
    
    if (bestDateScore > 0) {
      return bestDateScore;
    }
  }
  
  // For everything else (likely customer name searches), use fuzzy matching
  // Customer name field to search
  const customerName = `${order.customer?.first_name || ''} ${order.customer?.last_name || ''}`.toLowerCase().trim();
  const customerTokens = tokenize(customerName);
  
  let totalScore = 0;
  
  // For each query token, find best matching customer name token
  for (const queryToken of queryTokens) {
    let bestTokenMatch = 0;
    
    // Exact field match gets highest score
    if (customerName.includes(queryToken)) {
      bestTokenMatch = 1.0;
    } 
    // Otherwise check individual tokens
    else {
      for (const fieldToken of customerTokens) {
        const similarity = calculateSimilarity(queryToken, fieldToken);
        bestTokenMatch = Math.max(bestTokenMatch, similarity);
      }
    }
    
    // Accumulate scores
    totalScore += bestTokenMatch;
  }
  
  // Normalize by number of query tokens
  const normalizedScore = (totalScore / queryTokens.length) * 6; // Lower max score for name matches
  
  return normalizedScore;
};

/**
 * searchOrders:
 * Filters and sorts orders based on the search query with fuzzy matching for names,
 * improved date fragment matching, and exact matching for order IDs.
 * Results are sorted with closest matches first.
 * 
 * @param orders - Array of orders to filter.
 * @param searchQuery - The search query.
 * @returns A filtered and sorted array of orders.
 */
export const searchOrders = (
  orders: IOrder[],
  searchQuery: string
): IOrder[] => {
  if (!searchQuery.trim()) {
    return [...orders].sort((a, b) => 
      new Date(b.order_date).getTime() - new Date(a.order_date).getTime()
    );
  }

  // Calculate scores for all orders
  const ordersWithScores = orders.map(order => ({
    order,
    score: getMatchScore(order, searchQuery)
  }));

  // Lower threshold for date fragments to catch more potential matches
  const threshold = isDateFragment(searchQuery.trim()) ? 1.0 : 2.0;
  
  const filteredOrders = ordersWithScores
    .filter(item => item.score > threshold)
    .sort((a, b) => {
      // Primary sort by score (highest first)
      if (b.score !== a.score) return b.score - a.score;
      
      // Secondary sort by date (newest first)
      return new Date(b.order.order_date).getTime() - new Date(a.order.order_date).getTime();
    })
    .map(item => item.order);

  return filteredOrders;
};