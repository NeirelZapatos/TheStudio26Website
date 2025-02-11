import { IOrder } from '@/app/models/Order';
import axios from 'axios';

interface ShippingLabelRequest {
    order: {
        orderId: string;
        orderTotal: number;
        subtotal: number; // Added
        shippingAmount: number; // Added
        products: Array<{
            description: string;
            quantity: number;
            price: number; // Added to include product price
        }>;
        shipping_address: {
            street1: string;
            city: string;
            state: string;
            postalCode: string;
            country: string;
        };
        customer: {
            first_name: string;
            last_name: string;
        };
    };
    fromAddress: any;
    weight: any;
    dimensions: any;
}

const validateAddress = (addressString: string) => {
    const parts = addressString.split(',').map(part => part.trim());
    if (parts.length !== 5) {
        throw new Error('Invalid address format. Expected: "Street, City, State, ZIP, Country"');
    }
    return {
        street1: parts[0],
        city: parts[1],
        state: parts[2],
        postalCode: parts[3],
        country: parts[4]
    };
};

export const printShippingLabels = async (selectedOrders: string[], orders: IOrder[]) => {
    try {
        const labels = await Promise.all(selectedOrders.map(async (orderId) => {
            const order = orders.find(o => o._id.toString() === orderId);

            if (!order) throw new Error(`Order ${orderId} not found`);
            if (!order.customer || !order.shipping_address) {
                throw new Error(`Order ${orderId} missing customer or address data`);
            }

            try {
                const parsedAddress = validateAddress(order.shipping_address);

                const products = order.products?.map(product => ({
                    description: product.product.description || 'No description',
                    quantity: product.quantity,
                    price: product.product.price // Include product price
                })) || [];

                const subtotal = products.reduce((acc, product) => acc + (product.price * product.quantity), 0);
                const shippingAmount = order.total_amount - subtotal;

                const requestPayload: ShippingLabelRequest = {
                    order: {
                        orderId: order._id.toString(),
                        orderTotal: order.total_amount,
                        subtotal: subtotal, // Added
                        shippingAmount: shippingAmount, // Added
                        products,
                        shipping_address: parsedAddress,
                        customer: order.customer
                    },
                    fromAddress: {
                        name: 'Jimmy Dean', // Updated sender name
                        street1: '456 Warehouse Rd',
                        city: 'New York',
                        state: 'NY',
                        postalCode: '10001',
                        country: 'US'
                    },
                    weight: { value: 16, units: 'ounces' },
                    dimensions: { units: 'inches', length: 10, width: 5, height: 5 }
                };

                const response = await axios.post('/api/shipstation/create-label', requestPayload);

                if (response.data.debug) {
                    const debug = response.data.debug;
                    window.alert(`Credential Debug Info:\n
                        Auth Header: ${debug.authHeader}\n
                        API Key Present: ${debug.environment?.keyExists}\n
                        API Secret Present: ${debug.environment?.secretExists}\n
                        Environment: ${debug.environment?.NODE_ENV}
                    `);
                }

                if (!response.data.labelUrl) {
                    throw new Error('No label data returned from backend');
                }

                return response.data;

            } catch (error: any) {
                const debug = error.response?.data?.debug;
                if (debug) {
                    window.alert(`Credential Error Debug:\n
                        Auth Header: ${debug.authHeader}\n
                        API Key Present: ${debug.keyExists}\n
                        API Secret Present: ${debug.secretExists}\n
                        Environment: ${debug.environment}\n
                        Error: ${error.response?.data?.error || error.message}
                    `);
                }

                const message = error.response?.data?.error || error.message;
                window.alert(`Order ${orderId} Failed: ${message}`);
                throw new Error(message);
            }
        }));

        // Handle label downloads
        labels.forEach((label, index) => {
            if (label?.labelUrl) {
                const link = document.createElement('a');
                link.href = `data:application/pdf;base64,${label.labelUrl}`;
                link.download = `label_${selectedOrders[index]}.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        });

        return labels;

    } catch (error: any) {
        const message = error.message || 'Unknown error';
        window.alert(`Shipping Error: ${message}`);
        throw new Error(message);
    }
};