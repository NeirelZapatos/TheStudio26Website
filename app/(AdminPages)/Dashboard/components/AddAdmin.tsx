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
  const [loading, setLoading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [deleteMessage, setDeleteMessage] = useState<string | null>(null); // New state for delete confirmation

  useEffect(() => {
    const fetchAdmins = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/admins");
        if (!response.ok) throw new Error("Failed to fetch admins");

        const data = await response.json();
        setAdmins(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAdmins();
  }, []);

  const handleDelete = async (id: string, email: string) => {
    try {
      const response = await fetch(`/api/admins/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error("Failed to delete admin");

      setAdmins((prevAdmins) => prevAdmins.filter((admin) => admin._id !== id));

      // Set delete success message
      setDeleteMessage(`Admin ${email} deleted successfully!`);
      setTimeout(() => setDeleteMessage(null), 3000); // Clear message after 3 seconds
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) throw new Error("Failed to add admin. Password must be at least 5 characters.");

      const data = await response.json();
      setAdmins((prevAdmins) => [...prevAdmins, data]);
      setEmail("");
      setPassword("");

      setSuccessMessage("Admin added successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const sortedAdmins = admins.sort((a, b) => 
    a.email === "thestudio26llcwebsite@gmail.com" ? -1 : 
    b.email === "thestudio26llcwebsite@gmail.com" ? 1 : 0
  );

  return (
    <section className="bg-white shadow rounded-lg p-6">
      <h1 className="text-2xl font-semibold mb-4">Admin Management</h1>

      {/* Add Admin Form */}
      <h2 className="text-xl font-semibold mb-4">Add Admin</h2>
      <form onSubmit={handleAddAdmin} className="space-y-4 mb-6">
        <div className="form-control">
          <label htmlFor="email" className="label">
            <span className="label-text">Email</span>
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input input-bordered w-full"
            required
          />
        </div>
        <div className="form-control">
          <label htmlFor="password" className="label">
            <span className="label-text">Password</span>
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input input-bordered w-full"
            required
          />
        </div>
        <button type="submit" className="btn btn-primary w-full">
          Add Admin
        </button>
      </form>

      {/* Display Messages */}
      {successMessage && <div className="alert alert-success">{successMessage}</div>}
      {deleteMessage && <div className="alert alert-warning">{deleteMessage}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {/* Loading or Admin List */}
      {loading ? (
        <p className="text-blue-500">Loading admins...</p>
      ) : (
        <div>
          <h3 className="text-xl font-semibold mb-3">Emails:</h3>
          <div className="space-y-2">
            {sortedAdmins.length > 0 ? (
              sortedAdmins.map((admin) => (
                <div key={admin._id} className="flex justify-between items-center bg-gray-100 p-3 rounded-lg shadow">
                  <div className="flex items-center">
                    <span>{admin.email}</span>
                    {admin.email === "thestudio26llcwebsite@gmail.com" && (
                      <span className="badge badge-success ml-2">Owner</span>
                    )}
                  </div>
                  {admin.email !== "thestudio26llcwebsite@gmail.com" && (
                    <button
                      onClick={() => handleDelete(admin._id, admin.email)}
                      className="btn btn-error btn-sm"
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
