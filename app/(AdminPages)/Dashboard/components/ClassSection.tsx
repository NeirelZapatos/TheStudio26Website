"use client";

import { useState } from "react";
import axios from "axios";
import { courseTemplates } from "@/utils/productTemplates";
import Image from "next/image";

type Product = {
  id: string;
  name: string;
  description: string;
  productType: string;
  purchaseType: "Item" | "Course";
  recurring: boolean;
  price: number;
};

export default function Page() {
  const [message, setMessage] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string>("https://tests26bucket.s3.us-east-2.amazonaws.com/ProductPlaceholder.png");

  // Template search
  const [showTemplateSearch, setShowTemplateSearch] = useState<boolean>(false);
  const [searchText, setSearchText] = useState("");
  const filteredTemplateList = courseTemplates.filter((template) =>
    template.name.toLowerCase().includes(searchText.toLowerCase())
  );

  // Class Categories
  const classCategories = [
    "Beginning Jewelry Classes",
    "Open Labs",
    "Ring Classes",
    "Earring Classes",
    "Bracelet Classes",
    "Pendant Classes",
    "Specialty Class",
    "Other",
  ];
  const [classCategory, setClassCategory] = useState<string>("");
  const [otherCategory, setOtherCategory] = useState<string>("");

  // Prerequisite Fields
  const [hasPrerequisite, setHasPrerequisite] = useState<boolean>(false);
  const [prerequisiteClass, setPrerequisiteClass] = useState<string>("");

  // Product form fields
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [itemType, setItemType] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [recurring, setRecurring] = useState<boolean>(false);
  const [date, setDate] = useState<string>("");
  const [time, setTime] = useState<string>("");
  const [instructor, setInstructor] = useState<string>("");
  const [duration, setDuration] = useState<string>("");
  const [location, setLocation] = useState<string>(
    "4100 Cameron Park Drive, Suite 118 Cameron Park, CA 95682"
  );

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


  const createClass = async (e: React.FormEvent) => {
    e.preventDefault();
    const convertedPrice = price ? Math.round(parseFloat(price) * 100) : 0;
    const convertedDuration = duration ? parseInt(duration) : undefined;

    // If "Other" is selected, use the user-input text. Otherwise, use the chosen category.
    const finalCategory =
      classCategory === "Other" ? otherCategory : classCategory;

    try {
      let uploadedImageUrl = imageUrl;

      if (file) {
        uploadedImageUrl = await uploadImage();
      }

      const productData: any = {
        name,
        description,
        itemType,
        purchaseType: "Course",
        recurring,
        price: convertedPrice,
        date,
        time,
        instructor,
        duration: convertedDuration,
        location,
        image_url: uploadedImageUrl,
        classCategory: finalCategory,
        // Prerequisite fields
        prerequisite: hasPrerequisite,
        prerequisiteClass: hasPrerequisite ? prerequisiteClass : "",
      };

      await axios.post("/api/courses", productData);
      setMessage("Product saved to MongoDB");

      // Reset form fields
      setName("");
      setDescription("");
      setItemType("");
      setRecurring(false);
      setPrice("");
      setDate("");
      setTime("");
      setInstructor("");
      setDuration("");
      setLocation("4100 Cameron Park Drive, Suite 118 Cameron Park, CA 95682");
      setImageUrl("https://tests26bucket.s3.us-east-2.amazonaws.com/ProductPlaceholder.png");
      setFile(null);
      setFileName("");
      setClassCategory("");
      setOtherCategory("");
      setHasPrerequisite(false);
      setPrerequisiteClass("");
    } catch (error) {
      setMessage("Error creating product");
      console.error("Error in create Product", error);
    }
  };

  const loadTemplate = (index: string) => {
    if (index !== "") {
      const template = courseTemplates[parseInt(index)];
      setName(template.name);
      setDescription(template.description);
      setRecurring(template.recurring);
      setPrice(template.price);
      setInstructor(template.instructor);
      setDuration(template.duration);
      setLocation(template.location);
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
            Create a Class
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

          {/* Form */}
          <form onSubmit={createClass} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* LEFT COLUMN */}
            <div className="space-y-4">
              {/* Image Preview */}
              <div className="border-2 border-gray-300 rounded-md aspect-square w-full max-w-[24rem] mx-auto">
                <img
                  src={file ? URL.createObjectURL(file) : imageUrl}
                  alt="Preview"
                  className="w-full h-full object-cover rounded-md"
                />
              </div>

              {/* File Input */}
              <input
                type="file"
                onChange={handleFileChange}
                className="p-2 border border-gray-300 rounded-md w-full"
              />

              {/* File Name Input */}
              {file && (
                <input
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value.replace(/\.[^/.]+$/, ""))}
                  className="mt-2 p-2 border border-gray-300 rounded-md w-full text-center"
                  placeholder="Rename file before upload"
                />
              )}
