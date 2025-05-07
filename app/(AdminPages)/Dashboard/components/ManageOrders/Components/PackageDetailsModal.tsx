import React, { useState, useEffect } from 'react';

interface PackageDetails {
  length: number;
  width: number;
  height: number;
  weight: number;
}

interface PackageDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (details: PackageDetails) => void;
  initialValues?: PackageDetails;
  currentPackageIndex: number;
  totalPackages: number;
  onPrevious: () => void;
  onNext: () => void;
  customerName: string;
  orderId: string;
  modifiedDetails: {[index: number]: PackageDetails};
  handleTemporaryUpdate: (details: PackageDetails) => void;
}

const PackageDetailsModal: React.FC<PackageDetailsModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit,
  initialValues,
  currentPackageIndex,
  totalPackages,
  onPrevious,
  onNext,
  customerName,
  orderId,
  modifiedDetails,
  handleTemporaryUpdate
}) => {
  const [packageDetails, setPackageDetails] = useState<PackageDetails>({
    length: 0,
    width: 0,
    height: 0,
    weight: 0,
  });
  const [errors, setErrors] = useState<{ [key: string]: boolean }>({});

  // Sync the modal's state with stored details or initialValues
  useEffect(() => {
    console.log("Effect running with:", {
      currentPackageIndex,
      hasModifiedDetails: !!modifiedDetails[currentPackageIndex],
      initialValues
    });
    
    // If we have modified details for this index, use those
    if (modifiedDetails[currentPackageIndex]) {
      console.log("Using modified details:", modifiedDetails[currentPackageIndex]);
      setPackageDetails(modifiedDetails[currentPackageIndex]);
    }
    // Otherwise use initialValues if provided
    else if (initialValues) {
      console.log("Using initialValues:", initialValues);
      setPackageDetails(initialValues);
    }
    // Only reset if we have neither modified details nor initialValues
    else {
      console.log("Using default values");
      setPackageDetails({ length: 0, width: 0, height: 0, weight: 0 });
    }
  }, [currentPackageIndex, initialValues, modifiedDetails]);

  const validateInputs = () => {
    const newErrors: { [key: string]: boolean } = {};

    if (packageDetails.length <= 0) newErrors['length'] = true;
    if (packageDetails.width <= 0) newErrors['width'] = true;
    if (packageDetails.height <= 0) newErrors['height'] = true;
    if (packageDetails.weight <= 0) newErrors['weight'] = true;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateInputs()) {
      return;
    }

    const isLastPackage = currentPackageIndex === totalPackages - 1;

    // Save current package details
    handleTemporaryUpdate(packageDetails);
    
    if (isLastPackage) {
      // Only submit for printing if it's the last package
      onSubmit(packageDetails);
    } else {
      // Otherwise, just go to the next package
      onNext();
    }
  };

  const handlePackageDetailChange = (field: keyof PackageDetails, value: string) => {
    const updatedDetails = {
      ...packageDetails,
      [field]: parseFloat(value),
    };
    
    setPackageDetails(updatedDetails);
    
    // Store the change immediately to prevent losing data on navigation
    handleTemporaryUpdate(updatedDetails);
  };
  
  const handlePrevious = () => {
    // Store current values before navigating
    handleTemporaryUpdate(packageDetails);
    onPrevious();
  };

  if (!isOpen) return null;

  const isLastPackage = currentPackageIndex === totalPackages - 1;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">
          {initialValues?.length || initialValues?.width || initialValues?.height || initialValues?.weight 
            ? 'Edit Package Details' 
            : 'Enter Package Details'}
        </h2>

        <div className="mb-4 p-3 bg-gray-50 rounded-md border border-gray-200">
          <div className="text-base">
            <span className="font-semibold text-gray-700">Customer:</span> {customerName}
          </div>
          <div className="text-base mt-1">
            <span className="font-semibold text-gray-700">Order ID:</span> <span className="font-mono text-sm">{orderId}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Package Dimensions</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Length (in)
                  {errors['length'] && <span className="text-red-600 ml-1">*</span>}
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={packageDetails.length || ''}
                  onChange={(e) => handlePackageDetailChange('length', e.target.value)}
                  placeholder="Length required"
                  className={`w-full p-2 border rounded ${errors['length'] ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                {errors['length'] && (
                  <p className="text-red-600 text-xs mt-1">Length is required</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Width (in)
                  {errors['width'] && <span className="text-red-600 ml-1">*</span>}
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={packageDetails.width || ''}
                  onChange={(e) => handlePackageDetailChange('width', e.target.value)}
                  placeholder="Width required"
                  className={`w-full p-2 border rounded ${errors['width'] ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                {errors['width'] && (
                  <p className="text-red-600 text-xs mt-1">Width is required</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Height (in)
                  {errors['height'] && <span className="text-red-600 ml-1">*</span>}
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={packageDetails.height || ''}
                  onChange={(e) => handlePackageDetailChange('height', e.target.value)}
                  placeholder="Height required"
                  className={`w-full p-2 border rounded ${errors['height'] ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                {errors['height'] && (
                  <p className="text-red-600 text-xs mt-1">Height is required</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Weight (lb)
                  {errors['weight'] && <span className="text-red-600 ml-1">*</span>}
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={packageDetails.weight || ''}
                  onChange={(e) => handlePackageDetailChange('weight', e.target.value)}
                  placeholder="Weight required"
                  className={`w-full p-2 border rounded ${errors['weight'] ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                {errors['weight'] && (
                  <p className="text-red-600 text-xs mt-1">Weight is required</p>
                )}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t mt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {currentPackageIndex + 1} of {totalPackages} packages
              </div>
              
              <div className="flex gap-2">
                {currentPackageIndex > 0 && (
                  <button
                    type="button"
                    onClick={handlePrevious}
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Previous
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {isLastPackage ? 'Print' : 'Next'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PackageDetailsModal;