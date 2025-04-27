import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/app/lib/dbConnect';
import Order from '@/app/models/Order';
import Shipping from '@/app/models/Shipping';

// Initialize Shippo client (use test key for development)
const SHIPPO_API_KEY = process.env.SHIPPO_TEST_KEY;
const SHIPPO_TRACKING_URL = 'https://api.goshippo.com/tracks/';
const SHIPPO_WEBHOOKS_URL = HTTPS_PACKAGE_TRACKING;

// Helper function to register tracking with Shippo
// Function to register tracking with Shippo
export async function registerTracking(trackingNumber: string, carrier: string, metadata: string) {
  try {
    const requestBody = {
      carrier: carrier,
      tracking_number: trackingNumber,
      metadata: metadata
    };

    console.log('[SHIPPO_OUTBOUND] Registering tracking:', JSON.stringify(requestBody, null, 2));

    // Fetch API approach
    const response = await fetch('https://api.goshippo.com/tracks/', {
      method: 'POST',
      headers: {
        'Authorization': `ShippoToken ${process.env.SHIPPO_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    // Log the raw response first
    const rawResponse = await response.text();
    console.log('[SHIPPO_INBOUND] Raw tracking registration response:', rawResponse);
    
    // Parse the response as JSON if possible
    let responseData;
    try {
      responseData = JSON.parse(rawResponse);
    } catch (e) {
      responseData = { raw: rawResponse };
    }
    
    if (!response.ok) {
      console.error('[SHIPPO_INBOUND] Tracking registration error:', JSON.stringify(responseData, null, 2));
      throw new Error(`Failed to register tracking: ${response.statusText}`);
    }

    console.log('[SHIPPO_INBOUND] Tracking registration success:', JSON.stringify(responseData, null, 2));
    return responseData;
  } catch (error) {
    console.error('[SHIPPO_OUTBOUND] Error registering tracking:', error);
    throw error;
  }
}
// Function to register a webhook subscription for all events
export async function registerAllWebhooks(webhookUrl: string, isTest: boolean = false) {
  try {
    const response = await fetch(SHIPPO_WEBHOOKS_URL, {
      method: 'POST',
      headers: {
        'Authorization': `ShippoToken ${SHIPPO_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url: webhookUrl,
        event: 'all', // Subscribe to all events: transaction_created, transaction_updated, track_updated, batch_created, batch_purchased
        is_test: isTest
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to register webhook: ${errorData.detail || response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error registering webhook:', error);
    throw error;
  }
}

// Function to list all webhook subscriptions
export async function listWebhooks() {
  try {
    const response = await fetch(SHIPPO_WEBHOOKS_URL, {
      headers: {
        'Authorization': `ShippoToken ${SHIPPO_API_KEY}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to fetch webhooks: ${errorData.detail || response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error listing webhooks:', error);
    throw error;
  }
}

// Function to delete a webhook
export async function deleteWebhook(webhookId: string) {
  try {
    const response = await fetch(`${SHIPPO_WEBHOOKS_URL}${webhookId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `ShippoToken ${SHIPPO_API_KEY}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to delete webhook: ${errorData.detail || response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error('Error deleting webhook:', error);
    throw error;
  }
}

// Webhook handler for Shippo events
export async function handleShippoWebhook(req: NextRequest) {
  await dbConnect();
  
  try {
    const event = await req.json();
    console.log('Received Shippo webhook event:', JSON.stringify(event, null, 2));
    
    // Verify the event comes from Shippo 
    // TODO: Implement proper verification in production
    
    // Handle different event types
    switch (event.event) {
      case 'transaction_created':
        return handleTransactionCreated(event);
      case 'transaction_updated':
        return handleTransactionUpdated(event);
      case 'track_updated':
        return handleTrackingUpdated(event);
      case 'batch_created':
        return handleBatchCreated(event);
      case 'batch_purchased':
        return handleBatchPurchased(event);
      default:
        console.log(`Unhandled event type: ${event.event}`);
        return NextResponse.json({ status: 'ignored', message: 'Unhandled event type' }, { status: 200 });
    }
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle transaction_created event
async function handleTransactionCreated(event: any) {
  console.log('Processing transaction_created event');
  // Logic for when a transaction is created
  // This usually means a shipping label has been created
  
  return NextResponse.json({ status: 'success', event: 'transaction_created' }, { status: 200 });
}

// Handle transaction_updated event
async function handleTransactionUpdated(event: any) {
  console.log('Processing transaction_updated event');
  // Logic for when a transaction is updated
  
  return NextResponse.json({ status: 'success', event: 'transaction_updated' }, { status: 200 });
}

// Handle track_updated event (tracking updates)
async function handleTrackingUpdated(event: any) {
  console.log('Processing track_updated event');
  
  // Extract relevant tracking information
  const { tracking_number, tracking_status, metadata } = event;
  const orderId = metadata?.match(/Order (\w+)/)?.[1];

  if (!orderId) {
    console.log('No order ID found in metadata');
    return NextResponse.json({ status: 'ignored', message: 'No order ID in metadata' }, { status: 200 });
  }

  // Find the shipping record and update status
  const shippingRecord = await Shipping.findOne({ 'transaction.tracking_number': tracking_number });
  
  if (!shippingRecord) {
    console.log(`Shipping record not found for tracking number: ${tracking_number}`);
    return NextResponse.json({ status: 'not_found', message: 'Shipping record not found' }, { status: 404 });
  }

  // Update shipping status history
  shippingRecord.status_history.push({
    status: tracking_status.status.toLowerCase(),
    message: tracking_status.status_details,
    date: new Date(tracking_status.status_date)
  });

  // Update the current tracking status
  shippingRecord.tracking_status = {
    status: tracking_status.status,
    status_details: tracking_status.status_details,
    last_updated: new Date(tracking_status.status_date)
  };

  await shippingRecord.save();
  console.log(`Updated tracking status for shipping record: ${shippingRecord._id}`);

  // Update order status based on tracking status
  if (tracking_status.status === 'DELIVERED') {
    await Order.findByIdAndUpdate(shippingRecord.order_id, {
      order_status: 'delivered',
      tracking_status: 'delivered',
      delivered_at: new Date(tracking_status.status_date)
    });
    console.log(`Order ${shippingRecord.order_id} marked as delivered`);
  } else {
    // Update the order's tracking status
    await Order.findByIdAndUpdate(shippingRecord.order_id, {
      tracking_status: tracking_status.status.toLowerCase()
    });
    console.log(`Updated tracking status for order: ${shippingRecord.order_id}`);
  }

  return NextResponse.json({ status: 'success', event: 'track_updated' }, { status: 200 });
}

// Handle batch_created event
async function handleBatchCreated(event: any) {
  console.log('Processing batch_created event');
  // Logic for when a batch is created
  
  return NextResponse.json({ status: 'success', event: 'batch_created' }, { status: 200 });
}

// Handle batch_purchased event
async function handleBatchPurchased(event: any) {
  console.log('Processing batch_purchased event');
  // Logic for when a batch is purchased
  
  return NextResponse.json({ status: 'success', event: 'batch_purchased' }, { status: 200 });
}

// Function to get tracking status
export async function getTrackingStatus(trackingNumber: string, carrier: string = 'shippo') {
  try {
    const response = await fetch(`${SHIPPO_TRACKING_URL}${carrier}/${trackingNumber}`, {
      headers: {
        'Authorization': `ShippoToken ${SHIPPO_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Tracking lookup failed: ${errorData.detail || response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting tracking status:', error);
    throw error;
  }
}