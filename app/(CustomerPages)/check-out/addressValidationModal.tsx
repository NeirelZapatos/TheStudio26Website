// components/AddressValidationModal.tsx
import React from 'react';

interface AddressValidationModalProps {
  show: boolean;
  message: string;
  originalAddress?: any;
  suggestedAddress?: any;
  onUseSuggested: () => void;
  onUseOriginal: () => void;
  onEditAddress: () => void;
  name?: string;
  phone?: string;
}


const AddressValidationModal: React.FC<AddressValidationModalProps> = ({
  show,
  message,
  suggestedAddress,
  onEditAddress
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
        <h3 className="text-xl font-semibold mb-4 text-red-600">Address Validation Error</h3>
        <p className="mb-4">{message}</p>
        
        {suggestedAddress && (
          <div className="mb-4">
            <p className="font-medium mb-2">Suggested address:</p>
            <div className="bg-gray-50 p-3 rounded text-sm">
              <p>{suggestedAddress.street1}</p>
              {suggestedAddress.street2 && <p>{suggestedAddress.street2}</p>}
              <p>{suggestedAddress.city}, {suggestedAddress.state} {suggestedAddress.zip}</p>
              <p>{suggestedAddress.country}</p>
            </div>
          </div>
        )}
        
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onEditAddress}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Edit Address
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddressValidationModal;