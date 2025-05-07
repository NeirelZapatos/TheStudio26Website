import { shippoClient } from './createShippoClient';


/**
 * Parses and validates an address string using Shippo's API.
 * 
 * @param addressString Full address string
 * @param name Optional recipient name
 * @param phone Optional phone number
 * @param email Optional email
 * @returns Promise with the validated address from Shippo
 */
export async function parseAndValidateAddress(
  addressString: string,
  name?: string,
  phone?: string,
  email?: string
) {
  if (!shippoClient) {
    throw new Error('Shippo client is not initialized');
  }

  try {
    console.log('Parsing address string with Shippo:', addressString);

    const SHIPPO_API_KEY = process.env.Shippo_Test_Key;

    // Parse address using Shippo's official API
    const parseResponse = await fetch(`https://api.goshippo.com/v2/addresses/parse?address=${encodeURIComponent(addressString)}`, {
      method: 'GET',
      headers: {
        'Authorization': `ShippoToken ${SHIPPO_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const parsedAddress = await parseResponse.json();
    console.log('Parsed address response:', JSON.stringify(parsedAddress, null, 2));

    const addressData = {
      name: name || '',
      company: '',
      street1: parsedAddress.address_line_1 || '',
      street2: parsedAddress.address_line_2 || '',
      street3: parsedAddress.address_line_3 || '',
      streetNo: parsedAddress.street_no || '',
      city: parsedAddress.city_locality || '',
      state: parsedAddress.state_province || '',
      zip: parsedAddress.postal_code || '',
      country: parsedAddress.country_code, 
      phone: phone || '',
      email: email || '',
      metadata: '',
      validate: true,
      
    };

    console.log('Sending parsed address to Shippo for validation:', addressData);

    // Validate the parsed address
    const validationResponse = await shippoClient.addresses.create(addressData);
    console.log('Shippo address validation response:', JSON.stringify(validationResponse, null, 2));

    return validationResponse;
  } catch (error) {
    console.error('Shippo address parsing/validation error:', error);
    throw error;
  }
}

// Export the function and its return type
export type ShippoAddressValidationResult = Awaited<ReturnType<typeof parseAndValidateAddress>>;
export const validateAddressString = parseAndValidateAddress;
