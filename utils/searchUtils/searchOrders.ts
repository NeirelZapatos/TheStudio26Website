import { IOrder } from '@/app/models/Order';
import { calculateSimilarity, tokenize } from '@/utils/stringUtils/stringSimilarity';

export const searchOrders = (
  orders: IOrder[],
  searchQuery: string
): IOrder[] => {
  if (!searchQuery.trim()) {
    return [...orders].sort((a, b) => 
      new Date(b.order_date).getTime() - new Date(a.order_date).getTime()
    );
  }
  
  const queryTrimmed = searchQuery.trim();
  const queryLower = queryTrimmed.toLowerCase();
  
  const ordersWithScores = orders.map(order => {
    const score = getOrderMatchScore(order, queryTrimmed, queryLower);
    
    const customerName = `${order.customer?.first_name || ''} ${order.customer?.last_name || ''}`.toLowerCase().trim();
    
    let sortKey = 0;
    if (customerName === queryLower) sortKey = 8;
    else if (customerName.startsWith(queryLower)) sortKey = 6;
    else if (customerName.includes(queryLower)) sortKey = 3;
    
    return { order, score, sortKey };
  });
  
  const threshold = 0.3;
  
  return ordersWithScores
    .filter(item => item.score > threshold)
    .sort((a, b) => {
      const aCategory = Math.floor(a.score);
      const bCategory = Math.floor(b.score);
      if (bCategory !== aCategory) return bCategory - aCategory;
      
      if (a.sortKey !== b.sortKey) return b.sortKey - a.sortKey;
      if (b.score !== a.score) return b.score - a.score;
      
      return new Date(b.order.order_date).getTime() - new Date(a.order.order_date).getTime();
    })
    .map(item => item.order);
};

export const formatDateMMDDYYYY = (date: Date): string => {
  const month = (date.getMonth() + 1).toString();
  const day = date.getDate().toString();
  const year = date.getFullYear().toString();
  return `${month}/${day}/${year}`;
};

export const getOrderMatchScore = (
  order: IOrder,
  queryTrimmed: string,
  queryLower: string
): number => {
  if (!queryLower) return 0;
  
  // 1. ORDER ID MATCHING (LEADING CHARACTERS ONLY)
  const orderId = order._id.toString();
  const isOrderIdSearch = /^[a-f0-9]{1,24}$/.test(queryLower);
  if (orderId === queryTrimmed) return 10.0;
  if (orderId.toLowerCase().startsWith(queryLower)) return 9.9;
  if (isOrderIdSearch) return 0;

  // 2. STRICT DATE MATCHING (MM/DD/YYYY)
  const dateObj = new Date(order.order_date);
  const formattedDate = formatDateMMDDYYYY(dateObj);
  const [month, day] = formattedDate.split('/');

  if (formattedDate === queryLower) return 9.0;
  if (queryLower === month) return 9.0;
  if (queryLower === `${month}/`) return 8.9;
  if (queryLower === `${month}/${day}`) return 8.8;
  if (queryLower === `${month}/${day}/`) return 8.7;
  if (formattedDate.startsWith(queryLower)) return 8.6;

  // 3. CUSTOMER NAME MATCHING (IMPROVED FUZZY LOGIC)
  const firstName = (order.customer?.first_name || '').toLowerCase();
  const lastName = (order.customer?.last_name || '').toLowerCase();
  const fullName = `${firstName} ${lastName}`.trim();

  if (!fullName) return 0;
  
  // Exact matches
  if (fullName === queryLower) return 8.0;
  if (firstName === queryLower || lastName === queryLower) return 7.5;
  
  // Prefix matches
  if (fullName.startsWith(queryLower)) return 7.0;
  if (firstName.startsWith(queryLower)) return 6.8;
  if (lastName.startsWith(queryLower)) return 6.5;
  
  // Contains matches
  if (fullName.includes(queryLower)) return 6.0;
  if (firstName.includes(queryLower)) return 5.8;
  if (lastName.includes(queryLower)) return 5.5;

  // One-letter matches
  if (queryLower.length === 1) {
    if (firstName.startsWith(queryLower)) return 5.0;
    if (lastName.startsWith(queryLower)) return 4.8;
  }

  // Improved fuzzy matching for typos
  // Apply fuzzy matching for queries with at least 2 characters
  if (queryLower.length >= 2) {
    // First try common typo patterns (like "nier" vs "neir")
    // Check for transposed characters
    if (queryLower.length >= 3) {
      for (let i = 0; i < queryLower.length - 1; i++) {
        // Create a variant with adjacent characters swapped
        const swapped = queryLower.slice(0, i) + 
                       queryLower[i+1] + 
                       queryLower[i] + 
                       queryLower.slice(i+2);
        
        // Check if this variant matches better
        if (firstName.includes(swapped) || lastName.includes(swapped) || 
            fullName.includes(swapped)) {
          return 5.2; // Higher than normal fuzzy match but lower than direct matches
        }
      }
    }
    
    // Standard fuzzy matching as fallback
    const queryTokens = tokenize(queryLower);
    if (queryTokens.length === 0) return 0;
    
    const nameTokens = tokenize(fullName);
    let totalScore = 0;
    let bestSingleTokenMatch = 0;
    
    for (const queryToken of queryTokens) {
      let bestMatch = 0;
      for (const nameToken of nameTokens) {
        const similarity = calculateSimilarity(queryToken, nameToken);
        bestMatch = Math.max(bestMatch, similarity);
      }
      bestSingleTokenMatch = Math.max(bestSingleTokenMatch, bestMatch);
      totalScore += bestMatch;
    }
    
    // Boost score for queries that closely match at least one token
    if (bestSingleTokenMatch > 0.8) {
      return 5.0;
    }
    
    const fuzzyScore = (totalScore / queryTokens.length) * 4.5;
    return Math.min(4.8, fuzzyScore);
  }
  
  return 0;
}