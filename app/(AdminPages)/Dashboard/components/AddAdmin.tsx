import React, { useEffect, useState } from "react";

interface Admin {
  _id: string;
  email: string;
}

const AddAdmin = () => {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false); // Loading state
  const [successMessage, setSuccessMessage] = useState<string | null>(null); // Success message state

  useEffect(() => {
    const fetchAdmins = async () => {
      setLoading(true); // Start loading when the request is initiated
      try {
        const response = await fetch("/api/admins"); // Adjust the API route if needed
        if (!response.ok) {
          throw new Error("Failed to fetch admins");
        }
        const data = await response.json();
        console.log(data);
        setAdmins(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false); // Set loading to false once the request is finished
      }
    };

    fetchAdmins();
  }, []);

  const handleDelete = async (id: string) => {
    console.log(`Delete admin with ID: ${id}`);
    try {
      const response = await fetch(`/api/admins/${id}`, {
        method: "DELETE", // Method to delete the resource
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete admin");
      }

      // Optionally, you can update the local state to remove the deleted admin from the UI
      setAdmins((prevAdmins) => prevAdmins.filter((admin) => admin._id !== id));
      console.log(`Admin with ID: ${id} deleted successfully`);
    } catch (err: any) {
      setError(err.message);
      console.error("Error deleting admin:", err);
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Logic to add a new admin
    try {
      const response = await fetch("/api/admins", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error("Failed to add admin. Make sure password is at least 5 characters");
      }

      const data = await response.json();
      setAdmins((prevAdmins) => [...prevAdmins, data]);
      setEmail(""); // Reset email input field
      setPassword(""); // Reset password input field

      // Set the success message
      setSuccessMessage("Admin added successfully!");
      
      // Hide the success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);

    } catch (err: any) {
      setError(err.message);
    }
  };

  // Sort admins: always display thestudio26llcwebsite@gmail.com first
  const sortedAdmins = admins.sort((a, b) => {
    if (a.email === "thestudio26llcwebsite@gmail.com") return -1;
    if (b.email === "thestudio26llcwebsite@gmail.com") return 1;
    return 0;
  });

  return (
    <section className="bg-white shadow rounded-lg p-6">
      <h1 className="text-2xl font-semibold mb-4">Admin Management</h1>

      {/* Add Admin Form */}
      <h1 className="text-xl font-semibold mb-4">Add Admin</h1>
      <form onSubmit={handleAddAdmin} className="space-y-4 mb-6">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          />
        </div>
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
        >
          Add Admin
        </button>
      </form>

      {/* Display Success Message */}
      {successMessage && (
        <div className="text-green-500 mb-4">{successMessage}</div> // Show success message in green
      )}

      {/* Loading or Admin List */}
      {loading ? (
        <p className="text-blue-500">Loading admins...</p> // Show "Loading..." message while fetching
      ) : (
        <div>
          {/* Existing Admins List */}
          {error && <p className="text-red-500">{error}</p>}

          <h3 className="text-xl font-semibold mb-3">Emails:</h3>

          <div className="space-y-2">
            {sortedAdmins.length > 0 ? (
              sortedAdmins.map((admin: Admin) => (
                <div
                  key={admin._id}
                  className="flex justify-between items-center text-gray-700 border-b border-gray-300 pb-2"
                >
                  <div className="flex items-center">
                    <span>{admin.email}</span>
                    {admin.email === "thestudio26llcwebsite@gmail.com" && (
                      <span className="text-green-500 font-bold ml-2">- Owner</span>
                    )}
                  </div>

                  {/* If it's the special email, display no delete button */}
                  {admin.email !== "thestudio26llcwebsite@gmail.com" && (
                    <button
                      onClick={() => handleDelete(admin._id)}
                      className="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  )}
                </div>
              ))
            ) : (
              <p>No admins found.</p>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default AddAdmin;
