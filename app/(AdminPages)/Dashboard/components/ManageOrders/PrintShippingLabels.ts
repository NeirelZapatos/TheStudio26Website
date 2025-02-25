import { IOrder } from "@/app/models/Order";
import axios from "axios";

// Add Response Interface
interface LabelResponse {
    labelUrl?: string;
    debug?: {
        authHeader: string;
        environment?: {
            keyExists: boolean;
            secretExists: boolean;
            NODE_ENV: string;
        };
    };
    error?: string;
}

interface ShippingLabelRequest {
    order: {
        orderId: string;
        orderTotal: number;
        subtotal: number;
        shippingAmount: number;
        products: Array<{
            description: string;
            quantity: number;
            price: number;
        }>;
        shipping_address: {
            street1: string; // Street address
            city: string; // City
            state: string; // State
            postalCode: string; // Postal code
            country: string; // Country
        };
        customer: {
            first_name: string; // Customer first name
            last_name: string; // Customer last name
        };
    };
    fromAddress: any; // Sender address
    weight: any; // Package weight
    dimensions: any; // Package dimensions
}

// Validate address format
const validateAddress = (addressString: string) => {
    const parts = addressString.split(',').map(part => part.trim()); // Split address by comma and trim spaces
    if (parts.length !== 5) {
        throw new Error('Invalid address format. Expected: "Street, City, State, ZIP, Country"'); // Throw error if address format is invalid
    }
    return {
        street1: parts[0], // Street address
        city: parts[1], // City
        state: parts[2], // State
        postalCode: parts[3], // Postal code
        country: parts[4] // Country
    };
};

// Print shipping labels for selected orders
export const printShippingLabels = async (selectedOrders: string[], orders: IOrder[]) => {
    try {
        const labels = await Promise.all(selectedOrders.map(async (orderId) => {
            const order = orders.find(o => o._id.toString() === orderId); // Find the order by ID

            if (!order) throw new Error(`Order ${orderId} not found`); // Throw error if order not found
            if (!order.customer || !order.shipping_address) {
                throw new Error(`Order ${orderId} missing customer or address data`); // Throw error if customer or address data is missing
            }

            try {
                const parsedAddress = validateAddress(order.shipping_address); // Validate and parse shipping address

                const products = order.products?.map(product => ({
                    description: product.product.description || 'No description', // Product description or default
                    quantity: product.quantity, // Product quantity
                    price: product.product.price // Product price
                })) || [];

                const subtotal = products.reduce((acc, product) => acc + (product.price * product.quantity), 0); // Calculate subtotal
                const shippingAmount = order.total_amount !== undefined ? order.total_amount - subtotal : 0; // Calculate shipping amount

                const requestPayload: ShippingLabelRequest = {
                    order: {
                        orderId: order._id.toString(), // Order ID
                        orderTotal: order.total_amount ?? 0, // Total order amount
                        subtotal: subtotal, // Subtotal
                        shippingAmount: shippingAmount, // Shipping amount
                        products, // Products
                        shipping_address: parsedAddress, // Parsed shipping address
                        customer: order.customer // Customer details
                    },
                    fromAddress: {
                        name: 'Jimmy Dean', // Sender name
                        street1: '456 Warehouse Rd', // Sender street address
                        city: 'New York', // Sender city
                        state: 'NY', // Sender state
                        postalCode: '10001', // Sender postal code
                        country: 'US' // Sender country
                    },
                    weight: { value: 16, units: 'ounces' }, // Package weight
                    dimensions: { units: 'inches', length: 10, width: 5, height: 5 } // Package dimensions
                };

// Type the axios response
const response = await axios.post<LabelResponse>('/api/shipstation/create-label', requestPayload);                

                if (response.data.debug) {
                      const data = response.data as { [key: string]: any };

                    const debug = response.data.debug;
                    window.alert(`Credential Debug Info:\n
                        Auth Header: ${debug.authHeader}\n
                        API Key Present: ${debug.environment?.keyExists}\n
                        API Secret Present: ${debug.environment?.secretExists}\n
                        Environment: ${debug.environment?.NODE_ENV}
                    `); // Show debug info in alert
                }

                if (!response.data.labelUrl) {
                    throw new Error('No label data returned from backend'); // Throw error if no label URL is returned
                }

                return response.data; // Return label data

            } catch (error: any) {
                const debug = error.response?.data?.debug; // Debug information from error response
                if (debug) {
                    window.alert(`Credential Error Debug:\n
                        Auth Header: ${debug.authHeader}\n
                        API Key Present: ${debug.keyExists}\n
                        API Secret Present: ${debug.secretExists}\n
                        Environment: ${debug.environment}\n
                        Error: ${error.response?.data?.error || error.message}
                    `); // Show error debug info in alert
                }

                const message = error.response?.data?.error || error.message; // Error message
                window.alert(`Order ${orderId} Failed: ${message}`); // Show error message in alert
                throw new Error(message); // Throw error
            }
        }));

        // Handle label downloads
        labels.forEach((label, index) => {
            if (label?.labelUrl) {
                const link = document.createElement('a'); // Create download link
                link.href = `data:application/pdf;base64,${label.labelUrl}`; // Set href to label URL
                link.download = `label_${selectedOrders[index]}.pdf`; // Set download filename
                document.body.appendChild(link); // Append link to document
                link.click(); // Trigger download
                document.body.removeChild(link); // Remove link from document
            }
        });

        return labels; // Return generated labels

    } catch (error: any) {
        const message = error.message || 'Unknown error'; // Error message
        window.alert(`Shipping Error: ${message}`); // Show error message in alert
        throw new Error(message); // Throw error
    }
};
