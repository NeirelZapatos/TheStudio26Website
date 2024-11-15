'use client';

import { StrictMode } from "react";
import { useState } from 'react';
import axios from 'axios';

export default function Page() {
    const [labelUrl, setLabelUrl] = useState<string | null>(null);
    const [trackingNumber, setTrackingNumber] = useState<string | null>(null);

    const createTestLabel = async () => {
        try {
            const response = await axios.post('/api/shipstation/create-label', {
                toAddress: {
                    name: "Customer Name",
                    street1: "123 Shipping St",
                    city: "Los Angeles",
                    state: "CA",
                    postalCode: "90001",
                    country: "US"
                },
                fromAddress: {
                    name: "Sender Name",
                    street1: "456 Warehouse Rd",
                    city: "New York",
                    state: "NY",
                    postalCode: "10001",
                    country: "US"
                },
                weight: {
                    value: 16,
                    units: "ounces"
                },
                dimensions: {
                    units: "inches",
                    length: 10,
                    width: 5,
                    height: 5
                }
            });

            setLabelUrl(response.data.labelUrl);
            setTrackingNumber(response.data.trackingNumber);
        } catch (error) {
            console.error("Error creating label:", error);
        }
    };

    return (
        <div>
            <button onClick={createTestLabel}>Create Test Shipping Label</button>

            {labelUrl && (
                <div>
                    <p>Label Created</p>
                    <a href={`data:application/pdf;base64,${labelUrl}`} download="shipping_label.pdf">Download Label</a>
                </div>
            )}

            {trackingNumber && (
                <p>Tracking Number: {trackingNumber}</p>
            )}
        </div>
    );
}
