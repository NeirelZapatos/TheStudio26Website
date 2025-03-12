"use client";

import { useState } from "react";
import axios from "axios";
import { itemTemplates } from "@/utils/productTemplates";
import Image from "next/image";
import JewelryForm from "../components/ItemForms/JewelryForm";
import ToolForm from "../components/ItemForms/ToolForm";
import StoneForm from "../components/ItemForms/StoneForm";

export default function Page() {
  const [message, setMessage] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string>("https://tests26bucket.s3.us-east-2.amazonaws.com/ProductPlaceholder.png");

  // Template Search
  const [showTemplateSearch, setShowTemplateSearch] = useState<boolean>(false);
  const [showJewelryForm, setShowJewelryForm] = useState<boolean>(false);
  const [showToolForm, setShowToolForm] = useState<boolean>(false);
  const [showStoneForm, setShowStoneForm] = useState<boolean>(false);
  const [searchText, setSearchText] = useState("");
  const filteredTemplateList = itemTemplates.filter((template) =>
    template.name.toLowerCase().includes(searchText.toLowerCase())
  );

  // Product form fields
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [itemType, setItemType] = useState<string>("");
  const [ringSize, setRingSize] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [quantityInStock, setQuantityInStock] = useState<string>("");

  const ringSizes = [
    "4", "4.5", "5", "5.5", "6", "6.5", "7", "7.5",
    "8", "8.5", "9", "9.5", "10", "10.5", "11", "11.5",
    "12", "12.5", "13", "13.5", "14", "Other", "N/A",
  ];

  const uploadImage = async () => {
    if (!file || !fileName.trim()) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileName", fileName);

    const response = await fetch("/api/imageupload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Upload failed");
    }

    const data = await response.json();
    setImageUrl(data.url);
    return data.url;
  };

  const createItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const convertedPrice = price ? Math.round(parseFloat(price) * 100) : 0;

    try {
      let uploadedImageUrl = imageUrl;

      if (file) {
        uploadedImageUrl = await uploadImage();
      }
      const productData: any = {
        name,
        description,
        itemType,
        purchaseType: "Item",
        price: convertedPrice,
        quantityInStock,
        image_url: uploadedImageUrl,
      };

      await axios.post("/api/items", productData);
      setMessage("Product saved");

      // Reset form fields
      setName("");
      setDescription("");
      setItemType("");
      setPrice("");
      setQuantityInStock("");
      setRingSize("");
      setImageUrl("https://tests26bucket.s3.us-east-2.amazonaws.com/ProductPlaceholder.png");
      setFile(null);
      setFileName("");
    } catch (error) {
      setMessage("Error creating product");
      console.error(error);
    }
  };

  const loadTemplate = (index: string) => {
    if (index !== "") {
      const template = itemTemplates[parseInt(index)];
      setName(template.name);
      setDescription(template.description);
      setItemType(template.itemType);
      setQuantityInStock(template.quantityInStock);
      setPrice(template.price);
      setImageUrl(template.image_url || "https://tests26bucket.s3.us-east-2.amazonaws.com/ProductPlaceholder.png");
      setFile(null); // Reset the file state
      setFileName(""); // Reset the file name state
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-2xl font-semibold mb-6 text-center">
            Add a New Product
          </h2>

          {/* Template Search Toggle */}
          <div className="flex justify-center mb-6">
            <button
              type="button"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              onClick={() => setShowTemplateSearch(!showTemplateSearch)}
            >
              {showTemplateSearch ? "Hide Templates" : "Browse Templates"}
            </button>
          </div>

          {/* Template Search Panel */}
          {showTemplateSearch && (
            <div className="mb-6 p-4 border rounded bg-white shadow-sm">
              <input
                type="text"
                placeholder="Search Templates"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="input input-bordered input-sm w-full mb-2"
              />
              {filteredTemplateList.length > 0 ? (
                <ul
                  className="border border-gray-200 rounded-md shadow-md overflow-y-auto"
                  style={{
                    maxHeight: filteredTemplateList.length > 4 ? "160px" : "auto",
                  }}
                >
                  {filteredTemplateList.map((template, index) => (
                    <li
                      key={index}
                      onClick={() => {
                        loadTemplate(index.toString());
                        setShowTemplateSearch(false);
                        setSearchText("");
                      }}
                      className="p-2 hover:bg-gray-200 cursor-pointer"
                    >
                      {template.name}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm">No templates found</p>
              )}
            </div>
          )}

          {/* Render Forms */}
          {showJewelryForm && <JewelryForm onClose={() => setShowJewelryForm(false)} />}
          {showToolForm && <ToolForm onClose={() => setShowToolForm(false)} />}
          {showStoneForm && <StoneForm onClose={() => setShowStoneForm(false)} />}

          {/* Buttons Row */}
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
              onClick={() => setShowToolForm(true)}
            >
              Add Tool Details
            </button>
            <button
              type="button"
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              onClick={() => setShowStoneForm(true)}
            >
              Add Stone Details
            </button>
          </div>

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