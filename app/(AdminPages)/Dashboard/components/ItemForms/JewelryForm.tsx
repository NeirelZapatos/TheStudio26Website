"use client";

import { useState } from "react";
import Image from "next/image";

interface JewelryFormProps {
  onClose: () => void; // Function to close the form
}

export default function JewelryForm({ onClose }: JewelryFormProps) {
  // Basic Product Fields
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [quantityInStock, setQuantityInStock] = useState<string>("");
  const [weight, setWeight] = useState<string>(""); // New: Weight field
  const [size, setSize] = useState<string>("");     // New: Size field
  const [jewelryType, setJewelryType] = useState("");
  const [metalType, setMetalType] = useState("");
  const [metalPurity, setMetalPurity] = useState("");
  const [metalFinish, setMetalFinish] = useState("");
  const [plating, setPlating] = useState("");

  // Design Fields
  const [ringSize, setRingSize] = useState("");
  const [gauge, setGauge] = useState("");
  const [caratWeight, setCaratWeight] = useState("");
  const [settingType, setSettingType] = useState("");
  const [stoneArrangement, setStoneArrangement] = useState("");
  const [customizationOptions, setCustomizationOptions] = useState("");

  const [message, setMessage] = useState<string>("");

  // Image Upload State
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string>("https://tests26bucket.s3.us-east-2.amazonaws.com/ProductPlaceholder.png");

  // Options for selects
  const jewelryTypes = ["Rings", "Earrings", "Bracelets", "Cuffs", "Pendants", "Other"];
  const metalTypesOptions = ["Gold", "Silver", "Bronze", "Copper", "Platinum", "Mixed Metals"];
  const metalPuritiesOptions = ["10K", "14K", "18K", "22K", "24K", "Sterling Silver", "Fine Silver"];
  const metalFinishesOptions = ["Polished", "Matte", "Brushed", "Hammered", "Textured", "Oxidized"];
  const platingOptions = ["Gold-plated", "Rhodium-plated", "Silver-plated", "Rose gold-plated", "Antique"];

  const ringSizesOptions = ["US 3", "US 4", "US 5", "US 6", "US 7", "US 8", "US 9", "US 10", "US 11", "US 12", "US 13", "US 14", "US 15"];
  const settingTypesOptions = ["Bezel", "Prong", "Pave", "Channel", "Flush", "Tension", "Halo", "Bar"];
  const stoneArrangementsOptions = ["Single Stone", "Multi-Stone", "Cluster", "Eternity"];
  const customizationOptionsList = ["Engraving", "Custom Stone Setting", "Personalized Design"];

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      setFile(selectedFile);
      setFileName(selectedFile.name.replace(/\s+/g, "-"));
    }
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !quantityInStock || !jewelryType) {
      setMessage("Please fill in all required fields.");
      return;
    }

    // Prepare design fields based on jewelry type
    let designData = {};
    if (jewelryType === "Rings") {
      designData = {
        ringSize,
        gauge,
        caratWeight,
        settingType,
        stoneArrangement,
        customizationOptions,
      };
    } else if (
      jewelryType === "Earrings" ||
      jewelryType === "Bracelets" ||
      jewelryType === "Cuffs" ||
      jewelryType === "Pendants"
    ) {
      designData = {
        stoneArrangement,
        customizationOptions,
      };
    } else if (jewelryType === "Other") {
      // Display all design fields if "Other" is selected
      designData = {
        ringSize,
        gauge,
        caratWeight,
        settingType,
        stoneArrangement,
        customizationOptions,
      };
    }

    let uploadedImageUrl = imageUrl;

    if (file) {
      try {
        uploadedImageUrl = await uploadImage();
      } catch (error) {
        setMessage("Failed to upload image.");
        console.error(error);
        return;
      }
    }

    const jewelryData = {
      name,
      description,
      price: parseFloat(price),
      quantityInStock: parseInt(quantityInStock),
      weight: weight ? parseFloat(weight) : null,  // New: Include weight
      size,                                      // New: Include size
      jewelryType,
      metalType,
      metalPurity,
      metalFinish,
      plating,
      ...designData,
    };

    console.log("Submitted Jewelry Data:", jewelryData);
    setMessage("Jewelry item successfully submitted!");

    // Reset all fields
    setName("");
    setDescription("");
    setPrice("");
    setQuantityInStock("");
    setWeight("");
    setSize("");
    setJewelryType("");
    setMetalType("");
    setMetalPurity("");
    setMetalFinish("");
    setPlating("");
    setRingSize("");
    setGauge("");
    setCaratWeight("");
    setSettingType("");
    setStoneArrangement("");
    setCustomizationOptions("");
  };

  return (
    <div className="bg-white p-6 border rounded shadow-lg">
      <h3 className="text-xl font-semibold mb-4 text-center">Jewelry Specifications</h3>
      <form onSubmit={handleSubmit}>

        {/* Image Upload Section */}
        <div className="mb-6 flex flex-col items-center space-y-4">
          <label className="label">
            <span className="label-text font-semibold">Product Image</span>
          </label>
          <div className="w-48 h-48 relative">
            <Image
              src={imageUrl}
              alt="Product Image"
              layout="fill"
              objectFit="cover"
              className="rounded"
            />
          </div>
          <div>
            <input
              type="file"
              onChange={handleFileChange}
              className="file-input file-input-bordered file-input-sm"
            />
          </div>
        </div>

        {/* Basic Product Fields */}
        <div>
          <label className="label">
            <span className="label-text font-semibold">Product Name</span>
          </label>
          <input type="text" className="input input-bordered w-full" value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div>
          <label className="label">
            <span className="label-text font-semibold">Amount in Stock</span>
          </label>
          <input type="number" className="input input-bordered w-full" value={quantityInStock} onChange={e => setQuantityInStock(e.target.value)} required />
        </div>
        <div>
          <label className="label">
            <span className="label-text font-semibold">Price</span>
          </label>
          <input type="number" step="0.01" className="input input-bordered w-full" value={price} onChange={e => setPrice(e.target.value)} required />
        </div>
        <div>
          <label className="label">
            <span className="label-text font-semibold">Description</span>
          </label>
          <textarea className="textarea textarea-bordered w-full" value={description} onChange={e => setDescription(e.target.value)}></textarea>
        </div>
        {/* New: Weight Field */}
        <div>
          <label className="label">
            <span className="label-text font-semibold">Weight (grams)</span>
          </label>
          <input type="number" step="0.01" className="input input-bordered w-full" value={weight} onChange={e => setWeight(e.target.value)} placeholder="Enter weight" />
        </div>
        {/* New: Size Field */}
        <div>
          <label className="label">
            <span className="label-text font-semibold">Size / Dimensions</span>
          </label>
          <input type="text" className="input input-bordered w-full" value={size} onChange={e => setSize(e.target.value)} placeholder="Enter size or dimensions" />
        </div>
        <div>
          <label className="label">
            <span className="label-text font-semibold">Jewelry Type</span>
          </label>
          <select className="select select-bordered w-full" value={jewelryType} onChange={e => setJewelryType(e.target.value)} required>
            <option value="">Select Jewelry Type</option>
            {jewelryTypes.map(type => <option key={type} value={type}>{type}</option>)}
          </select>
        </div>

        {/* Metal Information (Always Shown) */}
        <div>
          <label className="label">
            <span className="label-text font-semibold">Metal Type</span>
          </label>
          <select className="select select-bordered w-full" value={metalType} onChange={e => setMetalType(e.target.value)}>
            <option value="">Select Metal Type</option>
            {metalTypesOptions.map(type => <option key={type} value={type}>{type}</option>)}
          </select>
        </div>
        <div>
          <label className="label">
            <span className="label-text font-semibold">Metal Purity</span>
          </label>
          <select className="select select-bordered w-full" value={metalPurity} onChange={e => setMetalPurity(e.target.value)}>
            <option value="">Select Metal Purity</option>
            {metalPuritiesOptions.map(purity => <option key={purity} value={purity}>{purity}</option>)}
          </select>
        </div>
        <div>
          <label className="label">
            <span className="label-text font-semibold">Metal Finish</span>
          </label>
          <select className="select select-bordered w-full" value={metalFinish} onChange={e => setMetalFinish(e.target.value)}>
            <option value="">Select Metal Finish</option>
            {metalFinishesOptions.map(finish => <option key={finish} value={finish}>{finish}</option>)}
          </select>
        </div>
        <div>
          <label className="label">
            <span className="label-text font-semibold">Plating</span>
          </label>
          <select className="select select-bordered w-full" value={plating} onChange={e => setPlating(e.target.value)}>
            <option value="">Select Plating</option>
            {platingOptions.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        {/* Conditional Design Fields */}
        {jewelryType === "Rings" && (
          <>
            <div>
              <label className="label">
                <span className="label-text font-semibold">Ring Size</span>
              </label>
              <select className="select select-bordered w-full" value={ringSize} onChange={e => setRingSize(e.target.value)}>
                <option value="">Select Ring Size</option>
                {ringSizesOptions.map(size => <option key={size} value={size}>{size}</option>)}
              </select>
            </div>
            <div>
              <label className="label">
                <span className="label-text font-semibold">Gauge (Thickness)</span>
              </label>
              <input type="text" className="input input-bordered w-full" value={gauge} onChange={e => setGauge(e.target.value)} placeholder="Measured in mm" />
            </div>
            <div>
              <label className="label">
                <span className="label-text font-semibold">Carat Weight</span>
              </label>
              <input type="text" className="input input-bordered w-full" value={caratWeight} onChange={e => setCaratWeight(e.target.value)} placeholder="Specified per piece" />
            </div>
            <div>
              <label className="label">
                <span className="label-text font-semibold">Setting Type</span>
              </label>
              <select className="select select-bordered w-full" value={settingType} onChange={e => setSettingType(e.target.value)}>
                <option value="">Select Setting Type</option>
                {settingTypesOptions.map(st => <option key={st} value={st}>{st}</option>)}
              </select>
            </div>
            <div>
              <label className="label">
                <span className="label-text font-semibold">Stone Arrangement</span>
              </label>
              <select className="select select-bordered w-full" value={stoneArrangement} onChange={e => setStoneArrangement(e.target.value)}>
                <option value="">Select Stone Arrangement</option>
                {stoneArrangementsOptions.map(sa => <option key={sa} value={sa}>{sa}</option>)}
              </select>
            </div>
            <div>
              <label className="label">
                <span className="label-text font-semibold">Customization Options</span>
              </label>
              <select className="select select-bordered w-full" value={customizationOptions} onChange={e => setCustomizationOptions(e.target.value)}>
                <option value="">Select Customization Options</option>
                {customizationOptionsList.map(co => <option key={co} value={co}>{co}</option>)}
              </select>
            </div>
          </>
        )}

        {(jewelryType === "Earrings" || jewelryType === "Bracelets" || jewelryType === "Cuffs" || jewelryType === "Pendants") && (
          <>
            <div>
              <label className="label">
                <span className="label-text font-semibold">Stone Arrangement</span>
              </label>
              <select className="select select-bordered w-full" value={stoneArrangement} onChange={e => setStoneArrangement(e.target.value)}>
                <option value="">Select Stone Arrangement</option>
                {stoneArrangementsOptions.map(sa => <option key={sa} value={sa}>{sa}</option>)}
              </select>
            </div>
            <div>
              <label className="label">
                <span className="label-text font-semibold">Customization Options</span>
              </label>
              <select className="select select-bordered w-full" value={customizationOptions} onChange={e => setCustomizationOptions(e.target.value)}>
                <option value="">Select Customization Options</option>
                {customizationOptionsList.map(co => <option key={co} value={co}>{co}</option>)}
              </select>
            </div>
          </>
        )}

        {jewelryType === "Other" && (
          <>
            {/* Display all design fields if "Other" is selected */}
            <div>
              <label className="label">
                <span className="label-text font-semibold">Ring Size</span>
              </label>
              <select className="select select-bordered w-full" value={ringSize} onChange={e => setRingSize(e.target.value)}>
                <option value="">Select Ring Size</option>
                {ringSizesOptions.map(size => <option key={size} value={size}>{size}</option>)}
              </select>
            </div>
            <div>
              <label className="label">
                <span className="label-text font-semibold">Gauge (Thickness)</span>
              </label>
              <input type="text" className="input input-bordered w-full" value={gauge} onChange={e => setGauge(e.target.value)} placeholder="Measured in mm" />
            </div>
            <div>
              <label className="label">
                <span className="label-text font-semibold">Carat Weight</span>
              </label>
              <input type="text" className="input input-bordered w-full" value={caratWeight} onChange={e => setCaratWeight(e.target.value)} placeholder="Specified per piece" />
            </div>
            <div>
              <label className="label">
                <span className="label-text font-semibold">Setting Type</span>
              </label>
              <select className="select select-bordered w-full" value={settingType} onChange={e => setSettingType(e.target.value)}>
                <option value="">Select Setting Type</option>
                {settingTypesOptions.map(st => <option key={st} value={st}>{st}</option>)}
              </select>
            </div>
            <div>
              <label className="label">
                <span className="label-text font-semibold">Stone Arrangement</span>
              </label>
              <select className="select select-bordered w-full" value={stoneArrangement} onChange={e => setStoneArrangement(e.target.value)}>
                <option value="">Select Stone Arrangement</option>
                {stoneArrangementsOptions.map(sa => <option key={sa} value={sa}>{sa}</option>)}
              </select>
            </div>
            <div>
              <label className="label">
                <span className="label-text font-semibold">Customization Options</span>
              </label>
              <select className="select select-bordered w-full" value={customizationOptions} onChange={e => setCustomizationOptions(e.target.value)}>
                <option value="">Select Customization Options</option>
                {customizationOptionsList.map(co => <option key={co} value={co}>{co}</option>)}
              </select>
            </div>
          </>
        )}

        {/* Submit Button */}
        <div className="flex justify-center mt-6">
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Submit Jewelry Item
          </button>
        </div>

        {/* Success / Error Message */}
        {message && (
          <p className={`text-center mt-4 font-semibold ${message.includes("successfully") ? "text-green-600" : "text-red-600"}`}>
            {message}
          </p>
        )}
      </form>

      {/* Close Button */}
      <div className="flex justify-end mt-4">
        <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}