import { Plus } from "lucide-react";
import React, { useState } from "react";

/**
 * AddCustomerForm Component:
 * Provides a form to add a new customer.
 * 
 * Props:
 * - addCustomer: A function to handle the addition of a new customer.
 * - loading: A boolean indicating whether the form is in a loading state.
 */
interface AddCustomerFormProps {
  addCustomer: (customerData: any) => void; // Function to add a new customer
  loading: boolean; // Loading state for the "Add Customer" button
}

/**
 * AddCustomerForm Functional Component:
 * Renders a form with input fields for adding a new customer and handles form submission.
 */
const AddCustomerForm: React.FC<AddCustomerFormProps> = ({ addCustomer, loading }) => {
  // State to manage the new customer's data
  const [newCustomer, setNewCustomer] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
  });

  /**
   * Handles form submission.
   * Validates required fields and calls the `addCustomer` function.
   * @param e - The form event.
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Prevent page refresh

    // Validate required fields
    if (!newCustomer.first_name || !newCustomer.last_name || !newCustomer.email) {
      alert("Please fill out all required fields.");
      return;
    }

    // Call the addCustomer function
    addCustomer(newCustomer);

    // Reset the form after submission
    setNewCustomer({
      first_name: "",
      last_name: "",
      email: "",
      phone_number: "",
    });
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-4 sm:p-6 w-full h-full">
      <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mb-4 sm:mb-6 border-b pb-2 sm:pb-3">Add New Customer</h3>
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {/* Input for first name */}
        <input
          type="text"
          placeholder="First Name"
          value={newCustomer.first_name}
          onChange={(e) => setNewCustomer({ ...newCustomer, first_name: e.target.value })}
          className="p-2 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-200"
          required
        />
        {/* Input for last name */}
        <input
          type="text"
          placeholder="Last Name"
          value={newCustomer.last_name}
          onChange={(e) => setNewCustomer({ ...newCustomer, last_name: e.target.value })}
          className="p-2 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-200"
          required
        />
        {/* Input for email */}
        <input
          type="email"
          placeholder="Email"
          value={newCustomer.email}
          onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
          className="p-2 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-200"
          required
        />
        {/* Input for phone number (optional) */}
        <input
          type="tel"
          placeholder="Phone Number (Optional)"
          value={newCustomer.phone_number}
          onChange={(e) => setNewCustomer({ ...newCustomer, phone_number: e.target.value })}
          className="p-2 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-200"
        />
        {/* Submit button */}
        <button
          type="submit"
          className="flex items-center justify-center bg-blue-500 text-white py-2 px-4 rounded-xl hover:bg-blue-600 transition-colors col-span-1 sm:col-span-2"
          disabled={loading} // Disable button when loading
        >
          <Plus className="mr-2" size={18} />
          {loading ? "Adding..." : "Add Customer"}
        </button>
      </form>
    </div>
  );
};

export default AddCustomerForm;