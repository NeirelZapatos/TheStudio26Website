import { shippoClient } from './createShippoClient';
import { parseAddressString } from './parseAddressString';
import Shipping from '@/app/models/Shipping';
import Order from '@/app/models/Order';
import { ICustomer } from '@/app/models/Customer';

interface PackageDetails {
  length: number;
  width: number;
  height: number;
  weight: number;
}

export async function createShippingRecord(order: any, package_details: PackageDetails, test_mode: boolean) {
  const customer = order.customer_id as ICustomer;

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
    if (!shippoClient) {
      throw new Error('Shippo client is not initialized');
    }

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

  // In your existing filtered rates section, modify it to prioritize Ground Advantage
const uspsRates = shipmentResponse.rates.filter(rate => rate.provider === 'USPS');

// First look for Ground Advantage specifically
const groundAdvantageRates = uspsRates.filter(rate => 
  rate.servicelevel && rate.servicelevel.token === 'usps_ground_advantage'
);

// Sort by price (lowest first) if we have multiple Ground Advantage options
if (groundAdvantageRates.length > 0) {
  groundAdvantageRates.sort((a, b) => parseFloat(a.amount) - parseFloat(b.amount));
}

// If no Ground Advantage, sort all USPS rates by price
if (uspsRates.length > 0) {
  uspsRates.sort((a, b) => parseFloat(a.amount) - parseFloat(b.amount));
}

// Select the rate in priority order: cheapest Ground Advantage -> cheapest USPS -> cheapest any carrier
let selectedRate;
if (groundAdvantageRates.length > 0) {
  selectedRate = groundAdvantageRates[0]; // Cheapest Ground Advantage
  console.log('Selected USPS Ground Advantage rate');
} else if (uspsRates.length > 0) {
  selectedRate = uspsRates[0]; // Cheapest USPS
  console.log('Ground Advantage not available, using cheapest USPS rate');
} else {
  // If no USPS rates, sort all rates by price
  shipmentResponse.rates.sort((a, b) => parseFloat(a.amount) - parseFloat(b.amount));
  selectedRate = shipmentResponse.rates[0]; // Cheapest of any carrier
  console.log('No USPS rates available, using cheapest available rate');
}

console.log('Selected rate:', JSON.stringify(selectedRate, null, 2));

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
    
    if (!shippoClient) {
      throw new Error('Shippo client is not initialized');
    }
    
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
}