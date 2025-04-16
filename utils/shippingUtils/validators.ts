// utils/shippingUtils/validators.ts
import { PackageDetails, PackageErrors } from './types';

/**
 * Validates package details to ensure all dimensions and weight are positive values
 * @param packageDetails The package details to validate
 * @returns An object with error flags for each invalid field and a valid flag
 */
export const validatePackageDetails = (packageDetails: PackageDetails): {
  errors: PackageErrors;
  isValid: boolean;
} => {
  const errors: PackageErrors = {};

  if (packageDetails.length <= 0) errors['length'] = true;
  if (packageDetails.width <= 0) errors['width'] = true;
  if (packageDetails.height <= 0) errors['height'] = true;
  if (packageDetails.weight <= 0) errors['weight'] = true;

  return {
    errors,
    isValid: Object.keys(errors).length === 0
  };
};