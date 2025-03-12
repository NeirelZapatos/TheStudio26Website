import { useState, useEffect } from 'react';
import { Package, X } from 'lucide-react';

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
  onClear?: () => void;
  initialValues?: PackageDetails;
}

const PackageDetailsModal: React.FC<PackageDetailsModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit,
  onClear,
  initialValues 
}) => {
  const [packageDetails, setPackageDetails] = useState<PackageDetails>({
    length: 0,
    width: 0,
    height: 0,
    weight: 0,
  });
  const [errors, setErrors] = useState<{ [key: string]: boolean }>({});

  // Reset form or populate with initial values when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialValues) {
        setPackageDetails(initialValues);
      } else {
        setPackageDetails({ length: 0, width: 0, height: 0, weight: 0 });
      }
      setErrors({});
    }
  }, [isOpen, initialValues]);

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

    onSubmit(packageDetails);
    onClose();
  };

  const handleClear = () => {
    if (onClear) {
      onClear();
      onClose();
    }
  };

  const handlePackageDetailChange = (field: keyof PackageDetails, value: string) => {
    setPackageDetails({
      ...packageDetails,
      [field]: parseFloat(value),
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">
          {initialValues ? 'Edit Package Details' : 'Enter Package Details'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Package Details</h3>
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
                  value={packageDetails.length}
                  onChange={(e) => handlePackageDetailChange('length', e.target.value)}
                  className={`w-full p-2 border rounded ${errors['length'] ? 'border-red-500' : 'border-gray-300'}`}
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
                  value={packageDetails.width}
                  onChange={(e) => handlePackageDetailChange('width', e.target.value)}
                  className={`w-full p-2 border rounded ${errors['width'] ? 'border-red-500' : 'border-gray-300'}`}
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
                  value={packageDetails.height}
                  onChange={(e) => handlePackageDetailChange('height', e.target.value)}
                  className={`w-full p-2 border rounded ${errors['height'] ? 'border-red-500' : 'border-gray-300'}`}
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
                  value={packageDetails.weight}
                  onChange={(e) => handlePackageDetailChange('weight', e.target.value)}
                  className={`w-full p-2 border rounded ${errors['weight'] ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors['weight'] && (
                  <p className="text-red-600 text-xs mt-1">Weight is required</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-between gap-2">
            {initialValues && onClear && (
              <button
                type="button"
                onClick={handleClear}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center"
              >
                <X className="w-4 h-4 mr-1" />
                Clear Package
              </button>
            )}
            <div className="flex gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {initialValues ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PackageDetailsModal;