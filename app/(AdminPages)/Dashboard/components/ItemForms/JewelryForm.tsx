"use client";

import { useState, useEffect } from "react";
import ImageCarousel from "@/app/Components/ImageCarousel";
import useImageUpload from "@/app/hooks/useImageUpload";

interface JewelryFormProps {
  onClose: () => void; // Function to close the form
}

export default function JewelryForm({ onClose }: JewelryFormProps) {
  const [message, setMessage] = useState<string>("");

  // --------------- Image Carousel and uploading--------------- //
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);

  const {
    files,
    setFiles,
    previewUrls,
    setPreviewUrls,
    handleFileChange,
    uploadImages,
    cleanupPreviewUrls,
  } = useImageUpload();

  // --------------- Required Fields --------------- //
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [quantityInStock, setQuantityInStock] = useState<string>("");

  // --------------- Basic Product Fields --------------- //
  const [weight, setWeight] = useState<string>("");
  const [size, setSize] = useState<string>("");
  const [jewelryType, setJewelryType] = useState("");
  const [metalType, setMetalType] = useState("");
  const [metalPurity, setMetalPurity] = useState("");
  const [metalFinish, setMetalFinish] = useState("");
  const [plating, setPlating] = useState("");
  const [color, setColor] = useState("");

  // --------------- Design Fields --------------- //
  const [ringSize, setRingSize] = useState("");
  const [gauge, setGauge] = useState("");
  const [caratWeight, setCaratWeight] = useState("");
  const [settingType, setSettingType] = useState("");
  const [stoneArrangement, setStoneArrangement] = useState("");
  const [customizationOptions, setCustomizationOptions] = useState("");

  const [inlayedStone, setInlayedStone] = useState<string>("");
  const [customStone, setCustomStone] = useState<string>("");
  const [showCustomStoneInput, setShowCustomStoneInput] = useState(false);

  // --------------- Template Search State --------------- //
  const [showTemplateSearch, setShowTemplateSearch] = useState<boolean>(false);
  const [searchText, setSearchText] = useState("");
  const [templates, setTemplates] = useState<any[]>([]);
  const [filteredTemplateList, setFilteredTemplateList] = useState<any[]>([]);

  // --------------- Options for selects --------------- //
  const jewelryTypes = ["ring", "earring", "bracelet", "cuff", "pendant", "other"];
  const metalTypesOptions = ["gold", "silver", "bronze", "copper", "platinum", "mixed metals"];
  const metalPuritiesOptions = ["10k", "14k", "18k", "22k", "24k", "sterling silver", "fine silver"];
  const metalFinishesOptions = ["polished", "matte", "brushed", "hammered", "textured", "oxidized"];
  const platingOptions = ["gold-plated", "rhodium-plated", "silver-plated", "rose gold-plated", "antique"];
  const ringSizesOptions = ["US 3", "US 4", "US 5", "US 6", "US 7", "US 8", "US 9", "US 10", "US 11", "US 12", "US 13", "US 14", "US 15"];
  const settingTypesOptions = ["bezel", "prong", "pave", "channel", "flush", "tension", "halo", "bar"];
  const stoneArrangementsOptions = ["single stone", "multi-stone", "cluster", "eternity"];
  const customizationOptionsList = ["engraving available", "custom stone setting available", "personalized design available"];

  const colorOptions = ["Gold", "Rose Gold", "White Gold", "Silver", "Platinum", "Black", "Bronze", "Copper", "Red",
    "Pink", "Blue", "Green", "Purple", "Yellow", "Orange", "White/Clear", "Black", "Brown", "Multicolor", "Other"];

  const [stoneOptions, setStoneOptions] = useState<string[]>([
    "diamond", "emerald", "ruby", "sapphire", "amethyst",
    "opal", "turquoise", "topaz", "pearl", "moonstone", "jade"
  ]);

  const requiredFields = [
    name,
    description,
    price,
    quantityInStock,
    jewelryType,
  ];

  const areRequiredFieldsFilled = () => {
    return requiredFields.every((field) => field && field.trim() !== "");
  };

  // --------------- Template Logic --------------- //
  // Fetch templates on component mount
  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/item-templates');
      if (!response.ok) {
        throw new Error('Failed to fetch templates');
      }
      const data = await response.json();
      const jewelryTemplates = data.data.filter((template: any) => template.category === "Jewelry");

      setTemplates(jewelryTemplates);
      setFilteredTemplateList(jewelryTemplates); // Initialize filtered list with all templates
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  // Filter templates based on search text
  useEffect(() => {
    const filtered = templates.filter((template) =>
      template.name.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredTemplateList(filtered);
  }, [searchText, templates]);

  // Load template into form fields
  const loadTemplate = async (index: string) => {
    if (index !== "") {
      const template = filteredTemplateList[parseInt(index)];

      // !  DEBUG template and previewUrls
      // console.log("Template:", template);
      // console.log("Preview URLs before update:", previewUrls);

      setName(template.name);
      setDescription(template.description);
      setPrice(template.price);
      setQuantityInStock(template.quantity_in_stock);
      setJewelryType(template.jewelry_type);
      setColor(template.color || "");
      setInlayedStone(template.inlayed_stone || "");
      setWeight(template.weight || "");
      setSize(template.size || "");
      setRingSize(template.ring_size || "");
      setMetalType(template.metal_type || "");
      setMetalPurity(template.metal_purity || "");
      setMetalFinish(template.metal_finish || "");
      setPlating(template.plating || "");
      setCaratWeight(template.carat_weight || "");
      setSettingType(template.setting_type || "");
      setStoneArrangement(template.stone_arrangement || "");
      setCustomizationOptions(template.customization_options || "");
      setPreviewUrls(template.images || [template.image_url || "https://tests26bucket.s3.us-east-2.amazonaws.com/ProductPlaceholder.png"]);

      // ! Log the previewUrls after update
      // console.log("Preview URLs after update:", template.images || [template.image_url || "https://tests26bucket.s3.us-east-2.amazonaws.com/ProductPlaceholder.png"]);

      setCurrentCarouselIndex(0);
      setShowTemplateSearch(false); // Close the template search panel
      setSearchText(""); // Clear the search text
    }
  };

  const handleSaveAsTemplate = async () => {
    let uploadedImageUrls = await uploadImages(jewelryType.toLowerCase());

    const existingUrls = previewUrls.filter((url) => !url.startsWith("blob:") && !url.includes("ProductPlaceholder"));

    const allImageUrls = [...existingUrls, ...uploadedImageUrls];

    const imagesArray = allImageUrls.length > 0 ? allImageUrls : ["https://tests26bucket.s3.us-east-2.amazonaws.com/ProductPlaceholder.png"];

    // Prepare the template data from the form fields
    const templateData = {
      name,
      description,
      price,
      quantity_in_stock: quantityInStock,
      jewelry_type: jewelryType,
      image_url: allImageUrls[0] || "https://tests26bucket.s3.us-east-2.amazonaws.com/ProductPlaceholder.png",
      images: imagesArray,
      metal_type: metalType,
      metal_purity: metalPurity,
      metal_finish: metalFinish,
      inlayed_stone: inlayedStone,
      color,
      plating,
      size,
      ring_size: ringSize,
      carat_weight: caratWeight,
      setting_type: settingType,
      stone_arrangement: stoneArrangement,
      customization_options: customizationOptions,
      category: "Jewelry",
    };

    try {
      // Send a POST request to save the template
      const response = await fetch('/api/item-templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(templateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save template');
      }

      const data = await response.json();
      console.log('Template saved successfully:', data);

      // Display a success message
      setMessage('Template saved successfully!');

      await fetchTemplates();
    } catch (error: any) {
      console.error('Error saving template:', error);
      setMessage(error.message || 'Failed to save template');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const latestIndex = handleFileChange(e);
    if (latestIndex !== -1) {
      setCurrentCarouselIndex(latestIndex);
    }
  };

  const handleAddS3Image = (imageUrl: string) => {
    const filteredPreviewUrls = previewUrls.filter(url => !url.includes("ProductPlaceholder"));
    let newPreviewUrls = [...filteredPreviewUrls, imageUrl];
    if (newPreviewUrls.length === 1) {
      setCurrentCarouselIndex(0);
    } else {
      setCurrentCarouselIndex(newPreviewUrls.length - 1);
    }
    setPreviewUrls(newPreviewUrls);
  };


  const handleRemoveImage = (index: number) => {
    const newFiles = [...files];
    const newPreviewUrls = [...previewUrls];

    newFiles.splice(index, 1);
    newPreviewUrls.splice(index, 1);

    if (newPreviewUrls.length === 0) {
      newPreviewUrls.push("https://tests26bucket.s3.us-east-2.amazonaws.com/ProductPlaceholder.png");
    }

    setFiles(newFiles);
    setPreviewUrls(newPreviewUrls);

    // move the carousel index back if the last image is removed
    if (currentCarouselIndex >= newPreviewUrls.length) {
      setCurrentCarouselIndex(newPreviewUrls.length - 1);
    }
  };

  const handleAddCustomStone = () => {
    if (customStone && !stoneOptions.includes(customStone)) {
      setStoneOptions([...stoneOptions, customStone]);
      setInlayedStone(customStone);
      setCustomStone("");
      setShowCustomStoneInput(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description || !price || !quantityInStock || !jewelryType) {
      setMessage("Please fill in all required fields.");
      return;
    }

    // Prepare design fields based on jewelry type
    let designData = {};
    if (jewelryType === "ring") {
      designData = {
        gauge,
        ring_size: ringSize,
        carat_weight: caratWeight,
        setting_type: settingType,
        stone_arrangement: stoneArrangement,
        customization_options: customizationOptions,
      };
    } else if (
      jewelryType === "earring" ||
      jewelryType === "bracelet" ||
      jewelryType === "cuff" ||
      jewelryType === "pendant"
    ) {
      designData = {
        stone_arrangement: stoneArrangement,
        customization_options: customizationOptions,
      };
    } else if (jewelryType === "other") {
      // Display all design fields if "Other" is selected
      designData = {
        gauge,
        carat_weight: caratWeight,
        setting_type: settingType,
        stone_arrangement: stoneArrangement,
        customization_options: customizationOptions,
      };
    }

    let uploadedImageUrls = await uploadImages(jewelryType.toLowerCase());

    const existingUrls = previewUrls.filter((url) => !url.startsWith("blob:") && !url.includes("ProductPlaceholder"));

    const allImageUrls = [...existingUrls, ...uploadedImageUrls];

    const imagesArray = allImageUrls.length > 0 ? allImageUrls : ["https://tests26bucket.s3.us-east-2.amazonaws.com/ProductPlaceholder.png"];

    const jewelryData = {
      name,
      description,
      price: parseFloat(price),
      quantity_in_stock: parseInt(quantityInStock),
      image_url: imagesArray[0], // Use the first image as the main image
      images: imagesArray,
      weight: weight,
      size: size,
      jewelry_type: jewelryType,
      metal_type: metalType,
      metal_purity: metalPurity,
      metal_finish: metalFinish,
      plating,
      color,
      inlayed_stone: inlayedStone,
      category: "Jewelry",
      ...designData,
    };

    // ! DEBUG LINE
    console.log("Submitted Jewelry Data:", jewelryData);

    setMessage("Jewelry item successfully submitted!");

    try {
      const response = await fetch("/api/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jewelryData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit jewelry item");
      }

      const data = await response.json();
      console.log("API Response:", data);

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
      setGauge("");
      setCaratWeight("");
      setSettingType("");
      setStoneArrangement("");
      setCustomizationOptions("");
      setFiles([]);
      setPreviewUrls([]);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Error submitting jewelry item:", err.message);
        setMessage(err.message);
      } else {
        console.error("An unknown error occurred:", err);
        setMessage("An unknown error occurred.");
      }
    }
  };

  return (
    <div className="bg-white p-6 border rounded shadow-lg">

      {/* Close Button */}
      <div className="flex justify-end mt-4">
        <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600" onClick={onClose}>
          Change Item Type
        </button>
      </div>

      <h3 className="text-xl font-semibold mb-4 text-center">Jewelry Specifications</h3>
      <form onSubmit={handleSubmit}>

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
                    onClick={() => loadTemplate(index.toString())}
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

        {/* Image Upload Section */}
        <div className="mb-6 flex flex-col items-center space-y-4">
          <label className="label">
            <span className="label-text font-semibold">Product Image</span>
          </label>
          <ImageCarousel
            images={
              previewUrls.length > 0 ? previewUrls : ["https://tests26bucket.s3.us-east-2.amazonaws.com/ProductPlaceholder.png"]
            }
            currentIndex={currentCarouselIndex}
            onIndexChange={setCurrentCarouselIndex}
            onRemoveImage={handleRemoveImage}
            onAddS3Image={handleAddS3Image}
          />
          {/* File Input for Multiple Images */}
          <div>
            <input
              type="file"
              onChange={handleFileUpload}
              className="file-input file-input-bordered file-input-sm"
              multiple
            />
          </div>
        </div>

        {/* --------------- REQUIRED FIELDS --------------- */}
        <div className="py-4">
          <span className="text-xl font-semibold">Required</span>
        </div>

        <div>
          <label className="label">
            <span className="label-text font-semibold">Product Name</span>
          </label>
          <input type="text" className="input input-bordered w-full" value={name} onChange={e => setName(e.target.value)} required />
        </div>

        <div>
          <label className="label">
            <span className="label-text font-semibold">Price</span>
          </label>
          <input
            type="number"
            step="0.01"
            className="input input-bordered w-full"
            value={price}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "" || (/^\d*\.?\d{0,2}$/.test(value) && parseFloat(value) >= 0)) {
                setPrice(value);
              }
            }}
            required
          />
        </div>

        <div>
          <label className="label font-semibold">Quantity in Stock</label>
          <input
            type="number"
            className="input input-bordered w-full"
            value={quantityInStock}
            onChange={(e) => {
              const value = e.target.value;
              const numericValue = parseInt(value, 10);

              if (!isNaN(numericValue)) {
                const absoluteValue = Math.abs(numericValue); // Convert to positive
                setQuantityInStock(absoluteValue.toString());
              } else {
                setQuantityInStock(value);
              }
            }}
            required
          />
        </div>

        <div>
          <label className="label">
            <span className="label-text font-semibold">Description</span>
          </label>
          <textarea rows={4} className="textarea textarea-bordered w-full" value={description} onChange={e => setDescription(e.target.value)} required></textarea>
        </div>
        <div>
          <label className="label">
            <span className="label-text font-semibold">Jewelry Type</span>
          </label>
          <select className="select select-bordered w-full" value={jewelryType} onChange={e => setJewelryType(e.target.value)} required>
            <option value="" disabled>Select Jewelry Type</option>
            {jewelryTypes.map(type => <option key={type} value={type}>{type}</option>)}
          </select>
        </div>

        {jewelryType === "ring" && (
          <div>
            <label className="label">
              <span className="label-text font-semibold">Ring Size</span>
            </label>
            <select className="select select-bordered w-full" value={ringSize} onChange={e => setRingSize(e.target.value)}>
              <option value="" disabled>Select Ring Size</option>
              {ringSizesOptions.map(rs => <option key={rs} value={rs}>{rs}</option>)}
            </select>
          </div>
        )}

        <hr className="my-6 border-t border-gray-300" />

        {/* --------------- ADDITIONAL FIELDS --------------- */}
        <div className="py-4">
          <span className="text-xl font-semibold">More Details</span>
        </div>

        {/* Metal Information (Always Shown) */}
        <div>
          <label className="label">
            <span className="label-text font-semibold">Color</span>
          </label>
          <select className="select select-bordered w-full" value={color} onChange={e => setColor(e.target.value)}>
            <option value="" disabled>Select Color</option>
            {colorOptions.map(colorOption => <option key={colorOption} value={colorOption}>{colorOption}</option>)}
          </select>
        </div>
        <div>
          <label className="label">
            <span className="label-text font-semibold">Inlayed Stone</span>
          </label>
          <div className="flex flex-col space-y-2">
            <select
              className="select select-bordered w-full"
              value={inlayedStone}
              onChange={(e) => {
                if (e.target.value === "custom") {
                  setShowCustomStoneInput(true);
                  setInlayedStone("");
                } else {
                  setInlayedStone(e.target.value);
                  setShowCustomStoneInput(false);
                }
              }}
            >
              <option value="" disabled>Select Stone Type</option>
              {stoneOptions.map(stone => <option key={stone} value={stone}>{stone}</option>)}
              <option value="custom">+ Add Custom Stone</option>
            </select>

            {showCustomStoneInput && (
              <div className="flex space-x-2">
                <input
                  type="text"
                  className="input input-bordered flex-grow"
                  value={customStone}
                  onChange={(e) => setCustomStone(e.target.value)}
                  placeholder="Enter custom stone name"
                />
                <button
                  type="button"
                  className="bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600"
                  onClick={handleAddCustomStone}
                  disabled={!customStone}
                >
                  Add
                </button>
              </div>
            )}
          </div>
        </div>
        <div>
          <label className="label">
            <span className="label-text font-semibold">Metal Type</span>
          </label>
          <select className="select select-bordered w-full" value={metalType} onChange={e => setMetalType(e.target.value)}>
            <option value="" disabled>Select Metal Type</option>
            {metalTypesOptions.map(type => <option key={type} value={type}>{type}</option>)}
          </select>
        </div>
        <div>
          <label className="label">
            <span className="label-text font-semibold">Metal Purity</span>
          </label>
          <select className="select select-bordered w-full" value={metalPurity} onChange={e => setMetalPurity(e.target.value)}>
            <option value="" disabled>Select Metal Purity</option>
            {metalPuritiesOptions.map(purity => <option key={purity} value={purity}>{purity}</option>)}
          </select>
        </div>
        <div>
          <label className="label">
            <span className="label-text font-semibold">Metal Finish</span>
          </label>
          <select className="select select-bordered w-full" value={metalFinish} onChange={e => setMetalFinish(e.target.value)}>
            <option value="" disabled>Select Metal Finish</option>
            {metalFinishesOptions.map(finish => <option key={finish} value={finish}>{finish}</option>)}
          </select>
        </div>
        <div>
          <label className="label">
            <span className="label-text font-semibold">Plating</span>
          </label>
          <select className="select select-bordered w-full" value={plating} onChange={e => setPlating(e.target.value)}>
            <option value="" disabled>Select Plating</option>
            {platingOptions.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        {/* Conditional Design Fields */}
        {jewelryType === "ring" && (
          <>
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
                <option value="" disabled>Select Setting Type</option>
                {settingTypesOptions.map(st => <option key={st} value={st}>{st}</option>)}
              </select>
            </div>
            <div>
              <label className="label">
                <span className="label-text font-semibold">Stone Arrangement</span>
              </label>
              <select className="select select-bordered w-full" value={stoneArrangement} onChange={e => setStoneArrangement(e.target.value)}>
                <option value="" disabled>Select Stone Arrangement</option>
                {stoneArrangementsOptions.map(sa => <option key={sa} value={sa}>{sa}</option>)}
              </select>
            </div>
            <div>
              <label className="label">
                <span className="label-text font-semibold">Customization Options</span>
              </label>
              <select className="select select-bordered w-full" value={customizationOptions} onChange={e => setCustomizationOptions(e.target.value)}>
                <option value="" disabled>Select Customization Options</option>
                {customizationOptionsList.map(co => <option key={co} value={co}>{co}</option>)}
              </select>
            </div>
          </>
        )}

        {(jewelryType === "earring" || jewelryType === "bracelet" || jewelryType === "cuff" || jewelryType === "pendant") && (
          <>
            <div>
              <label className="label">
                <span className="label-text font-semibold">Size or Dimensions</span>
              </label>
              <input type="text" className="input input-bordered w-full" value={size} onChange={e => setSize(e.target.value)} placeholder="Enter size or dimensions" />
            </div>
            <div>
              <label className="label">
                <span className="label-text font-semibold">Weight</span>
              </label>
              <input type="string" className="input input-bordered w-full" value={weight} onChange={e => setWeight(e.target.value)} placeholder="Enter weight" />
            </div>
            <div>
              <label className="label">
                <span className="label-text font-semibold">Stone Arrangement</span>
              </label>
              <select className="select select-bordered w-full" value={stoneArrangement} onChange={e => setStoneArrangement(e.target.value)}>
                <option value="" disabled>Select Stone Arrangement</option>
                {stoneArrangementsOptions.map(sa => <option key={sa} value={sa}>{sa}</option>)}
              </select>
            </div>
            <div>
              <label className="label">
                <span className="label-text font-semibold">Customization Options</span>
              </label>
              <select className="select select-bordered w-full" value={customizationOptions} onChange={e => setCustomizationOptions(e.target.value)}>
                <option value="" disabled>Select Customization Options</option>
                {customizationOptionsList.map(co => <option key={co} value={co}>{co}</option>)}
              </select>
            </div>
          </>
        )}

        {jewelryType === "other" && (
          <>
            {/* Display all design fields if "Other" is selected */}
            <div>
              <label className="label">
                <span className="label-text font-semibold">Size or Dimensions</span>
              </label>
              <input type="text" className="input input-bordered w-full" value={size} onChange={e => setSize(e.target.value)} placeholder="Enter size or dimensions" />
            </div>
            <div>
              <label className="label">
                <span className="label-text font-semibold">Weight</span>
              </label>
              <input type="string" className="input input-bordered w-full" value={weight} onChange={e => setWeight(e.target.value)} placeholder="Enter weight" />
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
                <option value="" disabled>Select Setting Type</option>
                {settingTypesOptions.map(st => <option key={st} value={st}>{st}</option>)}
              </select>
            </div>
            <div>
              <label className="label">
                <span className="label-text font-semibold">Stone Arrangement</span>
              </label>
              <select className="select select-bordered w-full" value={stoneArrangement} onChange={e => setStoneArrangement(e.target.value)}>
                <option value="" disabled>Select Stone Arrangement</option>
                {stoneArrangementsOptions.map(sa => <option key={sa} value={sa}>{sa}</option>)}
              </select>
            </div>
            <div>
              <label className="label">
                <span className="label-text font-semibold">Customization Options</span>
              </label>
              <select className="select select-bordered w-full" value={customizationOptions} onChange={e => setCustomizationOptions(e.target.value)}>
                <option value="" disabled>Select Customization Options</option>
                {customizationOptionsList.map(co => <option key={co} value={co}>{co}</option>)}
              </select>
            </div>
          </>
        )}

        {/* Save as Template and Submite Button */}
        <div className="flex justify-center mt-6 space-x-4">
          <button
            type="button"
            onClick={handleSaveAsTemplate}
            disabled={!areRequiredFieldsFilled()} // Disable if required fields are not filled
            className={`${areRequiredFieldsFilled()
              ? "bg-green-500 hover:bg-green-600"
              : "bg-gray-400 cursor-not-allowed"
              } text-white px-4 py-2 rounded`}
          >
            Save as Template
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className={`${areRequiredFieldsFilled()
              ? "bg-blue-500 rounded hover:bg-blue-600"
              : "bg-gray-400 cursor-not-allowed"
              } text-white px-4 py-2 rounded`}
            disabled={!areRequiredFieldsFilled()} // Disable if required fields are not filled  
          >
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
    </div>
  );
}