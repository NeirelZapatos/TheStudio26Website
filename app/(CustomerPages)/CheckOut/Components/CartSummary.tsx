"use client";

import { useState } from "react";
import Image from "next/image";

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image_url: string;
}

interface CartSummaryProps {
  cart: CartItem[];
  onRemoveItem: (productId: string) => void;
  onQuantityChange: (productId: string, quantity: number) => void;
}

export default function CartSummary({ cart, onRemoveItem, onQuantityChange }: CartSummaryProps) {
  // Calculate the total cost of the cart
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="space-y-6">
      {cart.map((item) => (
        <div key={item.productId} className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center space-x-4">
            <Image
              src={item.image_url}
              alt={item.name}
              width={80}
              height={80}
              className="w-20 h-20 object-cover rounded-lg"
            />
            <div>
              <h3 className="font-medium">{item.name}</h3>
              <p className="text-sm text-gray-600">${Number(item.price).toFixed(2)}</p>
              <input
                onKeyDown={(e) => e.preventDefault()}
                type="number"
                value={item.quantity}
                onChange={(e) => onQuantityChange(item.productId, parseInt(e.target.value))}
                className="w-16 border rounded px-2 py-1"
                min="1"
              />
            </div>
          </div>
          <button
            onClick={() => onRemoveItem(item.productId)}
            className="btn btn-error text-white-500 hover:text-red-700"
          >
            Remove
          </button>
        </div>
      ))}
        <h3 className="text-xl font-bold">Total: ${total.toFixed(2)}</h3>
    </div>
  );
}