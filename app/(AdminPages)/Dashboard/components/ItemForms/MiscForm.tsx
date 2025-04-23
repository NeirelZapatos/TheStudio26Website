"use client";

import { useState, useEffect } from "react";
import ImageCarousel from "@/app/Components/ImageCarousel";
import useImageUpload from "@/app/hooks/useImageUpload";

interface MiscFormProps {
  onClose: () => void; // Function to close the form
}

export default function MiscForm({ onClose }: MiscFormProps) {
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

  // --------------- Additional Product Fields --------------- //
  const [weight, setWeight] = useState<string>("");
  const [size, setSize] = useState<string>("");
  const [color, setColor] = useState("");
  const [brand, setBrand] = useState("");

  // --------------- Template Search State --------------- //
  const [showTemplateSearch, setShowTemplateSearch] = useState<boolean>(false);
  const [searchText, setSearchText] = useState("");
  const [templates, setTemplates] = useState<any[]>([]);
  const [filteredTemplateList, setFilteredTemplateList] = useState<any[]>([]);

  const requiredFields = [
    name,
    description,
    price,
    quantityInStock,
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
      const jewelryTemplates = data.data.filter((template: any) => template.category === "Miscellaneous");

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
      setColor(template.color || "");
      setWeight(template.weight || "");
      setSize(template.size || "");
      setBrand(template.brand || "");
      setPreviewUrls(template.images || [template.image_url || "https://tests26bucket.s3.us-east-2.amazonaws.com/ProductPlaceholder.png"]);

      // ! Log the previewUrls after update
      // console.log("Preview URLs after update:", template.images || [template.image_url || "https://tests26bucket.s3.us-east-2.amazonaws.com/ProductPlaceholder.png"]);

      setCurrentCarouselIndex(0);
      setShowTemplateSearch(false); // Close the template search panel
      setSearchText(""); // Clear the search text
    }

    // ! Log the previewUrls after update
    // console.log("Preview URLs after update:", template.images || [template.image_url || "https://tests26bucket.s3.us-east-2.amazonaws.com/ProductPlaceholder.png"]);

    setCurrentCarouselIndex(0);
    setShowTemplateSearch(false); // Close the template search panel
    setSearchText(""); // Clear the search text
  };

  const handleSaveAsTemplate = async () => {
    let uploadedImageUrls = await uploadImages("miscellaneous");

    const existingUrls = previewUrls.filter((url) => !url.startsWith("blob:") && !url.includes("ProductPlaceholder"));

    const allImageUrls = [...existingUrls, ...uploadedImageUrls];

    const imagesArray = allImageUrls.length > 0 ? allImageUrls : ["https://tests26bucket.s3.us-east-2.amazonaws.com/ProductPlaceholder.png"];

    // Prepare the template data from the form fields
    const templateData = {
      name,
      description,
      price,
      quantity_in_stock: quantityInStock,
      image_url: allImageUrls[0] || "https://tests26bucket.s3.us-east-2.amazonaws.com/ProductPlaceholder.png",
      images: imagesArray,
      color,
      size,
      weight,
      brand,
      category: "Miscellaneous"
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

  const handleDeleteTemplate = async (templateId: string) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this template?");
    if (!confirmDelete) return;

    try {
      const response = await fetch(`/api/item-templates?id=${templateId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete template");
      }

      // Remove the deleted template from the state
      setTemplates((prev) => prev.filter((template) => template._id !== templateId));
      setFilteredTemplateList((prev) => prev.filter((template) => template._id !== templateId));

      alert("Template deleted successfully.");
    } catch (error: any) {
      console.error("Error deleting template:", error.message);
      alert(error.message || "Failed to delete template.");
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
    setPreviewUrls((prevUrls) => {
      const filteredPreviewUrls = prevUrls.filter(url => !url.includes("ProductPlaceholder"));
      return [...filteredPreviewUrls, imageUrl];
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description || !price || !quantityInStock) {
      setMessage("Please fill in all required fields.");
      return;
    }

    let uploadedImageUrls = await uploadImages("miscellaneous");

    const existingUrls = previewUrls.filter((url) => !url.startsWith("blob:") && !url.includes("ProductPlaceholder"));

    const allImageUrls = [...existingUrls, ...uploadedImageUrls];

    const imagesArray = allImageUrls.length > 0 ? allImageUrls : ["https://tests26bucket.s3.us-east-2.amazonaws.com/ProductPlaceholder.png"];

    // Prepare design fields based on jewelry type
    const miscData = {
      name,
      description,
      price: parseFloat(price),
      quantity_in_stock: parseInt(quantityInStock),
      image_url: imagesArray[0],
      images: imagesArray,
      color,
      size,
      weight,
      brand,
      category: "Miscellaneous"
    };

    // ! DEBUG LINE
    console.log("Submitted Misc Data:", miscData);

    setMessage("Misc Item successfully submitted!");

    try {
      // Send a POST request to the backend API
      const response = await fetch("/api/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(miscData),
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

      <h3 className="text-xl font-semibold mb-4 text-center">Miscellaneous Product Specifications</h3>
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
                    className="p-2 flex justify-between items-center hover:bg-gray-200 cursor-pointer"
                  >
                    <span onClick={() => loadTemplate(index.toString())}>
                      {template.name}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent triggering the loadTemplate function
                        handleDeleteTemplate(template._id);
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      Delete
                    </button>
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

        <hr className="my-6 border-t border-gray-300" />

        {/* --------------- ADDITIONAL FIELDS --------------- */}
        <div className="py-4">
          <span className="text-xl font-semibold">More Details</span>
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
        <div>
          <label className="label">
            <span className="label-text font-semibold">Weight</span>
          </label>
          <input type="string" className="input input-bordered w-full" value={weight} onChange={e => setWeight(e.target.value)} placeholder="Enter weight" />
        </div>
        <div>
          <label className="label">
            <span className="label-text font-semibold">Color</span>
          </label>
          <input type="string" className="input input-bordered w-full" value={color} onChange={e => setColor(e.target.value)} placeholder="Enter color" />
        </div>
        <div>
          <label className="label">
            <span className="label-text font-semibold">Brand</span>
          </label>
          <input type="string" className="input input-bordered w-full" value={brand} onChange={e => setBrand(e.target.value)} placeholder="Enter brand" />
        </div>

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
            Submit Misc Item
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
  )

}