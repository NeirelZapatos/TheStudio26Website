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
 * - Exact phone match: 10.0
 * - Exact email match: 9.0
 * - Name match: 0.0-8.0 based on fuzzy matching quality
 * 
 * @param customer - The customer object.
 * @param searchQuery - The search query.
 * @returns A score indicating the strength of the match (0-10 range).
 */
export const getCustomerMatchScore = (customer: ICustomer, queryLower: string): number => {
  if (!queryLower) return 0;
  
  // Check phone number for exact match - highest priority (10.0)
  const queryNumbers = queryLower.replace(/\D/g, ''); // Remove all non-digits
  if (queryNumbers.length > 0) {
    const phoneNumber = customer.phone_number || '';
    const customerPhone = String(phoneNumber).replace(/\D/g, '');
    
    if (customerPhone.includes(queryNumbers)) {
      return 10.0;
    }
  }
  
  // Check email for exact match - second priority (9.0)
  const customerEmail = (customer.email || '').toLowerCase();
  if (customerEmail && queryLower.length >= 3 && customerEmail.includes(queryLower)) {
    return 9.0;
  }
  
  // Name matching - third priority (up to 8.0)
  // Prepare customer name for matching
  const firstName = (customer.first_name || '').toLowerCase();
  const lastName = (customer.last_name || '').toLowerCase();
  const fullName = `${firstName} ${lastName}`.trim();
  
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
  // Normalize and tokenize search query
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