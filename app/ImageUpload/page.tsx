"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { uploadFileToS3, listS3Images } from "../../utils/s3";

export default function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>(""); // Store custom file name
  const [uploadedImages, setUploadedImages] = useState<
    { url: string; key: string }[]
  >([]);
  const [loading, setLoading] = useState(false);

  // Fetch images from S3 when the component mounts
  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    const images = await listS3Images();
    setUploadedImages(images);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      setFile(selectedFile);
      setFileName(selectedFile.name.replace(/\s+/g, "-")); // Default name with hyphens
    }
  };

  const handleUpload = async () => {
    if (!file || !fileName.trim()) return;
    setLoading(true);

    try {
      const sanitizedFileName = fileName.replace(/\s+/g, "-").toLowerCase(); // Ensure clean names
      const uploadedUrl = await uploadFileToS3(file, sanitizedFileName);
      setUploadedImages((prevImages) => [
        ...prevImages,
        { url: uploadedUrl, key: sanitizedFileName },
      ]);
      setFile(null); // Reset file selection
      setFileName(""); // Reset file name
    } catch (error) {
      console.error("Upload failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      {/* Image Upload Section */}
      <div className="flex flex-col items-center p-6 bg-gray-100 rounded-lg shadow-md max-w-md mx-auto mt-6">
        <input
          type="file"
          onChange={handleFileChange}
          className="p-2 border border-gray-300 rounded-md w-full"
        />
        {file && (
          <input
            type="text"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            className="mt-2 p-2 border border-gray-300 rounded-md w-full text-center"
            placeholder="Rename file before upload"
          />
        )}
        <button
          onClick={handleUpload}
          disabled={!file || loading}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-300"
        >
          {loading ? "Uploading..." : "Upload Image"}
        </button>
      </div>

      {/* Display All Images from S3 */}
      <div className="mt-8">
        <h2 className="text-2xl font-semibold text-center mb-4">
          All Uploaded Images
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {uploadedImages.length > 0 ? (
            uploadedImages.map(({ url, key }) => (
              <Card key={key} title={key} imageUrl={url} />
            ))
          ) : (
            <p className="text-center text-gray-500">No images found.</p>
          )}
        </div>
      </div>
    </div>
  );
}

// Card Component
const Card: React.FC<{ title: string; imageUrl: string }> = ({
  title,
  imageUrl,
}) => (
  <div className="border border-gray-300 rounded-lg overflow-hidden w-60 p-4 mx-auto my-auto">
    <div className="w-full h-60 bg-gray-100 flex items-center justify-center">
      <Image
        src={imageUrl}
        width={300}
        height={300}
        alt={title}
        className="w-full h-full object-cover object-center"
      />
    </div>
    <div className="p-1 text-left">
      <h3 className="text-lg text-gray-600 truncate">{title}</h3>
    </div>
  </div>
);
