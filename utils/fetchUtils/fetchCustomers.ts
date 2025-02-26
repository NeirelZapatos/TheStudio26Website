import { ICustomer } from '@/app/models/Customer'; // Import the ICustomer interface from the Customer model

// Fetch all customers
export const fetchCustomers = async (): Promise<ICustomer[]> => {
  try {
    const response = await fetch('/api/customers'); // Fetch customer data from the API
    if (!response.ok) throw new Error("Failed to fetch customers."); // Throw an error if the response is not OK

    const customersData = await response.json(); // Parse the JSON response
    return customersData.map((customer: ICustomer) => ({
      ...customer, // Return customer data
    }));
  } catch (error) {
    console.error("Failed to fetch customers:", error); // Log any errors
    throw error; // Re-throw the error to handle it in the hook
  }
};