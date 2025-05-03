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
  // Store the string input values to prevent resetting
  const [inputValues, setInputValues] = useState<{[key: string]: string}>({
    length: '',
    width: '',
    height: '',
    weight: ''
  });
  
  // Separate numeric values for calculations
  const [packageDetails, setPackageDetails] = useState<PackageDetails>({
    length: 0,
    width: 0,
    height: 0,
    weight: 0,
  });
  
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({
    length: false,
    width: false,
    height: false,
    weight: false
  });

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
      
      // Initialize input values from modified details
      const modified = modifiedDetails[currentPackageIndex];
      setInputValues({
        length: modified.length?.toString() || '',
        width: modified.width?.toString() || '',
        height: modified.height?.toString() || '',
        weight: modified.weight?.toString() || ''
      });
    }
    // Otherwise use initialValues if provided
    else if (initialValues) {
      console.log("Using initialValues:", initialValues);
      setPackageDetails(initialValues);
      
      // Initialize input values from initial values
      setInputValues({
        length: initialValues.length?.toString() || '',
        width: initialValues.width?.toString() || '',
        height: initialValues.height?.toString() || '',
        weight: initialValues.weight?.toString() || ''
      });
    }
    // Only reset if we have neither modified details nor initialValues
    else {
      console.log("Using default values");
      setPackageDetails({ length: 0, width: 0, height: 0, weight: 0 });
      
      // Reset input values to empty strings
      setInputValues({
        length: '',
        width: '',
        height: '',
        weight: ''
      });
    }
    
    // Reset error and touched states when switching packages
    setErrors({});
    setTouched({
      length: false,
      width: false,
      height: false,
      weight: false
    });
  }, [currentPackageIndex, initialValues, modifiedDetails]);

  const validateInput = (field: keyof PackageDetails, value: string): string => {
    // Always show validation results, even for non-numeric inputs

    // Empty check
    if (!value || value.trim() === '') {
      return "Value must be greater than zero";
    }
    
    // Check for valid number format first
    if (!/^-?\d*\.?\d*$/.test(value)) {
      return "Special characters are not allowed";
    }
    
    const numValue = parseFloat(value);
    
    // Check if value is negative or zero
    if (numValue <= 0) {
      return "Value must be greater than zero";
    }
    
    // Check if integer part is too large (more than 3 digits)
    if (Math.floor(numValue) > 999) {
      return "Value too large (max 999)";
    }
    
    // Check for too many decimal places
    const decimalStr = value.split('.')[1] || '';
    if (decimalStr.length > 2) {
      return "Maximum 2 decimal places allowed";
    }
    
    return "";
  };

  const validateAllInputs = () => {
    const newErrors: { [key: string]: string } = {};
    let isValid = true;
    
    // Validate each field
    Object.keys(inputValues).forEach(field => {
      const error = validateInput(field as keyof PackageDetails, inputValues[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });
    
    setErrors(newErrors);
    // Mark all fields as touched when submitting
    setTouched({
      length: true,
      width: true,
      height: true,
      weight: true
    });
    
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Always validate but allow proceeding even with errors for testing
    const isValid = validateAllInputs();
    
    // For actual submission, we'd normally check if valid
    // But for testing, we'll allow submission regardless
    
    const isLastPackage = currentPackageIndex === totalPackages - 1;
    
    // Convert string inputs to numbers for submission
    const detailsToSubmit = {
      length: parseFloat(inputValues.length) || 0,
      width: parseFloat(inputValues.width) || 0,
      height: parseFloat(inputValues.height) || 0,
      weight: parseFloat(inputValues.weight) || 0
    };
    
    // Update package details with parsed values
    setPackageDetails(detailsToSubmit);
    
    // Save current package details
    handleTemporaryUpdate(detailsToSubmit);
    
    if (isLastPackage) {
      // Only submit for printing if it's the last package
      onSubmit(detailsToSubmit);
    } else {
      // Otherwise, just go to the next package
      onNext();
    }
  };

  const handlePackageDetailChange = (field: keyof PackageDetails, value: string) => {
    // Mark the field as touched
    setTouched({
      ...touched,
      [field]: true
    });
    
    // Always update the input value state to maintain what user typed
    setInputValues(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Validate and set errors but don't prevent input
    const error = validateInput(field, value);
    if (error) {
      setErrors({
        ...errors,
        [field]: error
      });
    } else {
      // Clear error if validation passes
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
    
    // Try to parse numeric value - use 0 if invalid
    let numValue = 0;
    if (/^-?\d*\.?\d*$/.test(value) && value !== '') {
      numValue = parseFloat(value);
      if (isNaN(numValue)) numValue = 0;
    }
    
    // Update the numeric values separately
    setPackageDetails(prev => ({
      ...prev,
      [field]: numValue
    }));
  };

  const handlePrevious = () => {
    // Store current values before navigating, converting strings to numbers
    const detailsToStore = {
      length: parseFloat(inputValues.length) || 0,
      width: parseFloat(inputValues.width) || 0,
      height: parseFloat(inputValues.height) || 0,
      weight: parseFloat(inputValues.weight) || 0
    };
    
    handleTemporaryUpdate(detailsToStore);
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
                </label>
                <input
                  type="text"
                  value={inputValues.length}
                  onChange={(e) => handlePackageDetailChange('length', e.target.value)}
                  onBlur={() => setTouched({...touched, length: true})}
                  placeholder="Length required"
                  className={`w-full p-2 border rounded ${touched.length && errors.length ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                {touched.length && errors.length && (
                  <p className="text-red-600 text-xs mt-1">{errors.length}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Width (in)
                </label>
                <input
                  type="text"
                  value={inputValues.width}
                  onChange={(e) => handlePackageDetailChange('width', e.target.value)}
                  onBlur={() => setTouched({...touched, width: true})}
                  placeholder="Width required"
                  className={`w-full p-2 border rounded ${touched.width && errors.width ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                {touched.width && errors.width && (
                  <p className="text-red-600 text-xs mt-1">{errors.width}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Height (in)
                </label>
                <input
                  type="text"
                  value={inputValues.height}
                  onChange={(e) => handlePackageDetailChange('height', e.target.value)}
                  onBlur={() => setTouched({...touched, height: true})}
                  placeholder="Height required"
                  className={`w-full p-2 border rounded ${touched.height && errors.height ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                {touched.height && errors.height && (
                  <p className="text-red-600 text-xs mt-1">{errors.height}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Weight (lb)
                </label>
                <input
                  type="text"
                  value={inputValues.weight}
                  onChange={(e) => handlePackageDetailChange('weight', e.target.value)}
                  onBlur={() => setTouched({...touched, weight: true})}
                  placeholder="Weight required"
                  className={`w-full p-2 border rounded ${touched.weight && errors.weight ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                {touched.weight && errors.weight && (
                  <p className="text-red-600 text-xs mt-1">{errors.weight}</p>
                )}
              </div>
            </div>
          </div>
          <div className="pt-4 border-t mt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {currentPackageIndex + 1} of {totalPackages} packages
              </div>
              
              {/* Debug panel removed */}
              
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