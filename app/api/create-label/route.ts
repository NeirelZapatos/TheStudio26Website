import { NextResponse } from 'next/server';
import Shippo from 'shippo';

const shippo = Shippo(process.env.SHIPPO_API_KEY);

export async function POST() {
  try {
    // Create a shipment
    const shipment = await shippo.shipment.create({
      address_from: {
        name: "Sender Name",
        street1: "123 Sender St",
        city: "Sender City",
        state: "CA",
        zip: "94117",
        country: "US",
      },
      address_to: {
        name: "Receiver Name",
        street1: "123 Receiver St",
        city: "Receiver City",
        state: "CA",
        zip: "94117",
        country: "US",
      },
      parcels: [{
        length: "10",
        width: "5",
        height: "5",
        distance_unit: "in",
        weight: "2",
        mass_unit: "lb",
      }],
      async: false
    });

    // Get the first rate available
    if (!shipment.rates || shipment.rates.length === 0) {
      throw new Error('No rates available for this shipment.');
    }

    const transaction = await shippo.transaction.create({
      shipment: shipment.object_id,
      rate: shipment.rates[0].object_id,
      label_file_type: "PDF"
    });

    return NextResponse.json({ label_url: transaction.label_url });
  } catch (error) {
    console.error('Error creating label:', error);

    // Handle unknown error type
    let errorMessage = 'Failed to create label';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return new NextResponse(JSON.stringify({ error: errorMessage }), { status: 500 });
  }
}
