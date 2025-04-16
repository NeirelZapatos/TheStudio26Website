export function parseAddressString(addressString: string) {
    // Default values
    const result = {
      street: '',
      street2: '',
      street3: '',
      city: '',
      state: '',
      zip: '',
      country: 'US' // Default country
    };
    
    if (!addressString) return result;
    
    // Split by commas
    const parts = addressString.split(',').map(part => part.trim());
    
    // First part is almost always the street address
    result.street = parts[0] || '';
    
    // Check if the last part indicates a country
    const lastPart = parts[parts.length - 1]?.trim();
    if (lastPart) {
      // Check for country indicators
      if (/^(US|USA|United\s+States)$/i.test(lastPart)) {
        result.country = 'US';
        parts.pop(); // Remove country from parts for further processing
      } else if (/^(CA|CAN|Canada)$/i.test(lastPart)) {
        result.country = 'CA';
        parts.pop();
      } else if (/^(MX|MEX|Mexico)$/i.test(lastPart)) {
        result.country = 'MX';
        parts.pop();
      }
    }
    
    // For remaining parts, go backwards from the end
    // Typically format is: street, [street2], city, state/province, postal code, [country]
    const remainingParts = parts.slice(1); // Skip the street which we already assigned
    
    // Process remaining parts from end to beginning (from most specific to least specific)
    let processedParts = 0;
    
    // Check for postal/zip code
    for (let i = remainingParts.length - 1; i >= 0; i--) {
      const part = remainingParts[i].trim();
      if (!part) continue;
      
      // US zip code pattern
      if (/^\d{5}(-\d{4})?$/.test(part) || 
          // Canadian postal code pattern
          /^[A-Za-z]\d[A-Za-z]\s*\d[A-Za-z]\d$/i.test(part) ||
          // Mexican postal code pattern
          /^\d{5}$/.test(part)) {
        result.zip = part;
        remainingParts.splice(i, 1);
        processedParts++;
        break;
      }
    }
    
    // Check for state/province code
    for (let i = remainingParts.length - 1; i >= 0; i--) {
      const part = remainingParts[i].trim();
      if (!part) continue;
      
      // US state or Canadian province
      if (/^[A-Za-z]{2}$/i.test(part) ||         // 2-letter code
          /^[A-Za-z\s]{3,}$/i.test(part)) {      // Full state/province name
        result.state = part.toUpperCase();
        remainingParts.splice(i, 1);
        processedParts++;
        break;
      }
    }
    
    // The city is typically the part before state/province
    if (remainingParts.length > 0) {
      const cityIndex = remainingParts.length - 1;  
      result.city = remainingParts[cityIndex];
      remainingParts.splice(cityIndex, 1);
    }
    
    // Any remaining parts are likely secondary address lines
    if (remainingParts.length > 0) {
      result.street2 = remainingParts[0];
      if (remainingParts.length > 1) {
        result.street3 = remainingParts.slice(1).join(', ');
      }
    }
    
    return result;
  }