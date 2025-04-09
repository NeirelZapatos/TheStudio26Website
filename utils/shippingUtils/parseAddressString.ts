export function parseAddressString(addressString: string) {
    const result = {
      street: '',
      street2: '',
      street3: '',
      city: '',
      state: '',
      zip: '',
      country: 'US', // Default to US as fallback
    };
  
    if (!addressString) return result;
  
    // Log the original address string for debugging
    console.log('Original address string:', addressString);
  
    // Modified to handle potential line breaks or multi-line addresses
    const parts = addressString.split(/[,\n]/).map((part) => part.trim()).filter(Boolean);
    console.log('Parsed address parts:', parts);
  
    if (parts.length === 1) {
      result.street = parts[0];
    } else if (parts.length === 2) {
      result.street = parts[0];
      // Check if second part contains city, state, zip
      const cityStateParts = parts[1].split(/\s+/);
      if (cityStateParts.length > 2) {
        result.city = cityStateParts.slice(0, -2).join(' ');
        result.state = cityStateParts[cityStateParts.length - 2];
        result.zip = cityStateParts[cityStateParts.length - 1];
      } else {
        result.city = parts[1];
      }
    } else if (parts.length >= 3) {
      // Handle multi-line addresses
      result.street = parts[0];
      
      // Second line could be apt/suite or city
      if (/apt|suite|#/i.test(parts[1])) {
        result.street2 = parts[1];
        
        if (parts.length >= 4) {
          result.city = parts[2];
          // Last part could be "STATE ZIP" or just "STATE"
          const stateZipParts = parts[3].split(/\s+/);
          result.state = stateZipParts[0];
          if (stateZipParts.length > 1) {
            result.zip = stateZipParts[1];
          }
        }
      } else {
        result.city = parts[1];
        result.state = parts[2];
        if (parts.length >= 4) {
          result.zip = parts[3];
        }
      }
      
      // If there's another part, treat it as country
      if (parts.length >= 5) {
        result.country = parts[4];
      }
    }
    
    // Log the parsed result for debugging
    console.log('Parsed address result:', result);
    
    return result;
  }