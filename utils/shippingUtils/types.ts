// utils/shippingUtils/types.ts

export interface PackageDetails {
    length: number;
    width: number;
    height: number;
    weight: number;
  }
  
  export interface PackageDetailsModalProps {
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
  
  export interface PackageErrors {
    [key: string]: boolean;
  }