<div className="space-y-4">
              {/* Product Name */}
              <div>
                <label className="label">
                  <span className="label-text font-semibold">Product Name</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input input-bordered input-sm w-full"
                  required
                />
              </div>
            </div>
            
              {/* Recurring / One Time */}
              <div>
                <label className="label font-semibold">Recurring / One-Time</label>
                <select
                  value={recurring ? "Recurring" : "One-Time"}
                  onChange={(e) => setRecurring(e.target.value === "Recurring")}
                  className="select select-bordered select-sm w-full"
                  required
                >
                  <option value="One-Time">One-Time</option>
                  <option value="Recurring">Recurring</option>
                </select>
              </div>
              {/* Date & Time */}
              <div className="flex space-x-4">
                <div className="w-full">
                  <label className="label font-semibold">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="input input-bordered input-sm w-full"
                    required
                  />
                </div>
                <div className="w-full">
                  <label className="label font-semibold">Time</label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="input input-bordered input-sm w-full"
                    required
                  />
                </div>
              </div>

              {/* Instructor */}
              <div>
                <label className="label font-semibold">Instructor</label>
                <select
                  value={instructor}
                  onChange={(e) => setInstructor(e.target.value)}
                  className="select select-bordered select-sm w-full"
                  required
                >
                  <option value="">Select an Instructor</option>
                  <option value="Instructor 1">Instructor 1</option>
                  <option value="Instructor 2">Instructor 2</option>
                  <option value="Instructor 3">Instructor 3</option>
                </select>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="space-y-4">
              {/* Duration */}
              <div>
                <label className="label font-semibold">Duration (minutes)</label>
                <input
                  type="number"
                  value={duration}
                  min={0}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^\d*$/.test(val)) {
                      setDuration(val);
                    }
                  }}
                  className="input input-bordered input-sm w-full"
                />
              </div>

              {/* Price */}
              <div>
                <label className="label font-semibold">Price</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => {
                    const val = e.target.value;
                    // allow decimals
                    if (/^\d*\.?\d*$/.test(val)) {
                      setPrice(val);
                    }
                  }}
                  onWheel={(e) => e.preventDefault()}
                  placeholder="Price"
                  step="0.01"
                  style={{ appearance: "none" }}
                  className="input input-bordered input-sm w-full"
                  required
                  min="0"
                />
              </div>
              {/* Class Category */}
              <div>
                <label className="label font-semibold">Class Category</label>
                <select
                  value={classCategory}
                  onChange={(e) => setClassCategory(e.target.value)}
                  className="select select-bordered select-sm w-full"
                  required
                >
                  <option value="">Select a Category</option>
                  {classCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* If "Other" is selected, show text input */}
              {classCategory === "Other" && (
                <div>
                  <label className="label font-semibold">Other Category</label>
                  <input
                    type="text"
                    value={otherCategory}
                    onChange={(e) => setOtherCategory(e.target.value)}
                    className="input input-bordered input-sm w-full"
                    placeholder="Please specify"
                    required
                  />
                </div>
              )}

              {/* Prerequisite (Yes/No) */}
              <div>
                <label className="label font-semibold">Prerequisite</label>
                <select
                  value={hasPrerequisite ? "Yes" : "No"}
                  onChange={(e) => setHasPrerequisite(e.target.value === "Yes")}
                  className="select select-bordered select-sm w-full"
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </div>

              {/* If "Yes", show input for prerequisite class */}
              {hasPrerequisite && (
                <div>
                  <label className="label font-semibold">Prerequisite Class</label>
                  <input
                    type="text"
                    value={prerequisiteClass}
                    onChange={(e) => setPrerequisiteClass(e.target.value)}
                    className="input input-bordered input-sm w-full"
                    placeholder="Enter the prerequisite class"
                    required
                  />
                </div>
              )}

              {/* Product Name */}
              <div>
                <label className="label font-semibold">Product Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input input-bordered input-sm w-full"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="label font-semibold">Description</label>
                <textarea
                  value={description}
                  rows={6}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ overflowWrap: "break-word", whiteSpace: "pre-wrap" }}
                  className="textarea textarea-bordered textarea-sm w-full"
                  required
                />
              </div>

              {/* Location */}
              <div>
                <label className="label font-semibold">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="input input-bordered input-sm w-full"
                  required
                />
              </div>
            </div>

            
            {/* Submit Button */}
            <div className="col-span-1 md:col-span-2">
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full"
              >
                Add Class
              </button>
            </div>
          </form>

          {message && (
            <p className="text-center text-lg font-semibold mt-4">
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}