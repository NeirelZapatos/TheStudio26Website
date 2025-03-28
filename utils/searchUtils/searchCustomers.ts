import { ICustomer } from '@/app/models/Customer';
import { calculateSimilarity, tokenize } from '@/utils/stringUtils/stringSimilarity';

/**
 * searchCustomers:
 * Filters and sorts customers based on the search query with fuzzy matching for names,
 * exact matching for customer ID, and supporting various search fragments.
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

  // Calculate match scores for customers
  const customersWithScores = customers.map(customer => ({
    customer,
    score: getCustomerMatchScore(customer, searchQuery)
  }));

  // Lower threshold to catch more potential matches
  const threshold = 2.0;
  
  const filteredCustomers = customersWithScores
    .filter(item => item.score > threshold)
    .sort((a, b) => {
      // Primary sort by score (highest first)
      if (b.score !== a.score) return b.score - a.score;
      
      // Secondary sort alphabetically by full name
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
 * Uses fuzzy matching for names, and exact matching for identifiers.
 * 
 * @param customer - The customer object.
 * @param searchQuery - The search query.
 * @returns A score indicating the strength of the match (0-10 range).
 */
export const getCustomerMatchScore = (customer: ICustomer, searchQuery: string): number => {
  if (!searchQuery) return 0; // Return 0 if no search query

  // Normalize and tokenize search query
  const queryTokens = tokenize(searchQuery);
  if (queryTokens.length === 0) return 0;
  
  const queryLower = searchQuery.toLowerCase().trim();
  
  // Check for exact ID match first (highest priority)
  const customerId = customer._id?.toString().toLowerCase() || '';
  if (customerId.includes(queryLower)) {
    // Score based on how much of the ID is matched
    return 10 * (queryLower.length / customerId.length) + 5;
  }
  
  // Check email for exact match
  const customerEmail = customer.email.toLowerCase();
  if (customerEmail.includes(queryLower)) {
    return 9 * (queryLower.length / customerEmail.length) + 4;
  }
  
  // Prepare customer name for matching
  const fullName = `${customer.first_name} ${customer.last_name}`.toLowerCase().trim();
  const nameTokens = tokenize(fullName);
  
  let totalScore = 0;
  
  // For each query token, find best matching customer name token
  for (const queryToken of queryTokens) {
    let bestTokenMatch = 0;
    
    // Exact field match gets highest score
    if (fullName.includes(queryToken)) {
      bestTokenMatch = 1.0;
    } 
    // Otherwise check individual tokens
    else {
      for (const nameToken of nameTokens) {
        const similarity = calculateSimilarity(queryToken, nameToken);
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