"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { uploadFileToS3, listS3Images } from "../../utils/s3";

export default function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch images from S3 on component mount
  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    const images = await listS3Images();
    setUploadedImages(images);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);

    try {
      const uploadedUrl = await uploadFileToS3(file);
      setUploadedImages((prevImages) => [...prevImages, uploadedUrl]);
    } catch (error) {
      console.error("Upload failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Image Upload Section */}
      <div className="flex flex-col items-center p-6 bg-gray-100 rounded-lg shadow-md max-w-md mx-auto mt-6">
        <input
          type="file"
          onChange={handleFileChange}
          className="p-2 border border-gray-300 rounded-md w-full"
        />
        <button
          onClick={handleUpload}
          disabled={!file || loading}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-300"
        >
          {loading ? "Uploading..." : "Upload Image"}
        </button>
      </div>

      {/* Display Images from S3 */}
      <div className="flex justify-center mt-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {uploadedImages.length > 0 ? (
            uploadedImages.map((imageUrl, index) => (
              <Card
                key={index}
                title={`Uploaded Image ${index + 1}`}
                imageUrl={imageUrl}
              />
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
      <h3 className="text-lg text-gray-600">{title}</h3>
    </div>
  </div>
);
