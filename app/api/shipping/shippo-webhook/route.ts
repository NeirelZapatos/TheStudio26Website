import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/app/lib/dbConnect';
import Order from '@/app/models/Order';
import Shipping from '@/app/models/Shipping';
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";

// Shippo webhook handler
export async function POST(req: NextRequest) {
  //protect
  const session = await getServerSession(authOptions);
  if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log('[SHIPPO_WEBHOOK] Received webhook call');
  
  // Log all incoming headers for debugging
  const headerEntries = Array.from(req.headers.entries());
  const headers = Object.fromEntries(headerEntries);
  console.log('[SHIPPO_WEBHOOK] Headers:', JSON.stringify(headers, null, 2));
  
  // Read and log the request body
  let payload;
  try {
    const rawBody = await req.text();
    console.log('[SHIPPO_WEBHOOK] Raw body:', rawBody);
    
    try {
      payload = JSON.parse(rawBody);
      console.log('[SHIPPO_WEBHOOK] Parsed payload:', JSON.stringify(payload, null, 2));
    } catch (parseError) {
      console.error('[SHIPPO_WEBHOOK] Failed to parse JSON body:', parseError);
      payload = { raw: rawBody };
    }
  } catch (err) {
    console.error('[SHIPPO_WEBHOOK] Failed to read request body:', err);
    return NextResponse.json({ error: 'Failed to read request body' }, { status: 400 });
  }
  
  // For Shippo, always return 200 OK immediately to acknowledge receipt
  // This is important as Shippo expects a quick response
  const responsePromise = NextResponse.json({ status: 'received' }, { status: 200 });
  
  // Process the webhook data asynchronously
  processWebhookAsync(payload).catch(err => {
    console.error('[SHIPPO_WEBHOOK] Background processing error:', err);
  });
  
  return responsePromise;
}

async function processWebhookAsync(payload: any) {
  try {
    // Connect to database
    await dbConnect();
    
    console.log(`[SHIPPO_WEBHOOK] Processing ${payload.event || 'unknown'} event`);
    
    // Handle different event types
    switch (payload.event) {
      case 'track_updated':
        await updateTrackingInfo(payload);
        break;
      case 'transaction_created':
      case 'transaction_updated':
      case 'batch_created':
      case 'batch_purchased':
        // Just log these events for now
        console.log(`[SHIPPO_WEBHOOK] Received ${payload.event} event, logging only`);
        break;
      default:
        console.log(`[SHIPPO_WEBHOOK] Unhandled event type: ${payload.event || 'unknown'}`);
    }
  } catch (error) {
    console.error('[SHIPPO_WEBHOOK] Error processing webhook:', error);
  }
}

// Define common Shippo test tracking numbers
const SHIPPO_TEST_TRACKING_NUMBERS = [
  'SHIPPO_DELIVERED',
  'SHIPPO_TRANSIT',
  'SHIPPO_FAILURE',
  'SHIPPO_INVALID',
  'SHIPPO_RETURNED',
  'SHIPPO_UNKNOWN'
];

