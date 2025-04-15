import { ICustomer } from '@/app/models/Customer';
import { calculateSimilarity, tokenize } from '@/utils/stringUtils/stringSimilarity';

/**
 * searchCustomers:
 * Filters and sorts customers based on the search query with fuzzy matching for names,
 * exact matching for email and phone number as specified.
 * Results are sorted with closest matches first.
 * 
 * @param customers - Array of customers to filter.
 * @param searchQuery - The search query.
 * @returns A filtered and sorted array of customers.
 */
export const searchCustomers = (
  customers: ICustomer[],
  searchQuery: string
): ICustomer[] => {
  if (!searchQuery.trim()) {
    // If no search query, return customers sorted by first name
    return [...customers].sort((a, b) => 
      (a.first_name + ' ' + a.last_name).localeCompare(b.first_name + ' ' + b.last_name)
    );
  }
  
  const queryLower = searchQuery.toLowerCase().trim();
  
  // Calculate match scores for customers
  const customersWithScores = customers.map(customer => {
    const score = getCustomerMatchScore(customer, queryLower);
    
    // Add prefix matching boost for better sorting when a name starts with search query
    const fullName = `${customer.first_name} ${customer.last_name}`.toLowerCase();
    const firstName = (customer.first_name || '').toLowerCase();
    const lastName = (customer.last_name || '').toLowerCase();
    
    // Create a sortKey for more precise sorting
    let sortKey = 0;
    
    // Prioritize exact matches and prefix matches
    if (fullName === queryLower) sortKey = 8;
    else if (firstName === queryLower || lastName === queryLower) sortKey = 7;
    else if (fullName.startsWith(queryLower)) sortKey = 6;
    else if (firstName.startsWith(queryLower)) sortKey = 5;
    else if (lastName.startsWith(queryLower)) sortKey = 4;
    else if (fullName.includes(queryLower)) sortKey = 3;
    else if (firstName.includes(queryLower)) sortKey = 2;
    else if (lastName.includes(queryLower)) sortKey = 1;
    
    return {
      customer,
      score,
      sortKey
    };
  });
  
  // Lower threshold for fuzzy name matching to catch more results
  const threshold = 0.3;
  
  const filteredCustomers = customersWithScores
    .filter(item => item.score > threshold)
    .sort((a, b) => {
      // First sort by score category (phone, email, name)
      const aCategory = Math.floor(a.score);
      const bCategory = Math.floor(b.score);
      if (bCategory !== aCategory) return bCategory - aCategory;
      
      // Then by sortKey for names (prioritize prefix matches)
      if (a.sortKey !== b.sortKey) return b.sortKey - a.sortKey;
      
      // Then by the precise score within category
      if (b.score !== a.score) return b.score - a.score;
      
      // Finally alphabetically
      const aFullName = `${a.customer.first_name} ${a.customer.last_name}`.toLowerCase();
      const bFullName = `${b.customer.first_name} ${b.customer.last_name}`.toLowerCase();
      return aFullName.localeCompare(bFullName);
    })
    .map(item => item.customer);
    
  return filteredCustomers;
};

/**
 * getCustomerMatchScore:
 * Calculates a match score for a customer based on how well it matches the search query.
 * Uses fuzzy matching for names, and exact matching for email and phone number.
 * 
 * Consistent scoring system:
 * - Name prefix match: 12.0
 * - Name + phone first char match: 11.0
 * - Exact phone match: 10.0
 * - Exact name match: 8.0-10.0
 * - Exact email match: 7.9
 * - Fuzzy name match: 0.0-7.0
 * 
 * @param customer - The customer object.
 * @param queryLower - The lowercase search query.
 * @returns A score indicating the strength of the match (0-12 range).
 */
export const getCustomerMatchScore = (customer: ICustomer, queryLower: string): number => {
  if (!queryLower) return 0;
  
  // First, determine if the query is primarily numeric or alphabetic
  const isNumericQuery = /^\d+$/.test(queryLower.replace(/\D/g, '')) && 
                         queryLower.replace(/\D/g, '').length > 0;
  
  const firstName = (customer.first_name || '').toLowerCase();
  const lastName = (customer.last_name || '').toLowerCase();
  const fullName = `${firstName} ${lastName}`.trim();
  const phoneNumber = customer.phone_number || '';
  const customerPhone = String(phoneNumber).replace(/\D/g, '');
  
  // For primarily numeric queries, do exact matching only
  if (isNumericQuery) {
    const queryNumbers = queryLower.replace(/\D/g, '');
    
    // No fuzzy matching or priority scoring for phone numbers
    if (customerPhone.startsWith(queryNumbers)) {
      return 10.0; // Return a consistent score for phone matches
    }
    
    // If it's a numeric query but doesn't match the phone, return 0
    return 0;
  } 
  // For primarily alphabetic queries, keep the existing name matching logic
  else {
    // HIGHEST PRIORITY: Exact matches on the first part of a name
    if (firstName.startsWith(queryLower) || lastName.startsWith(queryLower)) {
      return 12.0;
    }
    
    // Next highest: Check for first character match in both name and phone
    const firstChar = queryLower.charAt(0);
    const phoneStartsWithChar = customerPhone.startsWith(firstChar);
    
    if (phoneStartsWithChar) {
      return 13.0;
    }
    
    // Exact full name match
    if (fullName === queryLower) {
      return 10.0;
    }
    
    // Exact match for first or last name
    if (firstName === queryLower || lastName === queryLower) {
      return 9.5;
    }
    
    // Full name contains query
    if (fullName.includes(queryLower)) {
      return 9.0;
    }
    
    // Name parts contain query (but not at start)
    if (firstName.includes(queryLower) || lastName.includes(queryLower)) {
      return 8.5;
    }
  }
  
  // Check email for exact match (lower priority than specific matches above)
  const customerEmail = (customer.email || '').toLowerCase();
  if (customerEmail && queryLower.length >= 2 && customerEmail.includes(queryLower)) {
    return 7.9;
  }
  
  // Fuzzy matching for names - for more complex cases
  // Only attempt fuzzy matching for alphabetic queries with length >= 2
  if (!isNumericQuery && queryLower.length >= 2) {
    // Keep all the existing fuzzy matching logic
    const queryTokens = tokenize(queryLower);
    if (queryTokens.length === 0) return 0;
    
    const nameTokens = tokenize(fullName);
    let totalScore = 0;
    let matchCount = 0;
    
    for (const queryToken of queryTokens) {
      let bestTokenMatch = 0;
      
      for (const nameToken of nameTokens) {
        const similarity = calculateSimilarity(queryToken, nameToken);
        bestTokenMatch = Math.max(bestTokenMatch, similarity);
      }
      
      if (bestTokenMatch > 0.6) {
        matchCount++;
      }
      
      totalScore += bestTokenMatch;
    }
    
    const matchRatio = queryTokens.length > 0 ? matchCount / queryTokens.length : 0;
    
    let fuzzyScore = (totalScore / Math.max(1, queryTokens.length)) * 5.0;
    
    if (matchRatio > 0.7) {
      fuzzyScore *= 1.2;
    }
    
    return Math.min(5.0, fuzzyScore);
  }
  
  return 0; // No match
}