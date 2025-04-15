"use client";

import { useState, useEffect } from "react";
import ImageCarousel from "@/app/Components/ImageCarousel";
import useImageUpload from "@/app/hooks/useImageUpload";

interface ToolFormProps {
  onClose: () => void;
}

export default function EssentialsForm({ onClose }: ToolFormProps) {
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
  const [essentialsType, setEssentialsType] = useState<string>("");

  // --------------- Basic Product Fields --------------- //
  const [weight, setWeight] = useState<string>(""); // e.g., grams, ounces, pounds
  const [size, setSize] = useState<string>("");     // e.g., mm, cm, inches

  // --------------- Tools --------------- //
  const [toolType, setToolType] = useState<string>("");
  const [toolBrand, setToolBrand] = useState<string>("");
  const [materialComposition, setMaterialComposition] = useState<string>("");

  // --------------- Supplies --------------- //
  const [supplyType, setSupplyType] = useState<string>("");
  const [supplyBrand, setSupplyBrand] = useState<string>("");
  const [supplyMaterial, setSupplyMaterial] = useState<string>("");

  // --------------- Jewelry Kits --------------- //
  const [kitType, setKitType] = useState<string>("");
  const [kitContents, setKitContents] = useState<string>("");

  // --------------- Material and Components --------------- //
  const [materialComponent, setMaterialComponent] = useState<string>("");

  // --------------- Template Search State --------------- //
  const [showTemplateSearch, setShowTemplateSearch] = useState<boolean>(false);
  const [searchText, setSearchText] = useState("");
  const [templates, setTemplates] = useState<any[]>([]);
  const [filteredTemplateList, setFilteredTemplateList] = useState<any[]>([]);

  // --------------- Options for selects --------------- //
  const essentialsTypes = ["Tools", "Supplies", "Jewelry Kits", "Material and Components"];
  const toolTypes = ["Jeweler’s Torches", "Hand Tools", "Measuring Tools", "Magnification", "Metalworking Tools", "Other"];
  const materialCompositions = ["Steel", "Brass", "Aluminum", "Tungsten Carbide", "Plastic", "Rubber", "Other"];
  const supplyTypes = ["Bezel Wire", "Sheet Metal", "Casting Supplies", "Polishing & Finishing Supplies", "Adhesives & Resins", "Other"];
  const kitTypes = ["Beginner Kits", "Advanced Kits", "Metal Stamping Kits", "Soldering Kits", "Wire Wrapping Kits", "Other"];
  const materialAndComponents = ["Sterling Silver Components", "Fine Silver Components", "Raw Silver", "Plated Silver Items", "Other"];

  // Options for Tools category
  // const toolTypes = [
  //   "Jeweler’s Torches", // Propane, butane, acetylene, oxy-fuel
  //   "Hand Tools",        // Pliers, hammers, saws, files, mandrels, ring sizers
  //   "Measuring Tools",   // Digital calipers, rulers, gauges, templates
  //   "Magnification",     // Loupes, microscopes, visor magnifiers, optical lenses
  //   "Metalworking Tools",// Rolling mills, anvils, dapping blocks, punch sets
  //   "Other",
  // ];

  const requiredFields = [
    name,
    description,
    price,
    quantityInStock,
    essentialsType,
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
      const essentialsTemplates = data.data.filter((template: any) => template.category === "Essentials");

      setTemplates(essentialsTemplates);
      setFilteredTemplateList(essentialsTemplates); // Initialize filtered list with all templates
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
      setEssentialsType(template.essentials_type);
      setWeight(template.weight || "");
      setSize(template.size || "");
      setToolType(template.tool_type || "");
      setToolBrand(template.tool_brand || "");
      setSupplyType(template.metal_purity || "");
      setSupplyBrand(template.metal_finish || "");
      setSupplyMaterial(template.supply_material || "");
      setKitType(template.kit_type || "");
      setKitContents(template.kit_contents || "");
      setMaterialComponent(template.material_component || "");
      setMaterialComposition(template.material_composition || "");
      setPreviewUrls(template.images || [template.image_url || "https://tests26bucket.s3.us-east-2.amazonaws.com/ProductPlaceholder.png"]);

      // ! Log the previewUrls after update
      // console.log("Preview URLs after update:", template.images || [template.image_url || "https://tests26bucket.s3.us-east-2.amazonaws.com/ProductPlaceholder.png"]);

      setCurrentCarouselIndex(0);
      setShowTemplateSearch(false); // Close the template search panel
      setSearchText(""); // Clear the search text
    }
  };

  const handleSaveAsTemplate = async () => {
    let uploadedImageUrls = await uploadImages("essentials");

    const existingUrls = previewUrls.filter((url) => !url.startsWith("blob:") && !url.includes("ProductPlaceholder"));

    const allImageUrls = [...existingUrls, ...uploadedImageUrls];

    const imagesArray = allImageUrls.length > 0 ? allImageUrls : ["https://tests26bucket.s3.us-east-2.amazonaws.com/ProductPlaceholder.png"];

    // Prepare the template data from the form fields
    const templateData = {
      name,
      description,
      price,
      quantity_in_stock: quantityInStock,
      essentials_type: essentialsType,
      image_url: allImageUrls[0] || "https://tests26bucket.s3.us-east-2.amazonaws.com/ProductPlaceholder.png",
      images: imagesArray,
      brand: toolBrand,
      size,
      weight,
      material_component: materialComponent,
      material_composition: materialComposition,
      kit_type: kitType,
      kit_contents: kitContents,
      supply_type: supplyType,
      supply_brand: supplyBrand,
      supply_material: supplyMaterial,
      category: "Essentials",
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
    const latestIndex = handleFileChange(e); // Get the index of the latest uploaded image
    if (latestIndex !== -1) {
      setCurrentCarouselIndex(latestIndex); // Update the carousel index
    }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !quantityInStock || !essentialsType) {
      setMessage("Please fill in all required fields.");
      return;
    }

    let additionalData = {};
    if (essentialsType === "Tools") {
      additionalData = { toolType, toolBrand, materialComposition };
    } else if (essentialsType === "Supplies") {
      additionalData = { supplyType, supplyBrand, supplyMaterial };
    } else if (essentialsType === "Jewelry Kits") {
      additionalData = { kitType, kitContents };
    } else if (essentialsType === "Material and Components") {
      additionalData = { materialComponent };
    }

    let uploadedImageUrls = await uploadImages("essentials");

    const existingUrls = previewUrls.filter((url) => !url.startsWith("blob:") && !url.includes("ProductPlaceholder"));

    const allImageUrls = [...existingUrls, ...uploadedImageUrls];

    const imagesArray = allImageUrls.length > 0 ? allImageUrls : ["https://tests26bucket.s3.us-east-2.amazonaws.com/ProductPlaceholder.png"];

    const essentialsData = {
      name,
      description,
      price: parseFloat(price),
      quantity_in_stock: parseInt(quantityInStock),
      image_url: imagesArray[0], // Use the first image as the main image
      images: imagesArray,
      weight,
      size,
      essentials_type: essentialsType,
      category: "Essentials",
      ...additionalData,
    };

    // ! DEBUG LINE
    console.log("Submitted Essentials Data:", essentialsData);

    setMessage("Essentials item successfully submitted!");

    try {
      // Send a POST request to the backend API
      const response = await fetch("/api/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(essentialsData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit essentials item");
      }

      const data = await response.json();
      console.log("API Response:", data);

      setMessage("Essentials item successfully submitted!");

      // Reset form fields
      setName("");
      setDescription("");
      setPrice("");
      setQuantityInStock("");
      setWeight("");
      setSize("");
      setEssentialsType("");
      setToolType("");
      setToolBrand("");
      setMaterialComposition("");
      setSupplyType("");
      setSupplyBrand("");
      setSupplyMaterial("");
      setKitType("");
      setKitContents("");
      setMaterialComponent("");
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

      <h3 className="text-xl font-semibold mb-4 text-center">Jewelry Essentials Specifications</h3>
      <form onSubmit={handleSubmit} className="space-y-6">

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
            currentIndex={currentCarouselIndex} // Pass the current index
            onIndexChange={setCurrentCarouselIndex} // Pass the setter function
            onRemoveImage={handleRemoveImage}
            onAddS3Image={handleAddS3Image}
          />
          {/* File Input for Multiple Images */}
          <div>
            <input
              type="file"
              onChange={handleFileUpload}
              className="file-input file-input-bordered file-input-sm"
              multiple // Allow multiple file selection
            />
          </div>
        </div>

        {/* --------------- REQUIRED FIELDS --------------- */}
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
              value={essentialsType}
              onChange={e => setEssentialsType(e.target.value)}
              required
            >
              <option value="" disabled>Select Category</option>
              {essentialsTypes.map(et => (
                <option key={et} value={et}>
                  {et}
                </option>
              ))}
            </select>
          </div>
        </div>

        <hr className="my-6 border-t border-gray-300" />

        {/* --------------- ADDITIONAL FIELDS --------------- */}
        {essentialsType === "Tools" && (
          <div className="space-y-4 mt-4">
            <div>
              <label className="label font-semibold">Tool Type</label>
              <select
                className="select select-bordered w-full"
                value={toolType}
                onChange={(e) => setToolType(e.target.value)}
              >
                <option value="" disabled>Select Tool Type</option>
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
                <option value="" disabled>Select Material Composition</option>
                {materialCompositions.map((mc) => (
                  <option key={mc} value={mc}>
                    {mc}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {essentialsType === "Supplies" && (
          <div className="space-y-4 mt-4">
            <div>
              <label className="label font-semibold">Supply Type</label>
              <select
                className="select select-bordered w-full"
                value={supplyType}
                onChange={(e) => setSupplyType(e.target.value)}
              >
                <option value="" disabled>Select Supply Type</option>
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

        {essentialsType === "Jewelry Kits" && (
          <div className="space-y-4 mt-4">
            <div>
              <label className="label font-semibold">Kit Type</label>
              <select
                className="select select-bordered w-full"
                value={kitType}
                onChange={(e) => setKitType(e.target.value)}
              >
                <option value="" disabled>Select Kit Type</option>
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

        {essentialsType === "Material and Components" && (
          <div className="space-y-4 mt-4">
            <div>
              <label className="label font-semibold">Silver Type</label>
              <select
                className="select select-bordered w-full"
                value={materialComponent}
                onChange={(e) => setMaterialComponent(e.target.value)}
              >
                <option value="" disabled>Select Silver Type</option>
                {materialAndComponents.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>
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