async function updateTrackingInfo(payload: any) {
  try {
    // IMPORTANT FIX: In Shippo webhooks, the tracking data is in the data property
    const data = payload.data;
    
    if (!data) {
      console.log('[SHIPPO_WEBHOOK] No data field in payload');
      return;
    }
    
    const tracking_number = data.tracking_number;
    const tracking_status = data.tracking_status;
    
    if (!tracking_number || !tracking_status) {
      console.log('[SHIPPO_WEBHOOK] Missing tracking number or status in payload');
      return;
    }
    
    console.log(`[SHIPPO_WEBHOOK] Processing tracking update for ${tracking_number}, status: ${tracking_status.status}`);
    
    // Check if this is a test tracking number
    const isTestTracking = SHIPPO_TEST_TRACKING_NUMBERS.includes(tracking_number);
    
    // Find all shipping records with this tracking number (should typically be just one)
    const shippingRecords = await Shipping.find({ 'transaction.tracking_number': tracking_number });
    
    if (shippingRecords.length === 0) {
      console.log(`[SHIPPO_WEBHOOK] No shipping records found for tracking number: ${tracking_number}`);
      
      if (isTestTracking) {
        console.log(`[SHIPPO_WEBHOOK] Test tracking number detected (${tracking_number}). Skipping further processing.`);
      }
      
      return;
    }
    
    // Update each shipping record found
    for (const shippingRecord of shippingRecords) {
      // Check if this order is in test mode
      const order = await Order.findById(shippingRecord.order_id);
      const isTestMode = order?.is_test_order === true || isTestTracking;
      
      console.log(`[SHIPPO_WEBHOOK] Updating shipping record for order: ${shippingRecord.order_id} (Test mode: ${isTestMode})`);
      
      // Always update the shipping record's status history and webhook events regardless of test mode
      // Update tracking status
      shippingRecord.tracking_status = {
        status: tracking_status.status.toLowerCase(),
        status_details: tracking_status.status_details || '',
        last_updated: new Date()
      };
      
      // Add to status history
      shippingRecord.status_history.push({
        status: tracking_status.status.toLowerCase(),
        message: tracking_status.status_details || '',
        date: new Date(tracking_status.status_date)
      });
      
      // Update tracking status in transaction
      shippingRecord.transaction.tracking_status = tracking_status.status;
      
      // Add webhook event to history (create the array if it doesn't exist)
      if (!Array.isArray(shippingRecord.webhook_events)) {
        shippingRecord.webhook_events = [];
      }
      
      shippingRecord.webhook_events.push({
        event: 'track_updated',
        data: tracking_status,
        timestamp: new Date()
      });
      
      await shippingRecord.save();
      console.log(`[SHIPPO_WEBHOOK] Updated shipping record for order: ${shippingRecord.order_id}`);
      
      // Skip updating the order if in test mode
      if (isTestMode && !payload.test) {
        console.log(`[SHIPPO_WEBHOOK] Order ${shippingRecord.order_id} is in test mode but webhook is not. Skipping order status update.`);
        continue;
      }
      
      // If delivered, update the order status
      if (tracking_status.status === 'DELIVERED') {
        console.log(`[SHIPPO_WEBHOOK] Package delivered, updating order ${shippingRecord.order_id}`);
        
        const orderUpdate = await Order.findByIdAndUpdate(
          shippingRecord.order_id, 
          {
            order_status: 'delivered',
            tracking_status: 'delivered',
            delivered_at: new Date(tracking_status.status_date)
          },
          { new: true } // Return the updated document
        );
        
        if (orderUpdate) {
          console.log(`[SHIPPO_WEBHOOK] Order ${shippingRecord.order_id} marked as delivered`);
        } else {
          console.log(`[SHIPPO_WEBHOOK] Order ${shippingRecord.order_id} not found`);
        }
      } else {
        // For other statuses, map them to appropriate order statuses
        let orderStatus = order?.order_status || 'shipped'; // Default to not changing
        const trackingStatus = tracking_status.status.toLowerCase();
        
        // Map tracking statuses to order statuses
        if (trackingStatus === 'transit') {
          orderStatus = 'in_transit';
        } else if (trackingStatus === 'failure' || trackingStatus === 'returned') {
          orderStatus = 'delivery_issue';
        }
        
        // Update the order's tracking status
        const orderUpdate = await Order.findByIdAndUpdate(
          shippingRecord.order_id,
          { 
            tracking_status: trackingStatus,
            order_status: orderStatus
          },
          { new: true }
        );
        
        if (orderUpdate) {
          console.log(`[SHIPPO_WEBHOOK] Updated tracking status for order: ${shippingRecord.order_id} to ${trackingStatus}`);
        } else {
          console.log(`[SHIPPO_WEBHOOK] Order ${shippingRecord.order_id} not found`);
        }
      }
    }
  } catch (error) {
    console.error('[SHIPPO_WEBHOOK] Error updating tracking information:', error);
  }
}