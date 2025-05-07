import { useState } from 'react';
import { IOrder } from '@/app/models/Order';

/**
 * Hook for managing package details and modal state
 */
export const usePackageManagement = (
  selectedOrders: Set<string>,
  orders: IOrder[] | null,
  setSelectedOrders: (orders: Set<string>) => void
) => {
  const [isPackageModalOpen, setPackageModalOpen] = useState(false);
  const [currentPackageIndex, setCurrentPackageIndex] = useState(0);
  const [packageDetails, setPackageDetails] = useState<any[]>([]);
  const [modifiedDetails, setModifiedDetails] = useState<Record<string, any>>({});

  /**
   * Updates the package details for a specific order
   */
  const handleTemporaryUpdate = (orderId: string, updates: any) => {
    setModifiedDetails(prev => ({
      ...prev,
      [orderId]: {
        ...(prev[orderId] || {}),
        ...updates
      }
    }));
  };

  /**
   * Submits the package details for processing
   */
  const handlePackageDetailsSubmit = async (values: any) => {
    // Get the current order ID
    const orderId = Array.from(selectedOrders)[currentPackageIndex];
    
    // Update the package details for this order
    setPackageDetails(prev => {
      const updated = [...prev];
      updated[currentPackageIndex] = values;
      return updated;
    });
    
    // Move to the next order if available
    if (currentPackageIndex < selectedOrders.size - 1) {
      setCurrentPackageIndex(currentPackageIndex + 1);
    } else {
      // All packages have been processed, close the modal
      setPackageModalOpen(false);
      
      // Process the completed package details
      try {
        // Example: Send package details to API
        const packageData = Array.from(selectedOrders).map((orderId, index) => ({
          orderId,
          packageDetails: packageDetails[index] || {}
        }));
        
        // This would typically be an API call
        console.log('Package data to submit:', packageData);
        
        // Clear the selection if successful
        setSelectedOrders(new Set());
      } catch (error) {
        console.error('Error processing packages:', error);
      }
    }
  };

  /**
   * Handles printing shipping labels for selected orders
   */
  const handlePrintShippingLabels = () => {
    // Prepare the package details modal
    const initialDetails = Array.from(selectedOrders).map(orderId => {
      const order = orders?.find(o => o._id.toString() === orderId);
      return {
        weight: '',
        dimensions: {
          length: '',
          width: '',
          height: ''
        },
        shippingService: order?.shipping_method || 'standard',
        trackingNumber: ''
      };
    });
    
    setPackageDetails(initialDetails);
    setCurrentPackageIndex(0);
    setPackageModalOpen(true);
  };

  return {
    packageDetails,
    isPackageModalOpen,
    setPackageModalOpen,
    currentPackageIndex,
    setCurrentPackageIndex,
    handlePackageDetailsSubmit,
    handlePrintShippingLabels,
    modifiedDetails,
    handleTemporaryUpdate
  };
};