import { useState } from 'react';
import { printShippingLabels } from '@/app/(AdminPages)/Dashboard/components/ManageOrders/PrintShippingLabels';
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
  setSelectedOrders: (orders: Set<string>) => void // Add setSelectedOrders as a parameter
) => {
  const [packageDetails, setPackageDetails] = useState<PackageDetails[]>([]);
  const [isPackageModalOpen, setPackageModalOpen] = useState(false);
  const [currentPackageIndex, setCurrentPackageIndex] = useState(0);
  const [hasBeenInitialized, setHasBeenInitialized] = useState<boolean[]>([]);

  const handlePackageDetailsSubmit = (details: PackageDetails) => {
    const newPackageDetails = [...packageDetails];
    newPackageDetails[currentPackageIndex] = details;
    setPackageDetails(newPackageDetails);

    const newHasBeenInitialized = [...hasBeenInitialized];
    newHasBeenInitialized[currentPackageIndex] = true;
    setHasBeenInitialized(newHasBeenInitialized);

    if (currentPackageIndex < selectedOrders.size - 1) {
      setCurrentPackageIndex(currentPackageIndex + 1);
    } else {
      printLabels(newPackageDetails);
      setPackageModalOpen(false);
      setPackageDetails([]);
      setHasBeenInitialized([]);
      setCurrentPackageIndex(0);
    }
  };

  const printLabels = async (details: PackageDetails[]) => {
    try {
      const labels = await printShippingLabels(Array.from(selectedOrders), orders || [], details);
      if (labels.length > 0) {
        alert('Shipping labels printed successfully!');
        setSelectedOrders(new Set()); // Use setSelectedOrders here
        setPackageDetails([]);
        setHasBeenInitialized([]);
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
    if (packageDetails.length === selectedOrders.size) {
      printLabels(packageDetails);
    } else {
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
  };
};