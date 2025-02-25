import { IItem } from "@/app/models/Item"; // Import the IItem interface from the Item model

// Fetch a single item by ID
export const fetchItem = async (itemId: string): Promise<IItem> => {
  const response = await fetch(`/api/items/${itemId}`); // Fetch item data from the API
  if (!response.ok) throw new Error(`Failed to fetch item: ${itemId}`); // Throw an error if the response is not OK
  return response.json(); // Return the parsed JSON response
};