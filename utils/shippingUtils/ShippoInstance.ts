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
  }