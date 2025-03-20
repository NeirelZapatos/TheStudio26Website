"use client";

import React, { useState, useEffect } from "react";

interface EquipmentItem {
  _id?: string;
  name: string;
  price: number;
}

interface EquipmentItemForm {
  _id?: string;
  name: string;
  price: string;
}

interface FormErrors {
  name?: string;
  price?: string;
}

const RentalEquipmentSection = () => {
  const [items, setItems] = useState<EquipmentItem[]>([]);
  const [newItem, setNewItem] = useState<EquipmentItemForm>({ name: "", price: "" });
  const [editingItem, setEditingItem] = useState<EquipmentItemForm | null>(null);

  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    async function fetchItems() {
      try {
        const res = await fetch("/api/rentalItems");
        const data = await res.json();
        setItems(data);
      } catch (err) {
        console.error("Failed to fetch rental items:", err);
      }
    }
    fetchItems();
  }, []);

  // Validate form inputs (name and price)
  const validateForm = (item: EquipmentItemForm): boolean => {
    const newErrors: FormErrors = {};
    let valid = true;

    // Check for name
    if (!item.name.trim()) {
      newErrors.name = "Equipment name is required.";
      valid = false;
    }

    // Check for price
    if (!item.price.trim()) {
      newErrors.price = "Price is required.";
      valid = false;
    } else if (isNaN(parseFloat(item.price))) {
      newErrors.price = "Price must be a valid number.";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  // Handle input changes; store price as a string
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (editingItem) {
      setEditingItem((prev) => prev && { ...prev, [name]: value });
    } else {
      setNewItem((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Format the price on blur to ensure two decimal places.
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (e.target.name === "price" && e.target.value) {
      const formatted = parseFloat(e.target.value).toFixed(2);
      if (editingItem) {
        setEditingItem((prev) => prev && { ...prev, price: formatted });
      } else {
        setNewItem((prev) => ({ ...prev, price: formatted }));
      }
    }
  };

  // Create a new rental item
  const handleCreate = async () => {
    if (!validateForm(newItem)) return;

    try {
      const payload = {
        name: newItem.name,
        price: parseFloat(newItem.price),
      };

      const res = await fetch("/api/rentalItems", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error("Failed to create item");
      }
      const created = await res.json();
      setItems((prev) => [...prev, created]);
      setNewItem({ name: "", price: "" });
      setErrors({});
    } catch (err) {
      console.error(err);
    }
  };

  // Update an existing rental item
  const handleUpdate = async () => {
    if (!editingItem || !editingItem._id) return;

    if (!validateForm(editingItem)) return;

    try {
      const payload = {
        name: editingItem.name,
        price: parseFloat(editingItem.price),
      };

      const res = await fetch(`/api/rentalItems/${editingItem._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error("Failed to update item");
      }
      const updated = await res.json();

      setItems((prev) =>
        prev.map((item) => (item._id === updated._id ? updated : item))
      );
      setEditingItem(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setErrors({});
  };

  // Delete an item by its ID
  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/rentalItems/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error("Failed to delete item");
      }
      setItems((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // Start editing an item
  const handleEdit = (item: EquipmentItem) => {
    setEditingItem({ name: item.name, price: item.price.toFixed(2), _id: item._id });
    setErrors({});
  };
  const formData = editingItem || newItem;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Rental Equipment Management</h2>

      {/* Form to create or update an item */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold">
          {editingItem ? "Edit Equipment" : "Add New Equipment"}
        </h3>
        <div className="flex space-x-4 mt-2">
          <div className="flex flex-col w-full">
            <input
              type="text"
              name="name"
              placeholder="Equipment Name"
              value={formData.name}
              onChange={handleChange}
              className="input input-bordered w-full"
            />
            {/* Display error message for name if any */}
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>
          <div className="flex flex-col w-full">
            <input
              type="number"
              name="price"
              step="0.01"
              inputMode="decimal"
              value={formData.price}
              onChange={handleChange}
              onBlur={handleBlur}
              className="input input-bordered w-full"
            />
            {/* Display error message for price if any */}
            {errors.price && (
              <p className="text-red-500 text-sm mt-1">{errors.price}</p>
            )}
          </div>

          {editingItem ? (
            <>
              <button
                onClick={handleUpdate}
                className="bg-green-500 text-white px-4 py-2 rounded"
              >
                Update
              </button>
              <button
                onClick={handleCancelEdit}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={handleCreate}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Create
            </button>
          )}
        </div>
      </div>

      {/* Existing items list */}
      <table className="min-w-full bg-white shadow rounded">
        <thead>
          <tr className="bg-gray-200">
            <th className="py-2 px-4">Name</th>
            <th className="py-2 px-4">Price</th>
            <th className="py-2 px-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item._id}>
              <td className="border px-4 py-2">{item.name}</td>
              <td className="border px-4 py-2">${item.price.toFixed(2)}</td>
              <td className="border px-4 py-2 space-x-2">
                <button
                  onClick={() => handleEdit(item)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(item._id!)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RentalEquipmentSection;