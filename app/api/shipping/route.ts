import Shipping from '@/app/models/Shipping';
import Order from '@/app/models/Order';
import { ICustomer } from '@/app/models/Customer';
import dbConnect from '@/app/lib/dbConnect';
import { NextRequest, NextResponse } from 'next/server';

interface ShippoInstance {
  transactions: {
    create: (params: any) => Promise<{
      objectId: string;
      status: string;
      labelUrl: string;
      trackingNumber: string;
      trackingUrlProvider: string;
      commercialInvoiceUrl?: string;
      messages?: Array<any>;
    }>;
  };
  shipments: {
    create: (params: any) => Promise<{
      objectId: string;
      rates: Array<{
        objectId: string;
        amount: string;
        currency: string;
        provider: string;
        carrierAccount: string;
        servicelevel: {
          token: string;
          name: string;
        };
      }>;
    }>;
  };
}

// Initialize the Shippo client
let shippoClient: ShippoInstance;

try {
  // Import Shippo using the modern import approach
  const { Shippo } = require('shippo');

  // Initialize using the new constructor syntax
  shippoClient = new Shippo({
    apiKeyHeader: `ShippoToken ${process.env.SHIPPO_TEST_KEY}`,
  });

  console.log('Shippo client initialized successfully');
} catch (error) {
  console.error('Error initializing Shippo:', error);
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { order_ids, package_details, test_mode = false } = body;

    // Fetch the selected orders and populate the customer data
    const orders = await Order.find({ _id: { $in: order_ids } }).populate<{
      customer_id: ICustomer;
    }>('customer_id');

    if (!orders.length) {
      return NextResponse.json({ error: 'No valid orders found' }, { status: 400 });
    }

    // Create shipping labels for each order
    const shippingPromises = orders.map(async (order) => {
      const customer = order.customer_id;

      // Parse shipping address
      let street1 = '',
        street2 = '',
        street3 = '',
        city = '',
        state = '',
        zip = '',
        country = '';

      if (order?.shipping_address) {
        const addressParts = parseAddressString(order?.shipping_address);
        street1 = addressParts.street;
        street2 = addressParts.street2;
        street3 = addressParts.street3;
        city = addressParts.city;
        state = addressParts.state;
        zip = addressParts.zip;
        country = addressParts.country;
        
        // Add detailed console logging for debugging
        console.log('====== ADDRESS PARSING DEBUG ======');
        console.log('Original shipping_address:', order.shipping_address);
        console.log('Parsed components:', { street1, street2, street3, city, state, zip, country });
        console.log('==================================');
      } 

      // Validate required address fields before proceeding
      if (!street1 || !city || !state || !zip) {
        const missingFields = [];
        if (!street1) missingFields.push('street address');
        if (!city) missingFields.push('city');
        if (!state) missingFields.push('state');
        if (!zip) missingFields.push('ZIP code');
        
        const errorMessage = `Cannot create shipping label: Missing required address fields (${missingFields.join(', ')})`;
        console.error(errorMessage, { 
          orderId: order._id,
          customerName: `${customer.first_name} ${customer.last_name}`,
          parsedAddress: { street1, street2, city, state, zip, country }
        });
        
        throw new Error(errorMessage);
      }

      // Ensure phone number is a string
      const phoneStr = customer.phone_number ? String(customer.phone_number) : '';

      // Create shipment with error handling
      let shipmentResponse;
      try {
        shipmentResponse = await shippoClient.shipments.create({
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
            name: `${customer.first_name} ${customer.last_name}`,
            street1: street1,
            street2: street2,
            city: city,
            state: state,
            zip: zip,
            country: country,
            phone: phoneStr,
            email: customer.email || ''
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

        // Check if rates exist in the response
        if (!shipmentResponse.rates || !Array.isArray(shipmentResponse.rates) || shipmentResponse.rates.length === 0) {
          console.error('No shipping rates returned from Shippo:', shipmentResponse);
          throw new Error('No shipping rates returned from Shippo. Please check address information and package details.');
        }
      } catch (error: unknown) {
        const shippoError = error as Error;
        console.error('Shippo API error:', shippoError);
        throw new Error(`Shippo API error: ${shippoError.message || 'Unknown error'}`);
      }

      // Filter for USPS rates
      const uspsRates = shipmentResponse.rates.filter(rate => rate.provider === 'USPS');

      if (!uspsRates || uspsRates.length === 0) {
        console.log('No USPS rates available, using first available rate');
        if (!shipmentResponse.rates || shipmentResponse.rates.length === 0) {
          console.log('Address data sent:', { street1, city, state, zip, country, phone: phoneStr });
          console.error('No shipping rates returned from Shippo:', shipmentResponse);
          throw new Error('No shipping rates returned from Shippo. Please check address information and package details.');
        }
      }

      // Select the cheapest USPS rate or the first available rate
      const selectedRate = uspsRates.length > 0 ? uspsRates[0] : shipmentResponse.rates[0];
      console.log('Selected rate:', JSON.stringify(selectedRate, null, 2));

      if (!selectedRate.objectId) {
        console.error('Invalid rate object:', selectedRate);
        throw new Error('Rate object does not have an objectId property');
      }

      // Create a transaction to purchase the label
      let transaction;
      try {
        // Use only the rate objectId - this is what Shippo requires according to the error
        const transactionParams = {
          rate: selectedRate.objectId,
          label_file_type: 'PDF_A4',
          async: false,
          test: test_mode
        };
        
        console.log('Creating transaction with params:', JSON.stringify(transactionParams, null, 2));
        
        transaction = await shippoClient.transactions.create(transactionParams);

        console.log('Transaction response:', JSON.stringify(transaction, null, 2));
        
        if (transaction.status !== 'SUCCESS' || !transaction.labelUrl) {
          console.error('Transaction failed or missing label URL:', transaction);
          throw new Error(transaction.messages ? transaction.messages[0]?.text || 'Label creation failed' : 'No label URL returned from Shippo');
        }

        console.log('Transaction created successfully:', transaction.objectId);
      } catch (error: unknown) {
        const transactionError = error as Error;
        console.error('Shippo transaction error:', transactionError);
        throw new Error(`Shippo transaction error: ${transactionError.message || 'Unknown error'}`);
      }

      // Create shipping record in MongoDB
      const shippingRecord = new Shipping({
        order_id: order._id,
        address_from: {
          name: 'Studio 26',
          company: 'Your Company Name',
          street1: '123 Main St',
          street2: '',
          city: 'Your City',
          state: 'CA',
          zip: '94107',
          country: 'US',
          phone: '555-555-5555',
          email: 'your@email.com',
          metadata: 'Store Address',
        },
        address_to: {
          name: `${customer.first_name} ${customer.last_name}`,
          company: '',
          street1: street1,
          street2: street2 || '',
          street3: street3 || '',
          city: city,
          state: state,
          zip: zip,
          country: country,
          phone: String(customer.phone_number || ''),
          email: customer.email || '',
          metadata: `Customer ID ${customer._id}`,
        },
        parcel: {
          length: package_details.length,
          width: package_details.width,
          height: package_details.height,
          distanceUnit: "in",
          weight: package_details.weight,
          massUnit: "lb"
        },
        shipment: {
          carrier_account: selectedRate.carrierAccount || '',
          servicelevel_token: selectedRate.servicelevel?.token || "",
          name: selectedRate.servicelevel?.name || "Standard Mail",
          test: test_mode
        },
        transaction: {
          shippo_id: transaction.objectId,
          status: transaction.status,
          label_url: transaction.labelUrl,
          tracking_number: transaction.trackingNumber,
          tracking_url: transaction.trackingUrlProvider,
          rate: {
            currency: selectedRate.currency || 'USD',
            amount: parseFloat(selectedRate.amount) || 0,
            provider: selectedRate.provider || ''
          }
        },
        status_history: [{
          status: 'created',
          message: 'Shipping label created',
          date: new Date()
        }]
      });
      
      await shippingRecord.save();

      // Update the order with the shipping information
      await Order.findByIdAndUpdate(order._id, {
        shipping_id: shippingRecord._id,
        order_status: 'shipped',
      });

      return shippingRecord;
    });

    const shippingResults = await Promise.all(shippingPromises);

    const labelInfo = shippingResults.map((record) => ({
      label_url: record.transaction?.label_url,
      tracking_number: record.transaction?.tracking_number,
      tracking_url_provider: record.transaction?.tracking_url,
      order_id: record.order_id,
      test: record.shipment?.test
    }));

    return NextResponse.json(labelInfo[0], { status: 201 });
  } catch (error: unknown) {
    console.error('API Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Helper function to parse address from a string
function parseAddressString(addressString: string) {
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
