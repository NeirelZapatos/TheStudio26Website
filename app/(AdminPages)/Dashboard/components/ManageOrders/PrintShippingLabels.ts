import { IOrder } from "@/app/models/Order";
import axios from "axios";

interface ShippoLabelResponse {
  label_url?: string;
  tracking_number?: string;
  tracking_url_provider?: string;
  rate?: {
    currency: string;
    amount: number;
  };
  error?: string;
}

interface ShippoLabelRequest {
  order_id: string;
  address_from: {
    name: string;
    street1: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    phone?: string;
    email?: string;
  };
  address_to: {
    name: string;
    street1: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    phone?: string;
    email?: string;
  };
  parcel: {
    length: number;
    width: number;
    height: number;
    distance_unit: 'in' | 'cm';
    weight: number;
    mass_unit: 'lb' | 'kg';
  };
  shipment: {
    carrier_account: string;
    servicelevel_token: string;
    label_file_type: 'pdf' | 'png';
  };
}

// Validate address format - more flexible address parser 
const validateAddress = (addressString: string) => {
  const parts = addressString.split(',').map(part => part.trim());
  
  // Ensure we have at least street, city, state, zip
  if (parts.length < 4) {
    throw new Error('Invalid address format. Expected at least: "Street, City, State, ZIP"');
  }
  
  return {
    street1: parts[0],
    city: parts[1],
    state: parts[2],
    zip: parts[3],
    country: parts.length >= 5 ? parts[4] : 'US' // Default to US if country not provided
  };
};
export const printShippingLabels = async (
  selectedOrders: string[],
  orders: IOrder[],
  packageDetails: {  // Remove the ? to make this required
    length: number;
    width: number;
    height: number;
    weight: number;
  }
) => {
  // Validate package details first
  if (!packageDetails || 
      packageDetails.length <= 0 || 
      packageDetails.width <= 0 || 
      packageDetails.height <= 0 || 
      packageDetails.weight <= 0) {
    throw new Error('All package dimensions (length, width, height, weight) must be provided and greater than zero');
  }

  try {
    const labels = await Promise.all(selectedOrders.map(async (orderId) => {
      const order = orders.find(o => o._id.toString() === orderId);
      if (!order) throw new Error(`Order ${orderId} not found`);
      
      // Handle both customer and customer_id patterns
      const customerData = order.customer || order.customer_id;
      if (!customerData || !order.shipping_address) {
        throw new Error(`Order ${orderId} missing customer or address data`);
      }

      try {
        const parsedAddress = validateAddress(order.shipping_address);

        // Simplified API call that matches the backend expectations
        const response = await axios.post<ShippoLabelResponse>(
          '/api/shipping',
          {
            order_ids: [order._id.toString()],  // Always send as array to match backend
            package_details: packageDetails  // Use the entire object directly
          }
        );

        if (response.data.error) {
          throw new Error(response.data.error);
        }

        if (!response.data.label_url) {
          throw new Error('No label URL returned from Shippo');
        }

        return response.data;

      } catch (error: any) {
        const message = error.response?.data?.error || error.message;
        window.alert(`Order ${orderId} Failed: ${message}`);
        throw new Error(message);
      }
    }));

// Handle label downloads
labels.forEach((label, index) => {
  if (label?.label_url) {
    const link = document.createElement('a');
    link.href = label.label_url;
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

