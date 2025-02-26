// ItemCard.tsx
import React from "react";

export type Item = {
  _id: string;
  name: string;
  description?: string;
  price: number;
  category?: string;
  material?: string;
  image_url?: string;
  size?: string;
  color?: string;
  purchaseType?: "Item" | "Course";
  itemType?: string;
  quantity_in_stock?: number;
};

type ItemCardProps = {
  item: Item;
  onEdit: (item: Item) => void;
};

const ItemCard: React.FC<ItemCardProps> = ({ item, onEdit }) => {
  return (
    <div className="bg-white p-4 rounded">
      {item.image_url && (
        <img
          src={item.image_url}
          alt={item.name}
          className="w-full h-48 object-cover rounded mb-4"
        />
      )}
      <h3 className="text-xl font-semibold text-gray-800 mb-3">
        {item.name}
      </h3>
      {item.description && (
        <p className="text-gray-700 mb-4">{item.description}</p>
      )}
      <ul className="space-y-2 text-gray-700 mb-4">
        <li>
          <span className="font-semibold">Price:</span> ${item.price}
        </li>
        {item.category && (
          <li>
            <span className="font-semibold">Category:</span> {item.category}
          </li>
        )}
        {item.material && (
          <li>
            <span className="font-semibold">Material:</span> {item.material}
          </li>
        )}
        {item.color && (
          <li>
            <span className="font-semibold">Color:</span> {item.color}
          </li>
        )}
        {item.size && (
          <li>
            <span className="font-semibold">Size:</span> {item.size}
          </li>
        )}
        {item.purchaseType && (
          <li>
            <span className="font-semibold">Purchase Type:</span>{" "}
            {item.purchaseType}
          </li>
        )}
        {item.itemType && (
          <li>
            <span className="font-semibold">Item Type:</span> {item.itemType}
          </li>
        )}
        <li>
          <span className="font-semibold">Quantity:</span>{" "}
          {item.quantity_in_stock}
        </li>
      </ul>
      <button
        onClick={() => onEdit(item)}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Edit
      </button>
    </div>
  );
};

export default ItemCard;