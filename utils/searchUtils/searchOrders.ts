import { IOrder } from '@/app/models/Order';
import { calculateSimilarity, tokenize } from '@/utils/stringUtils/stringSimilarity';

/**
 * searchOrders:
 * Filters and sorts orders based on the search query with fuzzy matching for customer names,
 * exact matching for order ID and date as specified.
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
    // If no search query, return orders sorted by date (newest first)
    return [...orders].sort((a, b) => 
      new Date(b.order_date).getTime() - new Date(a.order_date).getTime()
    );
  }
  
  const queryLower = searchQuery.toLowerCase().trim();
  
  // Calculate match scores for orders
  const ordersWithScores = orders.map(order => {
    const score = getOrderMatchScore(order, queryLower);
    
    // Customer name matching details for sorting
    const customerName = `${order.customer?.first_name || ''} ${order.customer?.last_name || ''}`.toLowerCase().trim();
    
    // Create a sortKey for more precise sorting of name matches
    let sortKey = 0;
    
    // Prioritize exact matches and prefix matches for customer names
    if (customerName === queryLower) sortKey = 8;
    else if (customerName.startsWith(queryLower)) sortKey = 6;
    else if (customerName.includes(queryLower)) sortKey = 3;
    
    return {
      order,
      score,
      sortKey
    };
  });
  
  // Threshold for fuzzy matching
  const threshold = 0.3;
  
  const filteredOrders = ordersWithScores
    .filter(item => item.score > threshold)
    .sort((a, b) => {
      // First sort by score category (ID, date, customer name)
      const aCategory = Math.floor(a.score);
      const bCategory = Math.floor(b.score);
      if (bCategory !== aCategory) return bCategory - aCategory;
      
      // Then by sortKey for customer names (prioritize prefix matches)
      if (a.sortKey !== b.sortKey) return b.sortKey - a.sortKey;
      
      // Then by the precise score within category
      if (b.score !== a.score) return b.score - a.score;
      
      // Finally by date (newest first)
      return new Date(b.order.order_date).getTime() - new Date(a.order.order_date).getTime();
    })
    .map(item => item.order);
    
  return filteredOrders;
};

/**
 * getOrderMatchScore:
 * Calculates a match score for an order based on how well it matches the search query.
 * Uses exact matching for order ID and date, fuzzy matching for customer name.
 * 
 * Consistent scoring system:
 * - Exact ID match: 10.0
 * - Partial ID match: 9.8
 * - Exact date match: 9.0
 * - Partial date match: 8.8 or 8.5
 * - Individual date component match: 8.3
 * - Customer name match: 0.0-8.0 based on fuzzy matching quality
 * 
 * @param order - The order object.
 * @param queryLower - The search query (lowercase and trimmed).
 * @returns A score indicating the strength of the match (0-10 range).
 */
export const getOrderMatchScore = (order: IOrder, queryLower: string): number => {
  if (!queryLower) return 0;
  
  // Check order ID - distinguish between exact and partial matches
  const orderId = order._id.toString().toLowerCase();
  if (orderId === queryLower) {
    return 10.0; // Exact ID match gets highest score
  } else if (orderId.includes(queryLower)) {
    return 9.8; // Partial ID match gets slightly lower score
  }
  
  // Check order date with exact match prioritization
  const orderDate = new Date(order.order_date).toISOString().split('T')[0]; // YYYY-MM-DD format
  const orderDateObj = new Date(order.order_date);
  
  // Format dates for comparison
  const monthDayYear = `${orderDateObj.getMonth() + 1}/${orderDateObj.getDate()}/${orderDateObj.getFullYear()}`;
  const monthDay = `${orderDateObj.getMonth() + 1}/${orderDateObj.getDate()}`;
  
  // Exact date match checks
  if (orderDate === queryLower || monthDayYear === queryLower) {
    return 9.0; // Exact date match (YYYY-MM-DD or MM/DD/YYYY)
  } 
  // Partial date match checks
  else if (queryLower.includes('/')) {
    if (monthDayYear.startsWith(queryLower) || monthDay === queryLower) {
      return 8.8; // Partial date match (MM/DD format)
    } else if (monthDayYear.includes(queryLower)) {
      return 8.5; // Date contains the query
    }
  } else if (orderDate.includes(queryLower)) {
    return 8.5; // ISO format contains the query
  }
  // Add check for individual date components (day, month, year)
  else if (!queryLower.includes('/')) {
    // Make sure we're converting numeric values to strings before comparison
    const day = orderDateObj.getDate().toString();
    const month = (orderDateObj.getMonth() + 1).toString();
    const year = orderDateObj.getFullYear().toString();
    
    // Ensure we match the string at the start of the date components
    if (day === queryLower || month === queryLower || 
        year.startsWith(queryLower) || 
        day.startsWith(queryLower) || 
        month.startsWith(queryLower)) {
      return 8.3; // Match for individual date components
    }
  }
  
  // Customer name matching - third priority (up to 8.0)
  const firstName = (order.customer?.first_name || '').toLowerCase();
  const lastName = (order.customer?.last_name || '').toLowerCase();
  const fullName = `${firstName} ${lastName}`.trim();
  
  if (!fullName) return 0; // No customer name to match
  
  // Exact full name match gets highest name score
  if (fullName === queryLower) {
    return 8.0;
  }
  
  // Check if query is an exact match for first or last name
  if (firstName === queryLower || lastName === queryLower) {
    return 7.5;
  }
  
  // Check if full name starts with query (e.g. "Jo" matches "John Smith")
  if (fullName.startsWith(queryLower)) {
    return 7.0;
  }
  
  // Check if first name or last name starts with query
  if (firstName.startsWith(queryLower)) {
    return 6.8; // Prioritize first name matches slightly
  }
  
  if (lastName.startsWith(queryLower)) {
    return 6.5;
  }
  
  // Check if query appears anywhere in the name
  if (fullName.includes(queryLower)) {
    return 6.0;
  }
  
  if (firstName.includes(queryLower)) {
    return 5.8; // Prioritize first name matches slightly
  }
  
  if (lastName.includes(queryLower)) {
    return 5.5;
  }
  
  // For one-letter searches, prioritize first letter matches
  if (queryLower.length === 1) {
    if (firstName.startsWith(queryLower)) return 5.0;
    if (lastName.startsWith(queryLower)) return 4.8;
  }
  
  // Fuzzy matching for more complex cases
  const queryTokens = tokenize(queryLower);
  if (queryTokens.length === 0) return 0;
  
  const nameTokens = tokenize(fullName);
  let totalScore = 0;
  let matchCount = 0;
  
  // Calculate fuzzy match score for each query token against name tokens
  for (const queryToken of queryTokens) {
    let bestTokenMatch = 0;
    
    for (const nameToken of nameTokens) {
      const similarity = calculateSimilarity(queryToken, nameToken);
      bestTokenMatch = Math.max(bestTokenMatch, similarity);
    }
    
    if (bestTokenMatch > 0.6) { // Threshold for considering a token match
      matchCount++;
    }
    
    totalScore += bestTokenMatch;
  }
  
  // Adjust score based on how many tokens matched
  const matchRatio = queryTokens.length > 0 ? matchCount / queryTokens.length : 0;
  
  // Calculate normalized score, max of 5.0 for fuzzy matches
  let fuzzyScore = (totalScore / Math.max(1, queryTokens.length)) * 5.0;
  
  // Boost score if high percentage of tokens matched well
  if (matchRatio > 0.7) {
    fuzzyScore *= 1.2;
  }
  
  // Cap the fuzzy name match score at 5.0
  return Math.min(5.0, fuzzyScore);
};