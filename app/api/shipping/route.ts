import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/app/lib/dbConnect';
import Order from '@/app/models/Order';
import { createShippingRecord } from '@/utils/shippingUtils/createShippingRecord';
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";

export async function POST(request: NextRequest) {
  //protect
  const session = await getServerSession(authOptions);
  if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();

    const body = await request.json();
    const { order_ids, package_details, test_mode = true } = body;

    // Validate the input arrays
    if (!Array.isArray(order_ids)) {
      return NextResponse.json({ error: 'order_ids must be an array' }, { status: 400 });
    }

    if (!Array.isArray(package_details)) {
      return NextResponse.json({ error: 'package_details must be an array' }, { status: 400 });
    }

    if (order_ids.length !== package_details.length) {
      return NextResponse.json(
        { error: 'order_ids and package_details must have the same length' },
        { status: 400 }
      );
    }

    // Fetch the selected orders and populate the customer data
    const orders = await Order.find({ _id: { $in: order_ids } }).populate('customer_id');

    if (orders.length !== order_ids.length) {
      const foundIds = orders.map(o => o._id.toString());
      const missingIds = order_ids.filter(id => !foundIds.includes(id));
      return NextResponse.json(
        { error: 'Some orders not found', missingIds },
        { status: 400 }
      );
    }

    // Create shipping labels for each order with its corresponding package details
    const shippingPromises = orders.map((order, index) => 
      createShippingRecord(
        order, 
        package_details[index],
        test_mode
      )
    );

    const shippingResults = await Promise.all(shippingPromises);

    const labelInfo = shippingResults.map((record, index) => ({
      order_id: order_ids[index],
      label_url: record.transaction?.label_url,
      tracking_number: record.transaction?.tracking_number,
      tracking_url_provider: record.transaction?.tracking_url,
      tracking_status: record.tracking_status?.status || 'pre_transit',
      rate: record.transaction?.rate,
      test: record.shipment?.test,
      status: 'success'
    }));

    return NextResponse.json(labelInfo, { status: 201 });
  } catch (error: unknown) {
    console.error('API Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}