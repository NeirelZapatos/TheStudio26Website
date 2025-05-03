import { shippoClient } from './createShippoClient';
import { parseAndValidateAddress, ShippoAddressValidationResult } from './addressValidation';
import Shipping from '@/app/models/Shipping';
import Order from '@/app/models/Order';
import { ICustomer } from '@/app/models/Customer';
import { createShippoTransaction } from './createTransaction';
import { createShipment } from './createShipment';
import { selectShippingRate } from './selectShippingRate';

//import { registerTracking } from './tracking';

interface PackageDetails {
  length: number;
  width: number;
  height: number;
  weight: number;
}

// Function to register a webhook with Shippo for all events
export async function registerShippoWebhook(webhookUrl: string, isTest: boolean = false) {
  try {
    if (!shippoClient) {
      throw new Error('Shippo client is not initialized');
    }

    const SHIPPO_API_KEY = process.env.Shippo_Test_Key;

    const response = await fetch('https://api.goshippo.com/webhooks', {
      method: 'POST',
      headers: {
        'Authorization': `ShippoToken ${SHIPPO_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url: webhookUrl,
        event: 'all', // Subscribe to all events
        is_test: isTest
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to register Shippo webhook: ${errorData.detail || response.statusText}`);
    }

    const webhookData = await response.json();
    console.log('Webhook registered successfully:', webhookData);
    return webhookData;
  } catch (error) {
    console.error('Error registering Shippo webhook:', error);
    throw error;
  }
}

export async function createShippingRecord(order: any, package_details: PackageDetails, test_mode: boolean) {
  const customer = order.customer_id as ICustomer;

  // Validate the address with Shippo
  let validatedAddress: ShippoAddressValidationResult;
  
  // Get full name for the address
  const customerName = `${customer.first_name} ${customer.last_name}`;
  
  // Use Shippo's address validation
  console.log('Validating address with Shippo:', order?.shipping_address);
  validatedAddress = await parseAndValidateAddress(
    order?.shipping_address || '',
    customerName,
    customer.phone_number ? String(customer.phone_number) : '',
    customer.email || ''
  );


  // Create shipment with error handling
  const shipmentResponse = await createShipment(
    validatedAddress,
    customer,
    package_details,
    test_mode
  );
  // Filter and select rates
  // Replace the rate selection code with:
const selectedRate = selectShippingRate(shipmentResponse);


  //Create Transaction
  const transaction = await createShippoTransaction(selectedRate, test_mode);

  
  // Define the tracking number to use - Use SHIPPO_DELIVERED for tests
  const trackingNumber = test_mode ? 'SHIPPO_DELIVERED' : transaction.trackingNumber;

/************************************* Tracking Logic **************************
 
//This invokes all the tracking stuff in the webhook routse and tracking.ts  
// Uses HTTP listener either locally or on a server service like vercel.  It is designed to be compatabel with either or

 // Register tracking with Shippo
try {
  const carrier = 'shippo';
  
  console.log(`Registering ${test_mode ? 'TEST' : 'PRODUCTION'} tracking for ${trackingNumber}`);
  
  await registerTracking(
    trackingNumber,
    carrier,
    `Order ${order._id}`
  );
  
  console.log(`Tracking registered for ${trackingNumber} with carrier ${carrier}`);
  
  // For consistency in test mode, override the transaction's tracking number too
  if (test_mode) {
    console.log('Overriding transaction tracking number with test value:', trackingNumber);
    transaction.trackingNumber = trackingNumber;
  }
} catch (error) {
  console.error('Failed to register tracking:', error);
  // Don't fail the whole operation if tracking registration fails
}


********************************************************/


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
      email: validatedAddress.email || '',
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
      tracking_number: trackingNumber, // Use our consistent tracking number
      tracking_url: transaction.trackingUrlProvider,
      rate: {
        currency: selectedRate.currency || 'USD',
        amount: parseFloat(selectedRate.amount) || 0,
        provider: selectedRate.provider || ''
      }
    },
    tracking_status: {
      status: 'PRE_TRANSIT',
      status_details: 'Label created, awaiting package drop-off',
      last_updated: new Date()
    },
    status_history: [{
      status: 'created',
      message: 'Shipping label created',
      date: new Date()
    }]
  });
  
  await shippingRecord.save();

  // Store address validation results in the shipping record
  if (validatedAddress.validationResults) {
    await Shipping.findByIdAndUpdate(shippingRecord._id, {
      $set: {
        'address_validation': {
          is_valid: validatedAddress.isValid,
          messages: validatedAddress.validationResults.messages || [],
          validated_at: new Date()
        }
      }
    });
  }

  // Update the order with the shipping information
  await Order.findByIdAndUpdate(order._id, {
    shipping_id: shippingRecord._id,
    order_status: 'shipped',
    tracking_number: trackingNumber, 
    tracking_status: 'pre_transit'  //NOt shipped yet pending (USPS/Shippo Speak)
  });

  return shippingRecord;
}