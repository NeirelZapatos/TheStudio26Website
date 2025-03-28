// searchOrders.ts
import { IOrder } from '@/app/models/Order';
import { calculateSimilarity, tokenize } from '@/utils/stringUtils/stringSimilarity';

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

  const threshold = 2.0;
  
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