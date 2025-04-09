import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/app/lib/dbConnect';
import Order from '@/app/models/Order';
import { createShippingRecord } from '@/utils/shippingUtils/createShippingRecord';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { order_ids, package_details, test_mode = false } = body;

    // Fetch the selected orders and populate the customer data
    const orders = await Order.find({ _id: { $in: order_ids } }).populate('customer_id');

    if (!orders.length) {
      return NextResponse.json({ error: 'No valid orders found' }, { status: 400 });
    }

    // Create shipping labels for each order
    const shippingPromises = orders.map(order => 
      createShippingRecord(order, package_details, test_mode)
    );

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