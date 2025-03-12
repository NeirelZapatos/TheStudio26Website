"use client";

import { useState } from "react";

interface ToolFormProps {
  onClose: () => void;
}

export default function ToolForm({ onClose }: ToolFormProps) {
  // Basic Product Fields
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [quantityInStock, setQuantityInStock] = useState<string>("");
  const [weight, setWeight] = useState<string>(""); // e.g., grams, ounces, pounds
  const [size, setSize] = useState<string>("");     // e.g., mm, cm, inches
  const [category, setCategory] = useState<string>("");

  // Fields for Tools category
  const [toolType, setToolType] = useState<string>("");
  const [toolBrand, setToolBrand] = useState<string>("");
  const [materialComposition, setMaterialComposition] = useState<string>("");

  // Fields for Supplies category
  const [supplyType, setSupplyType] = useState<string>("");
  const [supplyBrand, setSupplyBrand] = useState<string>("");
  const [supplyMaterial, setSupplyMaterial] = useState<string>("");

  // Fields for Jewelry Kits category
  const [kitType, setKitType] = useState<string>("");
  const [kitContents, setKitContents] = useState<string>("");

  // Fields for Silver category
  const [silverType, setSilverType] = useState<string>("");

  const [message, setMessage] = useState<string>("");

  // Options Arrays
  const categories = ["Tools", "Supplies", "Jewelry Kits", "Silver"];

  // Options for Tools category
  const toolTypes = [
    "Jeweler’s Torches", // Propane, butane, acetylene, oxy-fuel
    "Hand Tools",        // Pliers, hammers, saws, files, mandrels, ring sizers
    "Measuring Tools",   // Digital calipers, rulers, gauges, templates
    "Magnification",     // Loupes, microscopes, visor magnifiers, optical lenses
    "Metalworking Tools",// Rolling mills, anvils, dapping blocks, punch sets
    "Other",
  ];
  const materialCompositions = [
    "Steel",
    "Brass",
    "Aluminum",
    "Tungsten Carbide",
    "Plastic",
    "Rubber",
    "Other",
  ];

  // Options for Supplies category
  const supplyTypes = [
    "Bezel Wire",
    "Sheet Metal",
    "Casting Supplies",
    "Polishing & Finishing Supplies",
    "Adhesives & Resins",
  ];

  // Options for Jewelry Kits category
  const kitTypes = [
    "Beginner Kits",
    "Advanced Kits",
    "Metal Stamping Kits",
    "Soldering Kits",
    "Wire Wrapping Kits",
  ];

  // Options for Silver category
  const silverTypes = [
    "Sterling Silver Components",
    "Fine Silver Components",
    "Raw Silver",
    "Plated Silver Items",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !quantityInStock || !category) {
      setMessage("Please fill in all required fields.");
      return;
    }

    let additionalData = {};
    if (category === "Tools") {
      additionalData = { toolType, toolBrand, materialComposition };
    } else if (category === "Supplies") {
      additionalData = { supplyType, supplyBrand, supplyMaterial };
    } else if (category === "Jewelry Kits") {
      additionalData = { kitType, kitContents };
    } else if (category === "Silver") {
      additionalData = { silverType };
    }

    const toolData = {
      name,
      description,
      price: parseFloat(price),
      quantityInStock: parseInt(quantityInStock),
      weight: weight ? parseFloat(weight) : null,
      size,
      category,
      ...additionalData,
    };

    console.log("Submitted Tool Data:", toolData);
    setMessage("Tool item successfully submitted!");

    // Reset form fields
    setName("");
    setDescription("");
    setPrice("");
    setQuantityInStock("");
    setWeight("");
    setSize("");
    setCategory("");
    setToolType("");
    setToolBrand("");
    setMaterialComposition("");
    setSupplyType("");
    setSupplyBrand("");
    setSupplyMaterial("");
    setKitType("");
    setKitContents("");
    setSilverType("");
  };

  return (
    <div className="bg-white p-6 border rounded shadow-lg">
      <h3 className="text-xl font-semibold mb-4 text-center">Tool Specifications</h3>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Product Fields */}
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="label font-semibold">Product Name</label>
            <input
              type="text"
              className="input input-bordered w-full"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label font-semibold">Description</label>
            <textarea
              className="textarea textarea-bordered w-full"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label font-semibold">Price</label>
              <input
                type="number"
                step="0.01"
                className="input input-bordered w-full"
                value={price}
                onChange={e => setPrice(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label font-semibold">Quantity in Stock</label>
              <input
                type="number"
                className="input input-bordered w-full"
                value={quantityInStock}
                onChange={e => setQuantityInStock(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label font-semibold">Weight</label>
              <input
                type="number"
                step="0.01"
                className="input input-bordered w-full"
                value={weight}
                onChange={e => setWeight(e.target.value)}
                placeholder="e.g., 100 grams or 3.5 ounces"
              />
            </div>
            <div>
              <label className="label font-semibold">Size / Dimensions</label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={size}
                onChange={e => setSize(e.target.value)}
                placeholder="e.g., 10x20 mm or 4x8 inches"
              />
            </div>
          </div>
          <div>
            <label className="label font-semibold">Category</label>
            <select
              className="select select-bordered w-full"
              value={category}
              onChange={e => setCategory(e.target.value)}
              required
            >
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Conditional Fields */}
        {category === "Tools" && (
          <div className="space-y-4 mt-4">
            <div>
              <label className="label font-semibold">Tool Type</label>
              <select
                className="select select-bordered w-full"
                value={toolType}
                onChange={(e) => setToolType(e.target.value)}
              >
                <option value="">Select Tool Type</option>
                {toolTypes.map((tt) => (
                  <option key={tt} value={tt}>
                    {tt}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label font-semibold">Brand</label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={toolBrand}
                onChange={(e) => setToolBrand(e.target.value)}
                placeholder="Known manufacturer or generic"
              />
            </div>
            <div>
              <label className="label font-semibold">Material Composition</label>
              <select
                className="select select-bordered w-full"
                value={materialComposition}
                onChange={(e) => setMaterialComposition(e.target.value)}
              >
                <option value="">Select Material Composition</option>
                {materialCompositions.map((mc) => (
                  <option key={mc} value={mc}>
                    {mc}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {category === "Supplies" && (
          <div className="space-y-4 mt-4">
            <div>
              <label className="label font-semibold">Supply Type</label>
              <select
                className="select select-bordered w-full"
                value={supplyType}
                onChange={(e) => setSupplyType(e.target.value)}
              >
                <option value="">Select Supply Type</option>
                {supplyTypes.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label font-semibold">Brand</label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={supplyBrand}
                onChange={(e) => setSupplyBrand(e.target.value)}
                placeholder="Enter brand"
              />
            </div>
            <div>
              <label className="label font-semibold">Material</label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={supplyMaterial}
                onChange={(e) => setSupplyMaterial(e.target.value)}
                placeholder="Material details"
              />
            </div>
          </div>
        )}

        {category === "Jewelry Kits" && (
          <div className="space-y-4 mt-4">
            <div>
              <label className="label font-semibold">Kit Type</label>
              <select
                className="select select-bordered w-full"
                value={kitType}
                onChange={(e) => setKitType(e.target.value)}
              >
                <option value="">Select Kit Type</option>
                {kitTypes.map((kt) => (
                  <option key={kt} value={kt}>
                    {kt}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label font-semibold">Kit Contents</label>
              <textarea
                className="textarea textarea-bordered w-full"
                value={kitContents}
                onChange={(e) => setKitContents(e.target.value)}
                placeholder="List kit contents"
              />
            </div>
          </div>
        )}

        {category === "Silver" && (
          <div className="space-y-4 mt-4">
            <div>
              <label className="label font-semibold">Silver Type</label>
              <select
                className="select select-bordered w-full"
                value={silverType}
                onChange={(e) => setSilverType(e.target.value)}
              >
                <option value="">Select Silver Type</option>
                {silverTypes.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-center mt-6">
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full"
          >
            Submit Tool Item
          </button>
        </div>

        {/* Success / Error Message */}
        {message && (
          <p
            className={`text-center mt-4 font-semibold ${
              message.includes("successfully") ? "text-green-600" : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}
      </form>

      {/* Close Button */}
      <div className="flex justify-end mt-4">
        <button
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
}