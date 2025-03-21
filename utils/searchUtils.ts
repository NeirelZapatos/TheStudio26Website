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
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .split(/\s+/) // Split on whitespace
    .filter(Boolean); // Remove empty tokens
};

/**
 * getMatchScore:
 * Calculates a match score for an order based on how well it matches the search query.
 * Uses fuzzy matching to account for typos and slight variations.
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
  
  // Fields to search: customer name, order ID, and date
  const fieldsToSearch = [
    order._id.toString().toLowerCase(), // Order ID
    `${order.customer?.first_name || ''} ${order.customer?.last_name || ''}`.toLowerCase().trim(), // Customer name
    order.order_date ? new Date(order.order_date).toLocaleDateString('en-US').toLowerCase() : '', // Order date in local format
    order.order_date ? new Date(order.order_date).toISOString().split('T')[0].toLowerCase() : '' // Order date in YYYY-MM-DD format
  ];
  
  // For each field, calculate best match against each query token
  let totalScore = 0;
  
  for (const field of fieldsToSearch) {
    const fieldTokens = tokenize(field);
    
    // For each query token, find best matching field token
    for (const queryToken of queryTokens) {
      let bestTokenMatch = 0;
      
      // Exact field match gets highest score
      if (field.includes(queryToken)) {
        bestTokenMatch = 1.0;
      } 
      // Otherwise check individual tokens
      else {
        for (const fieldToken of fieldTokens) {
          const similarity = calculateSimilarity(queryToken, fieldToken);
          bestTokenMatch = Math.max(bestTokenMatch, similarity);
        }
      }
      
      // Accumulate scores
      totalScore += bestTokenMatch;
    }
  }
  
  // Normalize by number of query tokens and fields
  const normalizedScore = (totalScore / queryTokens.length) * 10;
  
  return normalizedScore;
};

/**
 * searchOrders:
 * Filters and sorts orders based on the search query with fuzzy matching.
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

  // Filter out poor matches (threshold can be adjusted)
  const threshold = 2.0; 
  const filteredOrders = ordersWithScores
    .filter(item => item.score > threshold)
    .sort((a, b) => {
      // Primary sort by score
      if (b.score !== a.score) return b.score - a.score;
      
      // Secondary sort by date (newest first)
      return new Date(b.order.order_date).getTime() - new Date(a.order.order_date).getTime();
    })
    .map(item => item.order);

  return filteredOrders;
};