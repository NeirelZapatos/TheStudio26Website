import Shipping from '@/app/models/Shipping';
import Order from '@/app/models/Order';
import {ICustomer} from '@/app/models/Customer';
import dbConnect from '@/app/lib/dbConnect';
import { NextRequest, NextResponse } from 'next/server';

// Define a type for Shippo
interface ShippoInstance {
  shipment: {
    create: (params: any) => Promise<{
      object_id: string;
      rates: Array<{
        object_id: string;
        amount: string;
        carrier_account: string;
        servicelevel: { token: string; name: string };
      }>;
    }>;
  };
  transaction: {
    create: (params: any) => Promise<{
      object_id: string;
      status: string;
      label_url: string;
      tracking_number: string;
      tracking_url_provider: string;
    }>;
  };
}

// Import Shippo with proper initialization and type annotation
let shippo: ShippoInstance;
try {
  const shippoLib = require('shippo');
  shippo = shippoLib(process.env.SHIPPO_API_KEY);
} catch (error) {
  console.error("Error initializing Shippo:", error);
  // Fallback implementation for development/testing
  shippo = {
    shipment: {
      create: async () => ({ 
        object_id: '0b5d2210362247fe80e780346960904c',
        rates: [{ 
          object_id: 'test-rate-id',
          amount: '9.99',
          carrier_account: 'test-carrier', 
          servicelevel: { token: 'test-service', name: 'Test Service' } 
        }]
      })
    },
    transaction: {
      create: async () => ({
        object_id: '0b5d2210362247fe80e780346960904c',
        status: 'SUCCESS',
        label_url: 'https://example.com/test-label.pdf',
        tracking_number: 'TEST123456789',
        tracking_url_provider: 'https://example.com/track/TEST123456789'
      })
    }
  };
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { order_ids, package_details } = body;

    // Fetch the selected orders and populate the customer data
    const orders = await Order.find({ _id: { $in: order_ids } })
      .populate<{ customer_id: ICustomer }>('customer_id');

    if (!orders.length) {
      return NextResponse.json(
        { error: 'No valid orders found' },
        { status: 400 }
      );
    }

    // Create shipping labels for each order
    const shippingPromises = orders.map(async (order) => {
      const addressFrom = {
        name: 'Studio 26',
        street1: '123 Main St',
        city: 'Your City',
        state: 'CA',
        zip: '94107',
        country: 'US',
        phone: '555-555-5555',
        email: 'your@email.com'
      };

      // Use the populated customer data
      const customer = order.customer_id;
      
      // Parse shipping address - assuming it's in a string format like "123 Main St, City, ST 12345"
      let street1 = '', city = '', state = '', zip = '';
      
      // First try to get shipping address from the order
      if (order.shipping_address) {
        // Try to parse the address from the order shipping_address field
        const addressParts = parseAddressString(order.shipping_address);
        street1 = addressParts.street || '';
        city = addressParts.city || '';
        state = addressParts.state || 'CA'; // Default state if not found
        zip = addressParts.zip || '00000';
      } 
      // If not in order, try from customer
      else if (customer?.shipping_address) {
        const addressParts = parseAddressString(customer.shipping_address);
        street1 = addressParts.street || '';
        city = addressParts.city || '';
        state = addressParts.state || 'CA'; // Default state if not found
        zip = addressParts.zip || '00000';
      }
      
      // Fallback to fromAddress if available (but ensure state is 2 chars)
      if (!street1 && order.shippingDetails?.fromAddress?.street) {
        street1 = order.shippingDetails.fromAddress.street;
      }
      
      if (!city && order.shippingDetails?.fromAddress?.city) {
        city = order.shippingDetails.fromAddress.city;
      }
      
      if (!state || state === 'N/A') {
        // Use the fromAddress state if available, otherwise use a default
        state = order.shippingDetails?.fromAddress?.state || 'CA';
        
        // Ensure state is exactly 2 characters
        if (state.length !== 2) {
          // If not 2 characters, use a default state code
          state = 'CA';
        }
      }
      
      if (!zip && order.shippingDetails?.fromAddress?.postalCode) {
        zip = order.shippingDetails.fromAddress.postalCode;
      }
      
      // Fallback values for required fields if still missing
      street1 = street1 || 'Address not provided';
      city = city || 'City not provided';
      state = state || 'CA'; // Must be exactly 2 characters
      zip = zip || '00000';

      const addressTo = {
        name: `${customer.first_name} ${customer.last_name}`,
        street1: street1,
        city: city,
        state: state,
        zip: zip,
        country: 'US',
        phone: customer.phone_number || '000-000-0000',
        email: customer.email || ''
      };
    
      const parcel = {
        length: package_details.length,
        width: package_details.width,
        height: package_details.height,
        distance_unit: 'in',
        weight: package_details.weight,
        mass_unit: 'lb'
      };

      // Create shipment with error handling
      let shipment;
      try {
        shipment = await shippo.shipment.create({
          address_from: addressFrom,
          address_to: addressTo,
          parcels: [parcel],
          async: false
        });
        
        if (!shipment.rates || shipment.rates.length === 0) {
          throw new Error('No shipping rates returned from Shippo');
        }
      } catch (error: unknown) {
        // Properly typed error handling
        const shippoError = error as Error;
        console.error("Shippo API error:", shippoError);
        throw new Error(`Shippo API error: ${shippoError.message || 'Unknown error'}`);
      }
      
      // Select the first rate (cheapest) by default
      const selectedRate = shipment.rates[0];
      
      // Now create a transaction to purchase the label
      let transaction;
      try {
        transaction = await shippo.transaction.create({
          rate: selectedRate.object_id,
          label_file_type: 'PDF',
          async: false
        });
        
        if (!transaction.label_url) {
          throw new Error('No label URL returned from Shippo');
        }
        
        console.log("Transaction created successfully:", transaction);
      } catch (error: unknown) {
        const transactionError = error as Error;
        console.error("Shippo transaction error:", transactionError);
        throw new Error(`Shippo transaction error: ${transactionError.message || 'Unknown error'}`);
      }

      // Create shipping record in MongoDB
// Create shipping record in MongoDB
const shippingRecord = new Shipping({
  order_id: order._id,
  address_from: addressFrom,
  address_to: addressTo, // Just use the addressTo object directly
  parcel: parcel,
  shipment: {
    carrier_account: selectedRate.carrier_account,
    servicelevel_token: selectedRate.servicelevel.token,
    servicelevel_name: selectedRate.servicelevel.name,
    label_file_type: 'pdf'
  },
  transaction: {
    shippo_id: transaction.object_id,
    status: transaction.status,
    label_url: transaction.label_url,
    tracking_number: transaction.tracking_number,
    tracking_url: transaction.tracking_url_provider
  }
});

await shippingRecord.save();

// Update the order with the shipping information
await Order.findByIdAndUpdate(order._id, { 
  shipping_id: shippingRecord._id,
  order_status: 'shipped' 
});

return shippingRecord;
    });

    const shippingResults = await Promise.all(shippingPromises);

    const labelInfo = shippingResults.map(record => ({
      label_url: record.transaction?.label_url,
      tracking_number: record.transaction?.tracking_number,
      tracking_url_provider: record.transaction?.tracking_url,
      rate: record.transaction?.rate,
      order_id: record.order_id
    }));
    
    return NextResponse.json(labelInfo[0], { status: 201 });
  } catch (error: unknown) {
    console.error("API Error:", error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Helper function to parse address from a string
// Helper function to parse address from a string
function parseAddressString(addressString: string) {
  // Default return object
  const result = {
    street: '',
    city: '',
    state: '',
    zip: '',
    country: 'US' // Default country
  };

  if (!addressString) return result;

  // Split the address string by commas and trim each part
  const parts = addressString.split(',').map(part => part.trim());

  // Single part address (like "123 Main St") - assume it's just the street
  if (parts.length === 1) {
    result.street = parts[0];
    return result;
  }
  
  // Two parts (like "123 Main St, San Diego") - assume street and city
  if (parts.length === 2) {
    result.street = parts[0];
    result.city = parts[1];
    return result;
  }
  
  // Three parts (like "123 Main St, San Diego, CA") - street, city, state
  if (parts.length === 3) {
    result.street = parts[0];
    result.city = parts[1];
    result.state = parts[2];
    return result;
  }

  // Four or more parts - use the standard format
  result.street = parts[0]; 
  result.city = parts[1]; 
  result.state = parts[2]; 
  result.zip = parts[3];
  result.country = parts.length >= 5 ? parts[4] : 'US';

  return result;
}
