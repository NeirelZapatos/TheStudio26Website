"use client";

import { useState } from "react";
import JewelryForm from "../components/ItemForms/JewelryForm";
import EssentialsForm from "./ItemForms/EssentialsForm";
import StoneForm from "../components/ItemForms/StoneForm";
import MiscForm from "../components/ItemForms/MiscForm";

export default function Page() {
  const [message, setMessage] = useState<string>("");

  const [showJewelryForm, setShowJewelryForm] = useState<boolean>(false);
  const [showEssentialsForm, setShowEssentialsForm] = useState<boolean>(false);
  const [showStoneForm, setShowStoneForm] = useState<boolean>(false);
  const [showMiscForm, setShowMiscForm] = useState<boolean>(false);

  return (
    <div 
      // className="p-6 rounded shadow my-6"
    >
      <div className="p-8">

        {/* Render Forms */}
        {showJewelryForm && <JewelryForm onClose={() => setShowJewelryForm(false)} />}
        {showEssentialsForm && <EssentialsForm onClose={() => setShowEssentialsForm(false)} />}
        {showStoneForm && <StoneForm onClose={() => setShowStoneForm(false)} />}
        {showMiscForm && <MiscForm onClose={() => setShowMiscForm(false)} />}

        {/* Product Type Selection */}
        {(!showJewelryForm && !showEssentialsForm && !showStoneForm && !showMiscForm) ? (
          <div className="max-w-4xl mx-auto">
            <h3 className="text-black text-3xl font-semibold mb-6 text-left pl-1">
              Choose a product type
            </h3>

            {/* Product Types */}
            <div className="mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 justify-items-center">
              {/* Jewelry */}
              <div
                className="bg-lightgray rounded-lg p-6 text-center cursor-pointer
                          hover:bg-gray-700 transition-colors"
                onClick={() => setShowJewelryForm(true)}
              >
                <div
                  className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <i className="fa-solid fa-ring text-white text-2xl"></i>
                </div>
                <h3 className="text-white text-lg font-semibold mb-2">Jewelry</h3>
                <p className="text-gray-300">
                  Create a listing for rings, necklaces, bracelets, and other jewelry items.
                </p>
              </div>

              {/* Stone Card */}
              <div
                className="bg-lightgray rounded-lg p-6 text-center cursor-pointer hover:bg-gray-700 transition-colors"
                onClick={() => setShowStoneForm(true)}
              >
                <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fa-regular fa-gem text-white text-2xl"></i>
                </div>
                <h3 className="text-white text-lg font-semibold mb-2">Stone</h3>
                <p className="text-gray-300">
                  Create a listing for gemstones, crystals, and other like items.
                </p>
              </div>

              {/* Essentials Card */}
              <div
                className="bg-lightgray rounded-lg p-6 text-center cursor-pointer hover:bg-gray-700 transition-colors"
                onClick={() => setShowEssentialsForm(true)}
              >
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fa-solid fa-toolbox text-white text-2xl"></i>
                </div>
                <h3 className="text-white text-lg font-semibold mb-2">Jewelry Essentials</h3>
                <p className="text-gray-300">
                  Add tools, supplies, and other essentials for jewelry making.
                </p>
              </div>

              {/* Miscellaneous Card */}
              <div
                className="bg-lightgray rounded-lg p-6 text-center cursor-pointer hover:bg-gray-700 transition-colors"
                onClick={() => setShowMiscForm(true)}
              >
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fa-solid fa-box text-white text-2xl"></i>
                </div>
                <h3 className="text-white text-lg font-semibold mb-2">Miscellaneous</h3>
                <p className="text-gray-300">
                  Add other products that don't fit in the categories above.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div> </div>
        )
        }

        {/* Success / Error Message */}
        {
          message && (
            <p className="text-center mt-4 text-lg font-semibold">
              {message}
            </p>
          )
        }
      </div>
    </div >
  );
}