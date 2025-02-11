import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios'; 

// Define constants for ShipStation API URL and authentication credentials
const SHIPSTATION_API_URL = 'https://ssapi.shipstation.com'; 
const SHIPSTATION_API_KEY = process.env.SHIPSTATION_API_KEY; 
const SHIPSTATION_API_SECRET = process.env.SHIPSTATION_API_SECRET; 

// Interface to define the structure of the ShipStation Label request
interface ShipStationLabelRequest {
    order: { // Details about the order
        shipping_address: { // Shipping address structure
            street1: string; 
            city: string; 
            state: string; 
            postalCode: string; 
            country: string; 
        };
        customer: { // Customer details
            first_name: string; 
            last_name: string; 
        };
    };
    fromAddress: any; // The return address for shipping
    weight: any; 
    dimensions: any; 
}

// POST request handler to generate a shipping label
export async function POST(request: NextRequest) {
    // Create the basic authentication header using the ShipStation API key and secret
    const authHeader = `Basic ${Buffer.from(`${SHIPSTATION_API_KEY}:${SHIPSTATION_API_SECRET}`).toString('base64')}`;

    // Check if the ShipStation credentials are available
    if (!SHIPSTATION_API_KEY || !SHIPSTATION_API_SECRET) {
        // Return an error response if credentials are missing
        return NextResponse.json({ error: 'Missing ShipStation credentials' }, { status: 500 });
    }

    try {
        // Parse the incoming request's JSON payload into the ShipStationLabelRequest structure
        const { order, fromAddress, weight, dimensions }: ShipStationLabelRequest = await request.json();

        // Validate the required fields are present in the order
        if (!order?.shipping_address || !order?.customer) {
            return NextResponse.json({ error: 'Missing required order data' }, { status: 400 });
        }

        const address = order.shipping_address; // Extract shipping address from the order
        const errors = []; // Initialize an array to track address validation errors

        // Validate the state code (should be two uppercase letters)
        if (!/^[A-Z]{2}$/.test(address.state)) errors.push('Invalid state code');
        
        // Validate the postal code (should be exactly 5 digits)
        if (!/^\d{5}$/.test(address.postalCode)) errors.push('Invalid ZIP code');
        
        // If there are any validation errors, return them in the response
        if (errors.length > 0) {
            return NextResponse.json({ error: 'Invalid address', details: errors }, { status: 400 });
        }

        // Prepare the payload for the ShipStation API call
        const payload = {
            carrierCode: 'stamps_com', // Using Stamps.com as the carrier
            serviceCode: 'usps_priority_mail', // Service code for USPS Priority Mail
            packageCode: 'package', // Package type
            confirmation: 'delivery', // Confirmation type
            shipDate: new Date().toISOString().split('T')[0], // Current date in YYYY-MM-DD format
            weight, 
            dimensions, 
            shipFrom: fromAddress, 
            shipTo: { // Destination address for the shipment
                name: `${order.customer.first_name} ${order.customer.last_name}`, 
                ...address // Spread the shipping address fields here
            },
            testLabel: true // Set to true for test labels
        };

        // Make a POST request to the ShipStation API to create the shipping label
        const response = await axios.post(
            `${SHIPSTATION_API_URL}/shipments/createlabel`, // API endpoint to create a label
            payload, // The payload with shipping details
            {
                headers: {
                    Authorization: authHeader, // Authorization header with API credentials
                    'Content-Type': 'application/json', // Specify the content type as JSON
                },
                timeout: 10000 // Set a timeout of 10 seconds for the request
            }
        );

        // Return the response from the ShipStation API (label data)
        return NextResponse.json(response.data);
    } catch (error) {
        // Handle any errors during the process
        return NextResponse.json({ error: 'Failed to generate shipping label' }, { status: 500 });
    }
}
