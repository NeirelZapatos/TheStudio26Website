"use client";

import { useState, useEffect } from "react";
import ImageCarousel from "@/app/Components/ImageCarousel";
import useImageUpload from "@/app/hooks/useImageUpload";

export default function OpenLabForm() {
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

  // OpenLab options from first form
  const openLabOptions = [
    "Bench Time - Sunday",
    "Bench Time - Monday",
    "Bench Time - Thursday"
  ];

  // All form fields from both forms
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [time, setTime] = useState<string>("");
  const [durationHours, setDurationHours] = useState<string>("0");
  const [durationMinutes, setDurationMinutes] = useState<string>("0");
  const [location, setLocation] = useState<string>(
    "4100 Cameron Park Dr suite 118, Cameron Park, CA 95682"
  );
  const [maxCapacity, setMaxCapacity] = useState<string>("");

  // --------------- Template Search State --------------- //
  const [showTemplateSearch, setShowTemplateSearch] = useState<boolean>(false);
  const [searchText, setSearchText] = useState("");
  const [templates, setTemplates] = useState<any[]>([]);
  const [filteredTemplateList, setFilteredTemplateList] = useState<any[]>([]);

  // --------------- Options for selects --------------- //
  const requiredFields = [
    name,
    description,
    price,
    date,
    time,
    durationHours,
    location,
    maxCapacity
  ];

  const areRequiredFieldsFilled = () => {
    return requiredFields.every((field) => field && field.trim() !== "");
  };

  // Handle name change like in the first form
  const handleNameChange = (selectedName: string) => {
    setName(selectedName);
    setDescription(`${selectedName}`);
  };

  // --------------- Template Logic --------------- //
  // Fetch templates on component mount
  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/lab-templates');
      if (!response.ok) {
        throw new Error('Failed to fetch templates');
      }
      const data = await response.json();
      const labTemplates = data.data.filter((template: any) => template.category === "Lab");

      setTemplates(labTemplates);
      setFilteredTemplateList(labTemplates); // Initialize filtered list with all templates
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

      // Check if template name is in openLabOptions
      if (openLabOptions.includes(template.name)) {
        setName(template.name);
      }
      setDescription(template.description);
      setPrice(template.price);

      // Handle duration - parse from template if it exists
      if (template.duration) {
        // If duration is stored as a decimal or contains a decimal point
        if (typeof template.duration === 'string' && template.duration.includes('.')) {
          const [hours, minutesFraction] = template.duration.split('.');
          setDurationHours(hours || "4");
          setDurationMinutes(String(Math.round(Number(`0.${minutesFraction}`) * 60)) || "0");
        } else if (typeof template.duration === 'number' && !Number.isInteger(template.duration)) {
          // Handle floating point number
          const hours = Math.floor(template.duration);
          const minutes = Math.round((template.duration - hours) * 60);
          setDurationHours(String(hours) || "4");
          setDurationMinutes(String(minutes) || "0");
        } else {
          // Handle integer duration as hours
          setDurationHours(String(template.duration) || "4");
          setDurationMinutes("0");
        }
      } else {
        setDurationHours("4");
        setDurationMinutes("0");
      }

      setLocation(template.location || "4100 Cameron Park Dr suite 118, Cameron Park, CA 95682");
      setMaxCapacity(template.max_capacity || "15");
      setPreviewUrls(template.images || [template.image_url || "https://tests26bucket.s3.us-east-2.amazonaws.com/ProductPlaceholder.png"]);

      setCurrentCarouselIndex(0);
      setShowTemplateSearch(false);
      setSearchText("");
    }
  };

  const handleSaveAsTemplate = async () => {
    try {
      let finalImageUrl = "https://tests26bucket.s3.us-east-2.amazonaws.com/ProductPlaceholder.png";
      let allImageUrls: string[] = [];

      const existingS3Images = previewUrls.filter(url =>
        !url.startsWith("blob:") && !url.includes("ProductPlaceholder")
      );

      if (existingS3Images.length > 0) {
        finalImageUrl = existingS3Images[0];
        allImageUrls = [...existingS3Images];
      }

      if (files.length > 0) {
        const uploadedImageUrls = await uploadImages("labs");
        if (uploadedImageUrls.length > 0) {
          if (finalImageUrl.includes("ProductPlaceholder")) {
            finalImageUrl = uploadedImageUrls[0];
          }
          allImageUrls = [...allImageUrls, ...uploadedImageUrls];
        }
      }

      // If we somehow still have no images, use the placeholder
      if (allImageUrls.length === 0) {
        allImageUrls = [finalImageUrl];
      }

      console.log("Final template image URL:", finalImageUrl);
      console.log("All template image URLs:", allImageUrls);

      const totalDuration = parseFloat(durationHours) + (parseFloat(durationMinutes || "0") / 60);

      const templateData = {
        name,
        description,
        price: parseFloat(price),
        image_url: finalImageUrl,
        images: allImageUrls,
        duration: totalDuration.toFixed(2),
        location,
        max_capacity: parseInt(maxCapacity),
        quantity_in_stock: parseInt(maxCapacity),
        category: "Lab",
        type: "OpenLab"
      };

      const response = await fetch('/api/lab-templates', {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!areRequiredFieldsFilled()) {
      setMessage("Please fill in all required fields.");
      return;
    }

    try {
      let finalImageUrl = "https://tests26bucket.s3.us-east-2.amazonaws.com/ProductPlaceholder.png";
      let allImageUrls: string[] = [];

      const existingS3Images = previewUrls.filter(url =>
        !url.startsWith("blob:") && !url.includes("ProductPlaceholder")
      );

      if (existingS3Images.length > 0) {
        finalImageUrl = existingS3Images[0];
        allImageUrls = [...existingS3Images];
      }

      // Upload any new file images
      if (files.length > 0) {
        const uploadedImageUrls = await uploadImages("labs");
        if (uploadedImageUrls.length > 0) {
          // If we don't have a main image yet, use the first uploaded one
          if (finalImageUrl.includes("ProductPlaceholder")) {
            finalImageUrl = uploadedImageUrls[0];
          }
          // Add all uploaded images to the images array
          allImageUrls = [...allImageUrls, ...uploadedImageUrls];
        }
      }

      // If we somehow still have no images, use the placeholder
      if (allImageUrls.length === 0) {
        allImageUrls = [finalImageUrl];
      }

      console.log("Final image URL:", finalImageUrl);
      console.log("All image URLs:", allImageUrls);

      // Calculate total duration in hours (with minutes as decimal)
      const totalDuration = parseFloat(durationHours) + (parseFloat(durationMinutes || "0") / 60);

      // Prepare the lab data with the correct image information
      const labData = {
        name,
        description,
        price: parseFloat(price),
        date,
        time,
        duration: totalDuration,
        duration_display: `${durationHours}h ${durationMinutes}m`,
        location,
        max_capacity: parseInt(maxCapacity),
        image_url: finalImageUrl,
        images: allImageUrls,
        category: "Lab",
        quantity_in_stock: parseInt(maxCapacity),
      };

      console.log("Submitted Lab Data:", labData);

      const response = await fetch("/api/lab", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(labData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit lab item");
      }

      const data = await response.json();
      console.log("API Response:", data);

      setMessage("Lab item successfully submitted!");

      // Reset all fields
      setName("");
      setDescription("");
      setPrice("");
      setDate("");
      setTime("");
      setDurationHours("0");
      setDurationMinutes("0");
      setLocation("4100 Cameron Park Dr suite 118, Cameron Park, CA 95682");
      setMaxCapacity("");
      setFiles([]);
      setPreviewUrls([]);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Error submitting lab item:", err.message);
        setMessage(err.message);
      } else {
        console.error("An unknown error occurred:", err);
        setMessage("An unknown error occurred.");
      }
    }
  };

  return (
    <div className="bg-white p-6 border rounded shadow-lg">
      <h3 className="text-xl font-semibold mb-4 text-center">Open Lab Specifications</h3>
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
            <span className="label-text font-semibold">Lab Images</span>
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

        {/* Form Fields - Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* LEFT COLUMN */}
          <div className="space-y-4">
            {/* OpenLab Type Selection */}
            <div>
              <label className="label">
                <span className="label-text font-semibold">OpenLab Type</span>
              </label>
              <select
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="select select-bordered select-sm w-full"
                required
              >
                <option value="">Select an OpenLab Type</option>
                {openLabOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">
                  <span className="label-text font-semibold">Date</span>
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="input input-bordered input-sm w-full"
                  required
                />
              </div>
              <div>
                <label className="label">
                  <span className="label-text font-semibold">Time</span>
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="input input-bordered input-sm w-full"
                  required
                />
              </div>
            </div>

            {/* Duration - Hours and Minutes */}
            <div>
              <label className="label">
                <span className="label-text font-semibold">Duration</span>
              </label>
              <div className="flex items-center space-x-2">
                <div className="flex-1">
                  <label className="text-xs text-gray-600">Hours</label>
                  <input
                    type="number"
                    value={durationHours}
                    min={0}
                    max={12}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (/^\d*$/.test(val) && parseInt(val) >= 0) {
                        setDurationHours(val);
                      }
                    }}
                    className="input input-bordered input-sm w-full"
                    required
                  />
                </div>
                <span className="text-gray-500 pt-4">:</span>
                <div className="flex-1">
                  <label className="text-xs text-gray-600">Minutes</label>
                  <select
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(e.target.value)}
                    className="select select-bordered select-sm w-full"
                    required
                  >
                    <option value="0">00</option>
                    <option value="5">05</option>
                    <option value="10">10</option>
                    <option value="15">15</option>
                    <option value="20">20</option>
                    <option value="25">25</option>
                    <option value="30">30</option>
                    <option value="35">35</option>
                    <option value="40">40</option>
                    <option value="45">45</option>
                    <option value="50">50</option>
                    <option value="55">55</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-4">
            {/* Price */}
            <div>
              <label className="label">
                <span className="label-text font-semibold">Price</span>
              </label>
              <input
                type="number"
                value={price}
                step="0.01"
                onChange={(e) => {
                  const val = e.target.value;
                  if (/^\d*\.?\d*$/.test(val)) {
                    setPrice(val);
                  }
                }}
                className="input input-bordered input-sm w-full"
                required
              />
            </div>

            {/* Max Capacity */}
            <div>
              <label className="label">
                <span className="label-text font-semibold">Maximum Capacity</span>
              </label>
              <input
                type="number"
                value={maxCapacity}
                min={1}
                onChange={(e) => {
                  const val = e.target.value;
                  if (/^\d*$/.test(val)) {
                    setMaxCapacity(val);
                  }
                }}
                className="input input-bordered input-sm w-full"
                required
              />
            </div>

            {/* Location */}
            <div>
              <label className="label">
                <span className="label-text font-semibold">Location</span>
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="input input-bordered input-sm w-full"
                required
              />
            </div>
          </div>
        </div>

        {/* Description - Full Width */}
        <div className="mt-4">
          <label className="label">
            <span className="label-text font-semibold">Description</span>
          </label>
          <textarea
            rows={4}
            className="textarea textarea-bordered w-full"
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
          ></textarea>
        </div>

        {/* Save as Template and Submit Button */}
        <div className="flex justify-center mt-6 space-x-4">
          <button
            type="button"
            onClick={handleSaveAsTemplate}
            disabled={!areRequiredFieldsFilled()}
            className={`${areRequiredFieldsFilled()
              ? "bg-green-500 hover:bg-green-600"
              : "bg-gray-400 cursor-not-allowed"
              } text-white px-4 py-2 rounded`}
          >
            Save as Template
          </button>
          <button
            type="submit"
            className={`${areRequiredFieldsFilled()
              ? "bg-blue-500 hover:bg-blue-600"
              : "bg-gray-400 cursor-not-allowed"
              } text-white px-4 py-2 rounded`}
            disabled={!areRequiredFieldsFilled()}
          >
            Submit OpenLab Session
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