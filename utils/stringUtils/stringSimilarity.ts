// stringSimilarity.ts
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