interface Customer {
    _id: string; // Customer ID
    first_name: string; // Customer first name
    last_name: string; // Customer last name
    email: string; // Customer email
    phone_number?: string; // Optional customer phone number
  }
  
  // Sort customers by first name and last name
  const sortCustomers = (customers: Customer[]): Customer[] => {
    console.log("Input Customers:", customers); // Log the input data
  
    // Filter out invalid customers (missing first_name or last_name)
    const validCustomers = customers.filter(
      (customer) => customer.first_name && customer.last_name
    );
  
    console.log("Valid Customers:", validCustomers); // Log the filtered data
  
    const sorted = [...validCustomers].sort((a, b) => {
      const firstNameA = a.first_name.toLowerCase(); // Convert first name to lowercase for comparison
      const firstNameB = b.first_name.toLowerCase(); // Convert first name to lowercase for comparison
      const lastNameA = a.last_name.toLowerCase(); // Convert last name to lowercase for comparison
      const lastNameB = b.last_name.toLowerCase(); // Convert last name to lowercase for comparison
  
      // Compare first names first
      const firstNameCompare = firstNameA.localeCompare(firstNameB); // Compare first names
      if (firstNameCompare !== 0) return firstNameCompare; // Return comparison result if first names differ
  
      // If first names are equal, compare last names
      return lastNameA.localeCompare(lastNameB); // Compare last names
    });
  
    console.log("Sorted Customers:", sorted); // Log the sorted array
    return sorted; // Return the sorted customers
  };
  
  export default sortCustomers; // Export the sortCustomers function