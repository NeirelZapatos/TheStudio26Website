"use client";
import React, { useState, useEffect, ChangeEvent } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import {
  uploadHomepageFileToS3,
  listHomepageImages,
  deleteS3Object,
} from "../../../../utils/s3";

interface ImageEntry {
  url: string;
  key: string;
}

const HomeSection: React.FC = () => {
  // About Us Title (e.g. "Ever since 2010..." or any custom title)
  const [aboutTitle, setAboutTitle] = useState("");
  // Existing text fields
  const [aboutText, setAboutText] = useState("");
  const [jewelryTitle, setJewelryTitle] = useState("");
  const [jewelryDescription, setJewelryDescription] = useState("");
  // For the button we now use two fields: one for the URL and one for the label
  const [buttonUrl, setButtonUrl] = useState("");
  const [buttonLabel, setButtonLabel] = useState("");
  const [callToActionText, setCallToActionText] = useState("");
  const [projectsSectionTitle, setProjectsSectionTitle] = useState("");

  // Image management states
  const [images, setImages] = useState<ImageEntry[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [saveMessage, setSaveMessage] = useState("");

  // Simple URL validation helper
  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Fetch existing settings on mount
  useEffect(() => {
    fetch("/api/homepage-settings")
      .then((res) => res.json())
      .then((data) => {
        setAboutTitle(data.aboutTitle || "");
        setAboutText(data.aboutText || "");
        setJewelryTitle(data.jewelryTitle || "");
        setJewelryDescription(data.jewelryDescription || "");
        setButtonUrl(data.buttonUrl || "");
        setButtonLabel(data.buttonLabel || "");
        setCallToActionText(data.callToActionText || "");
        setProjectsSectionTitle(data.projectsSectionTitle || "");
        setImages(data.images || []);
      })
      .catch((err) => console.error("Failed to fetch homepage settings:", err));

    // Also load images from S3 and limit to six
    listHomepageImages()
      .then((imgs) => setImages(imgs.slice(-6)))
      .catch((err) => console.error("Error loading homepage images:", err));
  }, []);

  // Handle file selection for upload
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Upload image to S3 and update state
  const handleUpload = async () => {
    if (selectedFile) {
      const fileName = `${Date.now()}-${selectedFile.name}`;
      try {
        const imageUrl = await uploadHomepageFileToS3(selectedFile, fileName);
        const newImage = { url: imageUrl, key: `homepage/${fileName}` };
        const updatedImages = [...images, newImage].slice(-6); // keep only the six most recent
        setImages(updatedImages);
        setSaveMessage("Image uploaded successfully!");
      } catch (error) {
        console.error("Upload error:", error);
        setSaveMessage("Error uploading image.");
      }
    }
  };

  // Image rearrangement functions
  const moveImageLeft = (index: number) => {
    if (index === 0) return;
    const newImages = [...images];
    [newImages[index - 1], newImages[index]] = [
      newImages[index],
      newImages[index - 1],
    ];
    setImages(newImages);
  };

  const moveImageRight = (index: number) => {
    if (index === images.length - 1) return;
    const newImages = [...images];
    [newImages[index], newImages[index + 1]] = [
      newImages[index + 1],
      newImages[index],
    ];
    setImages(newImages);
  };

  const handleDelete = async (key: string) => {
    try {
      await deleteS3Object(key);
      const updatedImages = images.filter((img) => img.key !== key);
      setImages(updatedImages);
      setSaveMessage("Image removed successfully!");
    } catch (error) {
      console.error("Error deleting image:", error);
      setSaveMessage("Error deleting image.");
    }
  };

  // Save settings with validation
  const handleSave = async () => {
    if (!aboutTitle.trim()) {
      setSaveMessage("About Us title cannot be empty.");
      return;
    }
    if (!aboutText.trim()) {
      setSaveMessage("About Us text cannot be empty.");
      return;
    }
    if (!jewelryTitle.trim()) {
      setSaveMessage("Jewelry Class Title cannot be empty.");
      return;
    }
    if (!jewelryDescription.trim()) {
      setSaveMessage("Jewelry Class Description cannot be empty.");
      return;
    }
    if (!buttonUrl.trim() || !isValidUrl(buttonUrl)) {
      setSaveMessage("Please enter a valid URL for the button link.");
      return;
    }
    if (!buttonLabel.trim()) {
      setSaveMessage("Button label cannot be empty.");
      return;
    }
    if (!callToActionText.trim()) {
      setSaveMessage("Call-to-Action text cannot be empty.");
      return;
    }
    if (!projectsSectionTitle.trim()) {
      setSaveMessage("Projects Section Title cannot be empty.");
      return;
    }

    const payload = {
      aboutTitle,
      aboutText,
      jewelryTitle,
      jewelryDescription,
      buttonUrl,
      buttonLabel,
      callToActionText,
      projectsSectionTitle,
      images,
    };

    const response = await fetch("/api/homepage-settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      setSaveMessage("Settings saved successfully!");
    } else {
      setSaveMessage("Error saving settings.");
    }
  };

  return (
    <section className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Home Page Management</h2>

      {/* About Us Title */}
      <div className="mb-4">
        <label className="block font-medium">About Us Title</label>
        <ReactQuill
          value={aboutTitle}
          onChange={setAboutTitle}
          placeholder="Enter About Us title (e.g., 'Ever since 2010...')"
        />
      </div>

      {/* About Us Description */}
      <div className="mb-4">
        <label className="block font-medium">About Us Description</label>
        <ReactQuill
          value={aboutText}
          onChange={setAboutText}
          placeholder="Enter About Us text"
        />
      </div>

      {/* Jewelry Class Title */}
      <div className="mb-4">
        <label className="block font-medium">Jewelry Class Title</label>
        <ReactQuill
          value={jewelryTitle}
          onChange={setJewelryTitle}
          placeholder="Enter Jewelry Class Title"
        />
      </div>

      {/* Jewelry Class Description */}
      <div className="mb-4">
        <label className="block font-medium">Jewelry Class Description</label>
        <ReactQuill
          value={jewelryDescription}
          onChange={setJewelryDescription}
          placeholder="Enter Jewelry Class Description"
        />
      </div>

      {/* Button URL */}
      <div className="mb-4">
        <label className="block font-medium">Button Link (URL)</label>
        <input
          type="text"
          value={buttonUrl}
          onChange={(e) => setButtonUrl(e.target.value)}
          className="w-full border p-2 mt-1"
          placeholder="Enter valid URL"
        />
      </div>

      {/* Button Label */}
      <div className="mb-4">
        <label className="block font-medium">Button Label (HTML)</label>
        <ReactQuill
          value={buttonLabel}
          onChange={setButtonLabel}
          placeholder='e.g., "Beginning Jewelry Making Class" (you can style it)'
        />
      </div>

      {/* Call-to-Action Text */}
      <div className="mb-4">
        <label className="block font-medium">Call-to-Action Text</label>
        <ReactQuill
          value={callToActionText}
          onChange={setCallToActionText}
          placeholder="Enter call-to-action text"
        />
      </div>

      {/* Projects Section Title */}
      <div className="mb-4">
        <label className="block font-medium">Projects Section Title</label>
        <ReactQuill
          value={projectsSectionTitle}
          onChange={setProjectsSectionTitle}
          placeholder="Enter projects section title"
        />
      </div>

      {/* Image Management */}
      <div className="mb-4">
        <h3 className="font-semibold mb-2">Manage Images</h3>
        <div className="flex items-center mb-2">
          <input
            type="file"
            accept="image/jpeg, image/png"
            onChange={handleFileChange}
          />
          <button
            onClick={handleUpload}
            className="ml-2 bg-blue-500 text-white p-2 rounded"
          >
            Upload Image
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
          {images.map((img, idx) => (
            <div key={img.key} className="relative border p-2">
              <img
                src={img.url}
                alt={`Uploaded ${idx + 1}`}
                className="object-cover h-24 w-full"
              />
              <div className="flex justify-between mt-2">
                <button
                  onClick={() => moveImageLeft(idx)}
                  className="bg-gray-300 text-xs p-1 rounded disabled:opacity-50"
                  disabled={idx === 0}
                >
                  &larr;
                </button>
                <button
                  onClick={() => moveImageRight(idx)}
                  className="bg-gray-300 text-xs p-1 rounded disabled:opacity-50"
                  disabled={idx === images.length - 1}
                >
                  &rarr;
                </button>
                <button
                  onClick={() => handleDelete(img.key)}
                  className="bg-red-500 text-white text-xs p-1 rounded"
                >
                  X
                </button>
              </div>
            </div>
          ))}
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Only the six most recent images will be displayed on the home page.
        </p>
      </div>

      <button
        onClick={handleSave}
        className="bg-green-500 text-white p-2 rounded"
      >
        Save Changes
      </button>
      {saveMessage && (
        <p className="mt-2 text-sm text-blue-600">{saveMessage}</p>
      )}
    </section>
  );
};

export default HomeSection;
