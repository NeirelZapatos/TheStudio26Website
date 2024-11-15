import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const SHIPSTATION_API_URL = 'https://ssapi.shipstation.com';
const SHIPSTATION_API_KEY = process.env.SHIPSTATION_API_KEY;
const SHIPSTATION_API_SECRET = process.env.SHIPSTATION_API_SECRET;

// Named export for the POST method
export async function POST(request: NextRequest) {
    const authHeader = `Basic ${Buffer.from(`${SHIPSTATION_API_KEY}:${SHIPSTATION_API_SECRET}`).toString('base64')}`;

    const { toAddress, fromAddress, weight, dimensions } = await request.json();

    try {
        const response = await axios.post(
            `${SHIPSTATION_API_URL}/shipments/createlabel`,
            {
                carrierCode: 'stamps_com',
                serviceCode: 'usps_priority_mail',
                packageCode: 'package',
                confirmation: 'delivery',
                shipDate: new Date().toISOString().split('T')[0],
                weight,
                dimensions,
                shipFrom: fromAddress,
                shipTo: toAddress,
                testLabel: true,
            },
            {
                headers: {
                    Authorization: authHeader,
                    'Content-Type': 'application/json',
                },
            }
        );

        return NextResponse.json({
            labelUrl: response.data.labelData,
            trackingNumber: response.data.trackingNumber,
        });
    } catch (error) {
        console.error('Error creating label:', error);
        return NextResponse.json({ error: 'Failed to create shipping label' }, { status: 500 });
    }
}
