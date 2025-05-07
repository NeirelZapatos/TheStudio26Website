import { shippoClient } from './createShippoClient';

interface TransactionParams {
  rate: string;
  label_file_type: string;
  async: boolean;
  test: boolean;
}

interface TransactionResponse {
  objectId: string;
  status: string;
  labelUrl?: string;
  trackingNumber?: string;
  trackingUrlProvider?: string;
  messages?: Array<{ text: string }>;
  // Add other properties you need from the response
}

export async function createShippoTransaction(
  selectedRate: { objectId: string },
  test_mode: boolean
): Promise<TransactionResponse> {
  // Create transaction
  let transaction: TransactionResponse;
  try {
    const transactionParams: TransactionParams = {
      rate: selectedRate.objectId,
      label_file_type: 'PDF_A4',
      async: false,
      test: test_mode
    };
    
    console.log('Creating transaction with params:', JSON.stringify(transactionParams, null, 2));
    
    if (!shippoClient) {
      throw new Error('Shippo client is not initialized');
    }
    
    transaction = await shippoClient.transactions.create(transactionParams);

    console.log('Transaction response:', JSON.stringify(transaction, null, 2));
    
    if (transaction.status !== 'SUCCESS' || !transaction.labelUrl) {
      console.error('Transaction failed or missing label URL:', transaction);
      throw new Error(
        transaction.messages ? 
        transaction.messages[0]?.text || 'Label creation failed' : 
        'No label URL returned from Shippo'
      );
    }

    console.log('Transaction created successfully:', transaction.objectId);
    return transaction;
  } catch (error: unknown) {
    const transactionError = error as Error;
    console.error('Shippo transaction error:', transactionError);
    throw new Error(`Shippo transaction error: ${transactionError.message || 'Unknown error'}`);
  }
}