// pages/api/validate-address.ts or app/api/validate-address/route.ts depending on your Next.js setup
import { parseAndValidateAddress } from '@/utils/shippingUtils/addressValidation'; // Adjust the path as needed
import { NextRequest, NextResponse } from 'next/server';

/**
 * API route handler for validating addresses using Shippo
 * For App Router in Next.js, we use named exports for HTTP methods
 */
export async function POST(request: NextRequest) {
  try {
    // Parse the JSON body
    const body = await request.json();
    const { address, name, phone, email } = body;

    // Validate required fields
    if (!address) {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    }

    // Ensure country is set (default to 'US' if not provided)
    const addressToValidate = {
      ...address,
      country: address.country || 'US'
    };

    // Format the address as a string for Shippo's parsing
    const addressString = formatAddressToString(addressToValidate);

    // Get customer name if provided
    const customerName = name || (
      address.name ||
      (body.firstName && body.lastName ? `${body.firstName} ${body.lastName}` : '')
    );

    // Process the address validation
    const validationResult = await parseAndValidateAddress(
      addressString,
      customerName,
      phone || address.phone,
      email || address.email
    );

    // Extract the needed information for the frontend
    const responseData = {
      is_valid: validationResult.isValid ?? false,
      messages: validationResult.validationResults?.messages ?? [],
      object_id: validationResult.objectId,
      address: {
        name: validationResult.name,
        company: validationResult.company,
        street1: validationResult.street1,
        street2: validationResult.street2,
        city: validationResult.city,
        state: validationResult.state,
        zip: validationResult.zip,
        country: validationResult.country,
        phone: validationResult.phone,
        email: validationResult.email,
        is_residential: validationResult.isResidential
      },
      suggested_address: validationResult.isValid === false ? {
        street1: validationResult.street1,
        street2: validationResult.street2,
        city: validationResult.city,
        state: validationResult.state,
        zip: validationResult.zip,
        country: validationResult.country
      } : null
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error validating address:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error during address validation' },
      { status: 500 }
    );
  }
}

/**
 * Format address object into a single string for Shippo's parsing API
 */
function formatAddressToString(address: any): string {
  const parts = [
    address.street1,
    address.street2,
    address.city,
    address.state,
    address.zip,
    address.country
  ].filter(Boolean); // Remove empty strings

  return parts.join(', ');
}
