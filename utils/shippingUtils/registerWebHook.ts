// registerWebhook.ts
import { shippoClient } from './createShippoClient';

interface WebhookRegistration {
  url: string;
  event: string;
  is_test: boolean;
}

interface WebhookResponse {
  object_id: string;
  url: string;
  event: string;
  is_test: boolean;
  [key: string]: any;
}

export async function registerShippoWebhook(
  webhookUrl: string, 
  isTest: boolean = false
): Promise<WebhookResponse> {
  try {
    if (!shippoClient) {
      throw new Error('Shippo client is not initialized');
    }

    const SHIPPO_API_KEY = process.env.Shippo_Test_Key;
    if (!SHIPPO_API_KEY) {
      throw new Error('Shippo API key is not configured');
    }

    const payload: WebhookRegistration = {
      url: webhookUrl,
      event: 'all', // Subscribe to all events
      is_test: isTest
    };

    const response = await fetch('https://api.goshippo.com/webhooks', {
      method: 'POST',
      headers: {
        'Authorization': `ShippoToken ${SHIPPO_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to register Shippo webhook: ${errorData.detail || response.statusText}`);
    }

    const webhookData: WebhookResponse = await response.json();
    console.log('Webhook registered successfully:', webhookData);
    return webhookData;
  } catch (error) {
    console.error('Error registering Shippo webhook:', error);
    throw error;
  }
}