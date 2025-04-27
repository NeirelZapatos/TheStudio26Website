"use client";
import React, { useState, useEffect, ChangeEvent } from "react";
import dynamic from "next/dynamic";
import {
  uploadHomepageFileToS3,
  listHomepageImages,
  deleteS3Object,
} from "../../../../utils/s3";

// // Dynamically import ReactQuill with no SSR
// const ReactQuill = dynamic(
//   () => import("react-quill"),
//   {
//     ssr: false,
//     loading: () => <p>Loading editor...</p>
//   }
// );

// Simple pencil icon (Unicode). Replace with your preferred icon if needed.
const PencilIcon = () => (
  <span role="img" aria-label="edit">
    ✏️
  </span>
);

interface ImageEntry {
  url: string;
  key: string;
}

const stripHtmlTags = (html: string) => {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;
  return tempDiv.textContent || tempDiv.innerText || "";
};

const HomeSection: React.FC = () => {
  // Toggle for enabling/disabling edits
  const [isEditing, setIsEditing] = useState(false);

  // Text content states
  const [aboutTitle, setAboutTitle] = useState<string>("");
  const [aboutText, setAboutText] = useState<string>("");
  const [jewelryTitle, setJewelryTitle] = useState<string>("");
  const [jewelryDescription, setJewelryDescription] = useState<string>("");
  const [buttonUrl, setButtonUrl] = useState<string>("");
  const [buttonLabel, setButtonLabel] = useState<string>("");
  const [callToActionText, setCallToActionText] = useState<string>("");
  const [projectsSectionTitle, setProjectsSectionTitle] = useState<string>("");

  // Image management states
  const [images, setImages] = useState<ImageEntry[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [saveMessage, setSaveMessage] = useState("");

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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

  // Upload image to S3 and update image state
  const handleUpload = async () => {
    if (!isEditing) return; // Prevent upload if not editing
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
    if (!isEditing || index === 0) return;
    const newImages = [...images];
    [newImages[index - 1], newImages[index]] = [
      newImages[index],
      newImages[index - 1],
    ];
    setImages(newImages);
  };

  const moveImageRight = (index: number) => {
    if (!isEditing || index === images.length - 1) return;
    const newImages = [...images];
    [newImages[index], newImages[index + 1]] = [
      newImages[index + 1],
      newImages[index],
    ];
    setImages(newImages);
  };

  const handleDelete = async (key: string) => {
    if (!isEditing) return;
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
    if (!isEditing) return;

    if (!aboutTitle.trim()) {
      setSaveMessage("About Us Title cannot be empty.");
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

  // Toggle the editing mode
  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  return (
    <section className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Home Page Management</h2>
        <button
          onClick={toggleEdit}
          className="bg-gray-100 hover:bg-gray-200 text-black px-3 py-1 rounded flex items-center gap-1"
        >
          <PencilIcon />
          {isEditing ? "Disable Editing" : "Enable Editing"}
        </button>
      </div>

      {/* About Us Title */}
      <div className="mb-4">
        <label className="block font-medium">About Us Title</label>
        {isEditing ? (
          <textarea
            value={stripHtmlTags(aboutTitle)}
            onChange={(e) => setAboutTitle(e.target.value)}
            placeholder="Enter About Us Title (e.g., 'Ever since 2010...')"
            className="w-full border border-gray-300 rounded p-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
          />
        ) : (
          <div
            className="p-2 border rounded"
            dangerouslySetInnerHTML={{ __html: aboutTitle }}
          />
        )}
      </div>

      {/* About Us Description */}
      <div className="mb-4">
        <label className="block font-medium">About Us Description</label>
        {isEditing && isMounted ? (
          <textarea
            value={stripHtmlTags(aboutText)}
            onChange={(e) => setAboutText(e.target.value)}
            placeholder="Enter About Us text"
            className="w-full border border-gray-300 rounded p-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
          />
        ) : (
          <div
            className="p-2 border rounded"
            dangerouslySetInnerHTML={{ __html: aboutText }}
          />
        )}
      </div>

      {/* Jewelry Class Title */}
      <div className="mb-4">
        <label className="block font-medium">Jewelry Class Title</label>
        {isEditing && isMounted ? (
          <textarea
            value={stripHtmlTags(jewelryTitle)}
            onChange={(e) => setJewelryTitle(e.target.value)}
            placeholder="Enter Jewelry Class Title"
            className="w-full border border-gray-300 rounded p-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
          />
        ) : (
          <div
            className="p-2 border rounded"
            dangerouslySetInnerHTML={{ __html: jewelryTitle }}
          />
        )}
      </div>

      {/* Jewelry Class Description */}
      <div className="mb-4">
        <label className="block font-medium">Jewelry Class Description</label>
        {isEditing && isMounted ? (
          <textarea
            value={stripHtmlTags(jewelryDescription)}
            onChange={(e) => setJewelryDescription(e.target.value)}
            placeholder="Enter Jewelry Class Description"
            className="w-full border border-gray-300 rounded p-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
          />
        ) : (
          <div
            className="p-2 border rounded"
            dangerouslySetInnerHTML={{ __html: jewelryDescription }}
          />
        )}
      </div>

      {/* Button Link (URL) */}
      <div className="mb-4">
        <label className="block font-medium">Button Link (URL)</label>
        <input
          type="text"
          value={buttonUrl}
          onChange={(e) => setButtonUrl(e.target.value)}
          className="w-full border p-2 mt-1"
          placeholder="Enter valid URL"
          disabled={!isEditing}
        />
      </div>

      {/* Button Label (HTML) */}
      <div className="mb-4">
        <label className="block font-medium">Button Label</label>
        {isEditing && isMounted ? (
          <textarea
            value={stripHtmlTags(buttonLabel)}
            onChange={(e) => setButtonLabel(e.target.value)}
            placeholder='e.g., "Beginning Jewelry Making Class" (you can style it)'
            className="w-full border border-gray-300 rounded p-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
          />
        ) : (
          <div
            className="p-2 border rounded"
            dangerouslySetInnerHTML={{ __html: buttonLabel }}
          />
        )}
      </div>

      {/* Call-to-Action Text */}
      <div className="mb-4">
        <label className="block font-medium">Call-to-Action Text</label>
        {isEditing && isMounted ? (
          <textarea
            value={stripHtmlTags(callToActionText)}
            onChange={(e) => setCallToActionText(e.target.value)}
            placeholder="Enter call-to-action text"
            className="w-full border border-gray-300 rounded p-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
          />
        ) : (
          <div
            className="p-2 border rounded"
            dangerouslySetInnerHTML={{ __html: callToActionText }}
          />
        )}
      </div>

      {/* Projects Section Title */}
      <div className="mb-4">
        <label className="block font-medium">Projects Section Title</label>
        {isEditing && isMounted ? (
          <textarea
            value={stripHtmlTags(projectsSectionTitle)}
            onChange={(e) => setProjectsSectionTitle(e.target.value)}
            placeholder="Enter projects section title"
            className="w-full border border-gray-300 rounded p-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
          />
        ) : (
          <div
            className="p-2 border rounded"
            dangerouslySetInnerHTML={{ __html: projectsSectionTitle }}
          />
        )}
      </div>

      {/* Image Management */}
      <div className="mb-4">
        <h3 className="font-semibold mb-2">Manage Images</h3>
        <div className="flex items-center mb-2">
          <input
            type="file"
            accept="image/jpeg, image/png"
            onChange={handleFileChange}
            disabled={!isEditing}
          />
          <button
            onClick={handleUpload}
            className="ml-2 bg-blue-500 text-white p-2 rounded disabled:opacity-50"
            disabled={!isEditing}
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
                  disabled={!isEditing || idx === 0}
                >
                  &larr;
                </button>
                <button
                  onClick={() => moveImageRight(idx)}
                  className="bg-gray-300 text-xs p-1 rounded disabled:opacity-50"
                  disabled={!isEditing || idx === images.length - 1}
                >
                  &rarr;
                </button>
                <button
                  onClick={() => handleDelete(img.key)}
                  className="bg-red-500 text-white text-xs p-1 rounded disabled:opacity-50"
                  disabled={!isEditing}
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

      {/* Save Changes Button */}
      <button
        onClick={handleSave}
        className="bg-green-500 text-white p-2 rounded disabled:opacity-50"
        disabled={!isEditing}
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
