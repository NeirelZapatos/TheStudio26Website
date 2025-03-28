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
    console.log("Submitting package details for index", currentPackageIndex, details);
    
    // Store in modifiedDetails
    setModifiedDetails({
      ...modifiedDetails,
      [currentPackageIndex]: details
    });
    
    // Update packageDetails array
    const newPackageDetails = [...packageDetails];
    newPackageDetails[currentPackageIndex] = details;
    setPackageDetails(newPackageDetails);

    if (currentPackageIndex < selectedOrders.size - 1) {
      // Move to next package
      setCurrentPackageIndex(currentPackageIndex + 1);
    } else {
      // All packages are done, print labels
      printLabels(newPackageDetails);
      setPackageModalOpen(false);
      setCurrentPackageIndex(0);
      setModifiedDetails({});
    }
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
    if (selectedOrders.size === 0) {
      alert('Please select at least one order to print shipping labels.');
      return;
    }
    
    // Check if all packages have details, either in packageDetails or modifiedDetails
    const allPackagesHaveDetails = Array.from({ length: selectedOrders.size }).every((_, index) => {
      const details = modifiedDetails[index] || packageDetails[index];
      return details && details.length > 0 && details.width > 0 && details.height > 0 && details.weight > 0;
    });
    
    if (allPackagesHaveDetails) {
      // Create a combined array of all package details
      const combinedDetails = Array.from({ length: selectedOrders.size }, (_, index) => 
        modifiedDetails[index] || packageDetails[index]
      );
      printLabels(combinedDetails);
    } else {
      setCurrentPackageIndex(0);
      setPackageModalOpen(true);
    }
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