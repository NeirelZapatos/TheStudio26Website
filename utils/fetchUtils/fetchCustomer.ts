import { ICustomer } from '@/app/models/Customer'; // Import the ICustomer interface from the Customer model

// Fetch a single customer by ID
export const fetchCustomer = async (customerId: string): Promise<ICustomer> => {
  const response = await fetch(`/api/customers/${customerId}`); // Fetch customer data from the API
  if (!response.ok) throw new Error(`Failed to fetch customer: ${customerId}`); // Throw an error if the response is not OK
  return response.json(); // Return the parsed JSON response
};