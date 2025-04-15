import { useEffect, useState } from 'react';
import { printShippingLabels } from '@/utils/shippingUtils/PrintShippingLabels';
import { IOrder } from '@/app/models/Order';

interface PackageDetails {
  length: number;
  width: number;
  height: number;
  weight: number;
}

export const usePackageManagement = (
  selectedOrders: Set<string>,
  orders: IOrder[] | undefined,
  setSelectedOrders: (orders: Set<string>) => void
) => {
  const [packageDetails, setPackageDetails] = useState<PackageDetails[]>([]);
  const [isPackageModalOpen, setPackageModalOpen] = useState(false);
  const [currentPackageIndex, setCurrentPackageIndex] = useState(0);
  // Store modified details for each package to prevent losing changes during navigation
  const [modifiedDetails, setModifiedDetails] = useState<{[index: number]: PackageDetails}>({});

  // Initialize packageDetails array when selectedOrders changes
  useEffect(() => {
    if (selectedOrders.size > 0) {
      // Initialize or resize the packageDetails array
      const newDetails = Array.from({ length: selectedOrders.size }, (_, index) => {
        // If we have modified details for this index, use those
        if (modifiedDetails[index]) {
          return modifiedDetails[index];
        }
        // Try to use existing details from packageDetails if available
        else if (packageDetails[index]) {
          return packageDetails[index];
        }
        // Otherwise create a new empty object
        return { length: 0, width: 0, height: 0, weight: 0 };
      });
      
      setPackageDetails(newDetails);
    } else {
      // Reset when no orders are selected
      setPackageDetails([]);
      setModifiedDetails({});
    }
  }, [selectedOrders.size]);

  // Handle temporary updates while navigating between packages
  const handleTemporaryUpdate = (details: PackageDetails) => {
    console.log("Storing temporary update for package", currentPackageIndex, details);
    setModifiedDetails({
      ...modifiedDetails,
      [currentPackageIndex]: details
    });
  };

  const handlePackageDetailsSubmit = (details: PackageDetails) => {
    console.log("Submitting final package details for printing", details);
    
    // Update packageDetails array with all modified details
    const newPackageDetails = [...packageDetails];
    
    // Include the current package
    newPackageDetails[currentPackageIndex] = details;
    
    // Also include any other modified packages
    Object.entries(modifiedDetails).forEach(([index, packageData]) => {
      const idx = parseInt(index, 10);
      if (idx !== currentPackageIndex) { // Skip current package as we already added it
        newPackageDetails[idx] = packageData;
      }
    });
    
    setPackageDetails(newPackageDetails);
    
    // Only when Print button is clicked, print the labels
    printLabels(newPackageDetails);
    setPackageModalOpen(false);
    setCurrentPackageIndex(0);
    setModifiedDetails({});
  };

  const printLabels = async (details: PackageDetails[]) => {
    try {
      const labels = await printShippingLabels(Array.from(selectedOrders), orders || [], details);
      if (labels.length > 0) {
        alert('Shipping labels printed successfully!');
        setSelectedOrders(new Set());
        setPackageDetails([]);
        setModifiedDetails({});
        setCurrentPackageIndex(0);
      } else {
        alert('No labels were generated. Please check the selected orders and try again.');
      }
    } catch (error) {
      console.error('Error printing shipping labels:', error);
      alert(`Failed to print shipping labels: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handlePrintShippingLabels = () => {
    if (selectedOrders.size === 0 ) {
      alert('Please select at least one order to print shipping labels.');
      return;
    }
    
    // Always reset and open the modal regardless of existing details
    setCurrentPackageIndex(0);
    setPackageModalOpen(true);
    
    // Do NOT clear modified details when reopening the modal - preserve user input
  };

  return {
    packageDetails,
    setPackageDetails,
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

export default usePackageManagement;