export interface ShippoInstance {
  transactions: {
    create: (params: any) => Promise<{
      testTrackingNumber: string;
      objectId: string;
      status: string;
      labelUrl: string;
      trackingNumber: string;
      trackingUrlProvider: string;
      commercialInvoiceUrl?: string;
      messages?: Array<any>;
    }>;
  };
  shipments: {
    create: (params: any) => Promise<{
      objectId: string;
      rates: Array<{
        objectId: string;
        amount: string;
        currency: string;
        provider: string;
        carrierAccount: string;
        servicelevel: {
          token: string;
          name: string;
        };
      }>;
    }>;
  };
  addresses: {
    create: (params: any) => Promise<{
      objectId: string;
      isValid: boolean;
      validationResults?: {
        isValid: boolean;
        messages: Array<{
          source: string;
          code: string;
          text: string;
          type: string; // Added missing 'type' property
        }>;
      };
      name?: string;
      company?: string;
      street1: string;
      street2?: string;
      street3?: string;
      streetNo?: string;
      city: string;
      state: string;
      zip: string;
      country: string;
      phone?: string;
      email?: string;
      isResidential?: boolean;
      metadata?: string;
      objectOwner?: string;
      objectState?: string;
      objectCreated?: string;
      objectUpdated?: string;
      test?: boolean; // Added missing 'test' property
    }>;
    validate: (addressId: string) => Promise<{
      isValid: boolean;
      validation_results: {
        isValid: boolean;
        messages: Array<{
          source: string;
          code: string;
          text: string;
          type: string; // Added missing 'type' property
        }>;
      };
    }>;
  };
}