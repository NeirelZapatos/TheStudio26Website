// utils/shippingUtils/handlers.ts
import { PackageDetails } from './types';

/**
 * Updates a single field in the package details
 * @param currentDetails Current package details
 * @param field The field to update
 * @param value The new value as a string
 * @returns Updated package details
 */
export const updatePackageDetailField = (
  currentDetails: PackageDetails,
  field: keyof PackageDetails,
  value: string
): PackageDetails => {
  return {
    ...currentDetails,
    [field]: parseFloat(value) || 0, // Default to 0 if parsing fails
  };
};

/**
 * Gets the initial state for a package based on preferences
 * @param currentIndex Current package index
 * @param modifiedDetails Previously modified package details
 * @param initialValues Default initial values
 * @returns The package details to use
 */
export const getInitialPackageState = (
  currentIndex: number,
  modifiedDetails: {[index: number]: PackageDetails},
  initialValues?: PackageDetails
): PackageDetails => {
  // If we have modified details for this index, use those
  if (modifiedDetails[currentIndex]) {
    return modifiedDetails[currentIndex];
  }
  
  // Otherwise use initialValues if provided
  if (initialValues) {
    return initialValues;
  }
  
  // Default values if neither is available
  return { length: 0, width: 0, height: 0, weight: 0 };
};

/**
 * Determines if the package details form is being used to edit existing details
 * @param initialValues The initial values provided
 * @returns Boolean indicating if this is an edit operation
 */
export const isEditingExistingPackage = (initialValues?: PackageDetails): boolean => {
  return !!(
    initialValues?.length || 
    initialValues?.width || 
    initialValues?.height || 
    initialValues?.weight
  );
};