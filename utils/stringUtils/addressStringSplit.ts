export interface ParsedAddress {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  }
  
  export function parseAddressString(addressString: string): ParsedAddress {
    const result: ParsedAddress = {
      street: '',
      city: '',
      state: '',
      zip: '',
      country: 'US',
    };
  
    if (!addressString) return result;
  
    const parts = addressString.split(',').map((part) => part.trim());
  
    if (parts.length === 1) {
      result.street = parts[0];
    } else if (parts.length === 2) {
      result.street = parts[0];
      result.city = parts[1];
    } else if (parts.length === 3) {
      result.street = parts[0];
      result.city = parts[1];
      result.state = parts[2];
    } else if (parts.length >= 4) {
      result.street = parts[0];
      result.city = parts[1];
      result.state = parts[2];
      result.zip = parts[3];
      result.country = parts.length >= 5 ? parts[4] : 'US';
    }
  
    return result;
  }