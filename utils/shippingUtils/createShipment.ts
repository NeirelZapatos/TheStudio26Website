// createShipment.ts
import { shippoClient } from './createShippoClient';
import { ShippoAddressValidationResult } from './addressValidation';
import { ICustomer } from '@/app/models/Customer';

interface PackageDetails {
  length: number;
  width: number;
  height: number;
  weight: number;
}

export interface Rate {
  objectId: string;  // Added this to match what createShippoTransaction expects
  provider: string;
  servicelevel?: {
    token: string;
    name: string;
  };
  amount: string;
  currency: string;
  carrierAccount?: string;
  [key: string]: any;
}

export interface ShipmentResponse {
  objectId: string;
  rates: Rate[];
  [key: string]: any;
}

export async function createShipment(
  validatedAddress: ShippoAddressValidationResult,
  customer: ICustomer,
  package_details: PackageDetails,
  test_mode: boolean
): Promise<ShipmentResponse> {
  try {
    if (!shippoClient) {
      throw new Error('Shippo client is not initialized');
    }

    const shipmentResponse = await shippoClient.shipments.create({
      addressFrom: {
        name: 'Owner Name',
        company: 'The Studio 26',
        street1: '123 Main St',
        street2: '',
        city: 'Sacramento',
        state: 'CA',
        zip: '94107',
        country: 'US',
        phone: '555-555-5555',
        email: 'your@email.com'
      },
      addressTo: {
        name: validatedAddress.name || `${customer.first_name} ${customer.last_name}`,
        company: validatedAddress.company || '',
        street1: validatedAddress.street1,
        street2: validatedAddress.street2 || '',
        street3: validatedAddress.street3 || '',
        city: validatedAddress.city,
        state: validatedAddress.state,
        zip: validatedAddress.zip,
        country: validatedAddress.country,
        phone: validatedAddress.phone || '',
        email: validatedAddress.email || ''
      },
      parcels: [
        {
          length: package_details.length.toString(),
          width: package_details.width.toString(),
          height: package_details.height.toString(),
          distanceUnit: 'in',
          weight: package_details.weight.toString(),
          massUnit: 'lb'
        }
      ],
      async: false,
      test: test_mode
    });

    console.log('Shipment created:', shipmentResponse.objectId);
    console.log('Shipment response:', JSON.stringify(shipmentResponse, null, 2));

    if (!shipmentResponse.rates || !Array.isArray(shipmentResponse.rates)) {
      console.error('Invalid rates returned from Shippo:', shipmentResponse);
      throw new Error('Invalid rates format returned from Shippo');
    }

    if (shipmentResponse.rates.length === 0) {
      console.error('No shipping rates returned from Shippo:', shipmentResponse);
      throw new Error('No shipping rates returned from Shippo. Please check address information and package details.');
    }

    return shipmentResponse;
  } catch (error: unknown) {
    const shippoError = error as Error;
    console.error('Shippo API error:', shippoError);
    throw new Error(`Shippo API error: ${shippoError.message || 'Unknown error'}`);
  }
}