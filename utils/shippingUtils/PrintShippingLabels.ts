import { IOrder } from "@/app/models/Order";
import axios, { AxiosError } from "axios";

interface PackageDetails {
  length: number;
  width: number;
  height: number;
  weight: number;
}

interface ShippoLabelResponse {
  label_url: string;
  tracking_number: string;
  tracking_url_provider: string;
  rate?: {
    currency: string;
    amount: number;
  };
  error?: string;
}

export const printShippingLabels = async (
  selectedOrders: string[],
  orders: IOrder[],
  packageDetails: PackageDetails[]
): Promise<ShippoLabelResponse[]> => {
  if (packageDetails.length !== selectedOrders.length) {
    throw new Error(`Mismatch between ${packageDetails.length} package details and ${selectedOrders.length} orders`);
  }

  try {
    const requestData = {
      order_ids: selectedOrders,
      package_details: packageDetails,
      test_mode: process.env.NODE_ENV === 'development'
    };

    console.debug('Request data:', requestData);

    const { data } = await axios.post<ShippoLabelResponse[]>(
      '/api/shipping',
      requestData,
      {
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );

    const results: ShippoLabelResponse[] = [];
    
    for (let i = 0; i < data.length; i++) {
      const label = data[i];
      const orderId = selectedOrders[i];
      
      try {
        if (!label?.label_url) {
          throw new Error('Missing label URL in response');
        }

        // Enhanced URL validation
        if (!isValidUrl(label.label_url)) {
          throw new Error(`Invalid label URL: ${label.label_url}`);
        }

        const filename = `${requestData.test_mode ? 'TEST_' : ''}label_${orderId}.pdf`;
        
        // Download the PDF via our proxy endpoint
        await downloadPdfFile(label.label_url, filename);
        
        results.push(label);
        
        // Add delay between downloads
        if (i < data.length - 1) await new Promise(r => setTimeout(r, 500));
        
      } catch (error) {
        const errorMsg = `Order ${orderId}: ${getErrorMessage(error)}`;
        console.error('Label error:', errorMsg, label);
        results.push({ ...label, error: errorMsg });
      }
    }

    return results;

  } catch (error) {
    const errorMsg = `Shipping API Error: ${getErrorMessage(error)}`;
    console.error('API Error:', errorMsg, error);
    throw new Error(errorMsg);
  }
};

// Simple cross-browser compatible download function
const downloadPdfFile = async (url: string, filename: string): Promise<void> => {
  try {
    console.log(`Initiating download for: ${url}`);
    
    // Use our proxy endpoint to avoid CORS issues
    const response = await fetch('/api/shipping/proxy-download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, filename })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Download failed with status: ${response.status}. Details: ${errorText}`);
    }
    
    // Create blob from the response
    const blob = await response.blob();
    
    // Create URL for the blob
    const blobUrl = window.URL.createObjectURL(blob);
    
    // Create download link
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    link.style.display = 'none';
    
    // Append to document, click, and clean up
    document.body.appendChild(link);
    link.click();
    
    // Clean up after a delay
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    }, 1000);
    
  } catch (err) {
    console.error('Download failed:', err);
    throw err instanceof Error ? err : new Error('Unknown error during download');
  }
};

// Helper functions
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || error.message;
  }
  return error instanceof Error ? error.message : 'Unknown error';
};