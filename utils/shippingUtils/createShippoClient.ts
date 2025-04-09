import { ShippoInstance } from './ShippoInstance';

export function createShippoClient(): ShippoInstance | null {
  try {
    // Import Shippo using the modern import approach
    const { Shippo } = require('shippo');

    // Initialize using the new constructor syntax
    const shippoClient = new Shippo({
      apiKeyHeader: `ShippoToken ${process.env.SHIPPO_TEST_KEY}`,
    });

    console.log('Shippo client initialized successfully');
    return shippoClient;
  } catch (error) {
    console.error('Error initializing Shippo:', error);
    return null;
  }
}

// Initialize the Shippo client
export const shippoClient = createShippoClient();