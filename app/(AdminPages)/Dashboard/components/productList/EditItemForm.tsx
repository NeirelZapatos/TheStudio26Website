import React, { useState } from "react";
import { Item } from "./ItemCard";

interface EditItemFormProps {
  initialItem: Item;
  onSave: (updatedItem: Item) => void;
  onCancel: () => void;
  onDelete: (item: Item) => void;
}

const EditItemForm: React.FC<EditItemFormProps> = ({
  initialItem,
  onSave,
  onCancel,
  onDelete,
}) => {
  const [item, setItem] = useState<Item>(initialItem);

  const handleSaveClick = () => {
    const updatedItem = {
      ...item,
      price: Number(item.price),
      quantity_in_stock: Number(item.quantity_in_stock),
    };
    onSave(updatedItem);
  };

  const handleDeleteClick = () => {
      onDelete(item);
  };

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Edit Item</h2>

      {/* Item Name */}
      <div className="mb-4">
        <label
          htmlFor="itemName"
          className="block text-gray-700 font-semibold mb-2"
        >
          Item Name
        </label>
        <input
          id="itemName"
          type="text"
          value={item.name}
          onChange={(e) => setItem({ ...item, name: e.target.value })}
          className="border border-gray-300 rounded px-3 py-2 w-full"
        />
      </div>

      {/* Description */}
      <div className="mb-4">
        <label
          htmlFor="itemDescription"
          className="block text-gray-700 font-semibold mb-2"
        >
          Description
        </label>
        <textarea
          id="itemDescription"
          value={item.description}
          onChange={(e) =>
            setItem({ ...item, description: e.target.value })
          }
          className="border border-gray-300 rounded px-3 py-2 w-full"
        />
      </div>

      {/* Price */}
      <div className="mb-4">
        <label
          htmlFor="itemPrice"
          className="block text-gray-700 font-semibold mb-2"
        >
          Price
        </label>
        <input
          id="itemPrice"
          type="number"
          value={item.price}
          onChange={(e) =>
            setItem({ ...item, price: parseFloat(e.target.value) })
          }
          className="border border-gray-300 rounded px-3 py-2 w-full"
        />
      </div>

      {/* Category */}
      <div className="mb-4">
        <label
          htmlFor="itemCategory"
          className="block text-gray-700 font-semibold mb-2"
        >
          Category
        </label>
        <input
          id="itemCategory"
          type="text"
          value={item.category || ""}
          onChange={(e) =>
            setItem({ ...item, category: e.target.value })
          }
          className="border border-gray-300 rounded px-3 py-2 w-full"
        />
      </div>

      {/* Quantity in Stock */}
      <div className="mb-4">
        <label
          htmlFor="itemQuantity"
          className="block text-gray-700 font-semibold mb-2"
        >
          Quantity in Stock
        </label>
        <input
          id="itemQuantity"
          type="number"
          value={item.quantity_in_stock ?? 0}
          onChange={(e) =>
            setItem({
              ...item,
              quantity_in_stock: parseInt(e.target.value) || 0,
            })
          }
          className="border border-gray-300 rounded px-3 py-2 w-full"
        />
      </div>

      {/* Buttons */}
      <div className="flex space-x-2">
        <button
          onClick={handleSaveClick}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Save
        </button>
        <button
          onClick={onCancel}
          className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
        >
          Cancel
        </button>
        <button
          onClick={handleDeleteClick}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default EditItemForm;