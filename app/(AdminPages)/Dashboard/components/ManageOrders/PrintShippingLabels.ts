import { IOrder } from "@/app/models/Order";
import axios from "axios";

interface PackageDetails {
  length: number;
  width: number;
  height: number;
  weight: number;
}

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

const validateAddress = (addressString: string) => {
  const parts = addressString.split(',').map(part => part.trim());
  
  if (parts.length < 4) {
    throw new Error('Invalid address format. Expected at least: "Street, City, State, ZIP"');
  }
  
  return {
    street1: parts[0],
    city: parts[1],
    state: parts[2],
    zip: parts[3],
    country: parts.length >= 5 ? parts[4] : 'US'
  };
};

export const printShippingLabels = async (
  selectedOrders: string[],
  orders: IOrder[],
  packageDetails: PackageDetails[]
) => {
  if (packageDetails.length !== selectedOrders.length) {
    throw new Error(`Package details must be provided for each selected order. 
      Received ${packageDetails.length} details for ${selectedOrders.length} orders`);
  }

  try {
    // Send all orders in a single request to match the API expectation
    // In printShippingLabels function:
const requestData = {
  order_ids: selectedOrders,
  package_details: {
    length: packageDetails[0].length.toString(),
    width: packageDetails[0].width.toString(),
    height: packageDetails[0].height.toString(),
    weight: packageDetails[0].weight.toString()
  }
};

    console.log('Sending bulk shipping request:', requestData);
    const response = await axios.post('/api/shipping', requestData);

    if (response.data.error) {
      throw new Error(response.data.error);
    }

    // Handle response based on API structure
    if (Array.isArray(response.data)) {
      // If API returns an array of labels
      return response.data.map(label => {
        if (label.label_url) {
          const link = document.createElement('a');
          link.href = label.label_url;
          link.download = `label_${label.order_id || 'order'}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
        return label;
      });
    } else if (response.data.label_url) {
      // If API returns a single label
      const link = document.createElement('a');
      link.href = response.data.label_url;
      link.download = `label_${selectedOrders[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return [response.data];
    } else {
      throw new Error('Invalid response format from shipping API');
    }
  } catch (error: any) {
    const message = error.response?.data?.error || error.message;
    console.error('Shipping error:', error);
    window.alert(`Shipping Error: ${message}`);
    throw new Error(message);
  }
};