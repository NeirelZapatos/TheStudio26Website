"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import ImageCarousel from "@/app/Components/ImageCarousel";
import useImageUpload from "@/app/hooks/useImageUpload";

type Product = {
  id: string;
  name: string;
  description: string;
  productType: string;
  purchaseType: "Item" | "Course";
  price: number;
};

export default function Page() {
  const [message, setMessage] = useState<string>("");

  // Image upload and carousel state
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

  // Template search
  const [showTemplateSearch, setShowTemplateSearch] = useState<boolean>(false);
  const [searchText, setSearchText] = useState("");
  const [templates, setTemplates] = useState<any[]>([]);
  const [filteredTemplateList, setFilteredTemplateList] = useState<any[]>([]);

  // Class Categories
  const classCategories = [
    "Beginning Jewelry Class",
    "Ring Class",
    "Earring Class",
    "Bracelet Class",
    "Pendant Class",
    "Specialty Class",
    "Other",
  ];

  // Instructor list
  const instructorList = [
    "Instructor 1",
    "Instructor 2",
    "Instructor 3",
    "Other"
  ];

  const [classCategory, setClassCategory] = useState<string>("");
  const [otherCategory, setOtherCategory] = useState<string>("");

  // Prerequisite Fields
  const [hasPrerequisite, setHasPrerequisite] = useState<boolean>(false);
  const [prerequisiteClass, setPrerequisiteClass] = useState<string>("");

  // Max Capacity Field
  const [maxCapacity, setMaxCapacity] = useState<string>("");

  // Product form fields
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [itemType, setItemType] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [time, setTime] = useState<string>("");
  const [instructor, setInstructor] = useState<string>("");
  const [otherInstructor, setOtherInstructor] = useState<string>("");
  const [duration, setDuration] = useState<string>("");
  const [location, setLocation] = useState<string>(
    "4100 Cameron Park Drive, Suite 118 Cameron Park, CA 95682"
  );

  // Fetch templates on component mount
  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/course-templates');
      if (!response.ok) {
        throw new Error('Failed to fetch templates');
      }
      const data = await response.json();
      const courseTemplates = Array.isArray(data) ? data :
        data.data && Array.isArray(data.data) ? data.data :
          [];

      setTemplates(courseTemplates);
      setFilteredTemplateList(courseTemplates); // Initialize filtered list with all templates
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

  // Reset prerequisite class when hasPrerequisite changes to false
  useEffect(() => {
    if (!hasPrerequisite) {
      setPrerequisiteClass("");
    }
  }, [hasPrerequisite]);

  // Reset otherInstructor when instructor is not "Other"
  useEffect(() => {
    if (instructor !== "Other") {
      setOtherInstructor("");
    }
  }, [instructor]);

  const handleDeleteTemplate = async (templateId: string) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this template?");
    if (!confirmDelete) return;

    try {
      const response = await fetch(`/api/course-templates?id=${templateId}`, {
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

  const createClass = async (e: React.FormEvent) => {
    e.preventDefault();
    const convertedPrice = price ? parseFloat(price) : 0;
    const convertedDuration = duration ? parseInt(duration) : undefined;
    const convertedMaxCapacity = maxCapacity ? parseInt(maxCapacity) : undefined;

    // If "Other" is selected, use the user-input text. Otherwise, use the chosen category.
    const finalCategory = classCategory === "Other" ? otherCategory : classCategory;

    // If "Other" is selected for instructor, use the user-input text. Otherwise, use the chosen instructor.
    const finalInstructor = instructor === "Other" ? otherInstructor : instructor;

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
        const uploadedImageUrls = await uploadImages("courses");
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

      const productData: any = {
        name,
        description,
        itemType,
        purchaseType: "Course",
        price: convertedPrice,
        date,
        time,
        instructor: finalInstructor,
        duration: convertedDuration,
        location,
        image_url: finalImageUrl,
        images: allImageUrls,
        class_category: finalCategory,
        // Prerequisite fields
        prerequisite: hasPrerequisite,
        prerequisiteClass: hasPrerequisite ? prerequisiteClass : "",
        // Max capacity field
        max_capacity: convertedMaxCapacity,
      };

      await axios.post("/api/courses", productData);
      setMessage("Product saved to MongoDB");

      // Reset form fields
      setName("");
      setDescription("");
      setItemType("");
      setPrice("");
      setDate("");
      setTime("");
      setInstructor("");
      setOtherInstructor("");
      setDuration("");
      setMaxCapacity("");
      setLocation("4100 Cameron Park Drive, Suite 118 Cameron Park, CA 95682");
      setPreviewUrls(["https://tests26bucket.s3.us-east-2.amazonaws.com/ProductPlaceholder.png"]);
      setFiles([]);
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
      const template = filteredTemplateList[parseInt(index)];

      setName(template.name);
      setDescription(template.description);
      setClassCategory(template.class_category || "");
      setPrice(template.price ? template.price.toString() : "");

      if (template.instructor) {
        if (instructorList.includes(template.instructor)) {
          setInstructor(template.instructor);
        } else {
          setInstructor("Other");
          setOtherInstructor(template.instructor);
        }
      } else {
        setInstructor("");
      }

      // Handle duration
      if (template.duration) {
        setDuration(template.duration.toString());
      }

      // Handle max capacity
      if (template.max_capacity) {
        setMaxCapacity(template.max_capacity.toString());
      }

      setLocation(template.location || "4100 Cameron Park Drive, Suite 118 Cameron Park, CA 95682");

      // Handle category
      if (template.classCategory && classCategories.includes(template.classCategory)) {
        setClassCategory(template.classCategory);
      } else if (template.classCategory) {
        setClassCategory("Other");
        setOtherCategory(template.classCategory);
      }

      if (template.prerequisite) {
        setHasPrerequisite(true);
        setPrerequisiteClass(template.prerequisiteClass || "");
      } else {
        setHasPrerequisite(false);
        setPrerequisiteClass("");
      }

      if (template.images && template.images.length > 0) {
        setPreviewUrls(template.images);
      } else if (template.image_url) {
        setPreviewUrls([template.image_url]);
      } else {
        setPreviewUrls(["https://tests26bucket.s3.us-east-2.amazonaws.com/ProductPlaceholder.png"]);
      }

      setFiles([]);
      setCurrentCarouselIndex(0);

      // Hide the template search after selection
      setShowTemplateSearch(false);
      setSearchText("");
    }
  };

  // Function to save the current form as a template
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
        const uploadedImageUrls = await uploadImages("courses");
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

      // If "Other" is selected, use the user-input text. Otherwise, use the chosen category.
      const finalCategory = classCategory === "Other" ? otherCategory : classCategory;

      // If "Other" is selected for instructor, use the user-input text. Otherwise, use the chosen instructor.
      const finalInstructor = instructor === "Other" ? otherInstructor : instructor;

      const templateData = {
        name,
        description,
        price: parseFloat(price),
        image_url: finalImageUrl,
        images: allImageUrls,
        instructor: finalInstructor,
        duration: duration ? parseInt(duration) : 0,
        location,
        class_category: finalCategory,
        prerequisite: hasPrerequisite,
        prerequisiteClass: hasPrerequisite ? prerequisiteClass : "",
        category: "Course",
        max_capacity: maxCapacity ? parseInt(maxCapacity) : undefined
      };

      const response = await fetch('/api/course-templates', {
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white p-6 border rounded shadow-lg">
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

        {/* Form */}
        <form onSubmit={createClass}>
          {/* Image Upload Section */}
          <div className="mb-6 flex flex-col items-center space-y-4">
            <label className="label">
              <span className="label-text font-semibold">Class Images</span>
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

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* LEFT COLUMN */}
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

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label font-semibold">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="input input-bordered input-sm w-full"
                    required
                  />
                </div>
                <div>
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
                <label className="label">
                  <span className="label-text font-semibold">Instructor</span>
                </label>
                <select
                  value={instructor}
                  onChange={(e) => setInstructor(e.target.value)}
                  className="select select-bordered select-sm w-full"
                  required
                >
                  <option value="">Select an Instructor</option>
                  {instructorList.map((inst) => (
                    <option key={inst} value={inst}>
                      {inst}
                    </option>
                  ))}
                </select>
              </div>

              {/* If "Other" is selected for instructor, show text input */}
              {instructor === "Other" && (
                <div>
                  <label className="label">
                    <span className="label-text font-semibold">Other Instructor</span>
                  </label>
                  <input
                    type="text"
                    value={otherInstructor}
                    onChange={(e) => setOtherInstructor(e.target.value)}
                    className="input input-bordered input-sm w-full"
                    placeholder="Please enter instructor name"
                    required
                  />
                </div>
              )}

              {/* Max Capacity */}
              <div>
                <label className="label">
                  <span className="label-text font-semibold">Max Capacity</span>
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
                  placeholder="Enter maximum number of students"
                />
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="space-y-4">
              {/* Duration */}
              <div>
                <label className="label">
                  <span className="label-text font-semibold">Duration (minutes)</span>
                </label>
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
                <label className="label">
                  <span className="label-text font-semibold">Price</span>
                </label>
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
                <label className="label">
                  <span className="label-text font-semibold">Class Category</span>
                </label>
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
                  <label className="label">
                    <span className="label-text font-semibold">Other Category</span>
                  </label>
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
                <label className="label">
                  <span className="label-text font-semibold">Prerequisite</span>
                </label>
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
                  <label className="label">
                    <span className="label-text font-semibold">Prerequisite Class</span>
                  </label>
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
            </div>
          </div>

          {/* Description - Full Width */}
          <div className="mt-4">
            <label className="label">
              <span className="label-text font-semibold">Description</span>
            </label>
            <textarea
              value={description}
              rows={4}
              onChange={(e) => setDescription(e.target.value)}
              style={{ overflowWrap: "break-word", whiteSpace: "pre-wrap" }}
              className="textarea textarea-bordered w-full"
              required
            />
          </div>

          {/* Location - Full Width */}
          <div className="mt-4">
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

          {/* Buttons - Save as Template and Submit */}
          <div className="flex justify-center mt-6 space-x-4">
            <button
              type="button"
              onClick={handleSaveAsTemplate}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
            >
              Save as Template
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Add Class
            </button>
          </div>
        </form>

        {/* Success / Error Message */}
        {message && (
          <p className={`text-center mt-4 font-semibold ${message.includes("successfully") ? "text-green-600" : "text-red-600"}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}