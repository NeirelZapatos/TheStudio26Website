"use client";

import { useState } from "react";
import JewelryForm from "../components/ItemForms/JewelryForm";
import EssentialsForm from "./ItemForms/EssentialsForm";
import StoneForm from "../components/ItemForms/StoneForm";

export default function Page() {
  const [message, setMessage] = useState<string>("");

  const [showJewelryForm, setShowJewelryForm] = useState<boolean>(false); 
  const [showEssentialsForm, setShowEssentialsForm] = useState<boolean>(false);
  const [showStoneForm, setShowStoneForm] = useState<boolean>(false); 

  return (
    <div className="bg-gray-100 min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-2xl font-semibold mb-6 text-center">
            Add a New Product
          </h2> 

          {/* Render Forms */}
          {showJewelryForm && <JewelryForm onClose={() => setShowJewelryForm(false)} />}
          {showEssentialsForm && <EssentialsForm onClose={() => setShowEssentialsForm(false)} />}
          {showStoneForm && <StoneForm onClose={() => setShowStoneForm(false)} />}

          {/* Buttons Row */}
          {(!showJewelryForm && !showEssentialsForm && !showStoneForm) ? (
            <div className="flex justify-center mb-4 space-x-4">
              <button
                type="button"
                className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
                onClick={() => setShowJewelryForm(true)}
              >
                Add Jewelry Details
              </button>
              <button
                type="button"
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                onClick={() => setShowEssentialsForm(true)}
              >
                Add Jewelry Essentials Details
              </button>
              <button
                type="button"
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                onClick={() => setShowStoneForm(true)}
              >
                Add Stone Details
              </button>
            </div>
          ) : (
            <div> </div>
            )}

          {/* Success / Error Message */}
          {message && (
            <p className="text-center mt-4 text-lg font-semibold">
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}