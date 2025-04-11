"use client";

import React, { useState, useEffect } from "react";
import { Folder, Image, ChevronLeft, Copy, Check } from "lucide-react";

interface S3Object {
  Key: string;
  LastModified: string;
  Size: number;
  IsFolder: boolean;
}

const S3ImageExplorer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState<string>("");
  const [objects, setObjects] = useState<S3Object[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return; // Don't fetch if dropdown is closed

    setIsLoading(true);
    setError(null);

    const fetchImages = async () => {
      try {
        const response = await fetch(`/api/s3-explorer?bucket=${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}&prefix=${encodeURIComponent(currentPath)}`);

        if (!response.ok) {
          throw new Error("Failed to fetch images from S3");
        }

        const data = await response.json();
        setObjects(data.objects);
      } catch (err) {
        setError("Failed to fetch images from S3");
        console.error("Error fetching images:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchImages();
  }, [currentPath, isOpen]);

  // Navigate to a folder
  const navigateToFolder = (folderPath: string) => {
    setCurrentPath(folderPath);
  };

  // Fixed Navigate to parent folder function
  const navigateUp = () => {
    // If we're already at root, do nothing
    if (currentPath === '') {
      return;
    }

    // Remove trailing slash if it exists
    const pathWithoutTrailingSlash = currentPath.endsWith('/')
      ? currentPath.slice(0, -1)
      : currentPath;

    // Find the last slash to determine parent directory
    const lastSlashIndex = pathWithoutTrailingSlash.lastIndexOf('/');

    if (lastSlashIndex === -1) {
      // No slashes left, go to root
      setCurrentPath('');
    } else {
      // Return everything up to the last slash, plus a trailing slash
      setCurrentPath(pathWithoutTrailingSlash.substring(0, lastSlashIndex + 1));
    }
  };

  // Copy image URL to clipboard
  const copyImageUrl = (key: string) => {
    const imageUrl = `https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${key}`;
    navigator.clipboard.writeText(imageUrl).then(() => {
      setCopiedUrl(key);
      setTimeout(() => setCopiedUrl(null), 2000);
    });
  };

  // Get file extension
  const getFileExtension = (filename: string): string => {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
  };

  // Check if file is an image
  const isImage = (key: string): boolean => {
    const ext = getFileExtension(key).toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext);
  };

  // Format the display name for an object
  const getDisplayName = (key: string): string => {
    // Remove the current path prefix and trailing slash for folders
    let displayName = key.replace(currentPath, '');
    // Remove trailing slash for folders
    if (displayName.endsWith('/')) {
      displayName = displayName.slice(0, -1);
    }
    return displayName;
  };

  return (
    <div className="relative inline-block">
      {/* Main Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
      >
        <Image className="w-4 h-4 mr-2" />
        S3 Images
      </button>

      {/* Dropdown Grid */}
      {isOpen && (
        <div className="absolute z-50 mt-2 w-[800px] bg-white rounded-md shadow-lg p-6 border border-gray-200">
          {/* Navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={navigateUp}
              disabled={currentPath === ''}
              className={`flex items-center ${currentPath === '' ? 'text-gray-400' : 'text-blue-600 hover:text-blue-800'}`}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </button>
            <div className="text-gray-700 truncate">
              {currentPath || 'Root'}
            </div>
          </div>

          {/* Loading and Error States */}
          {isLoading && <div className="py-8 text-center text-gray-500">Loading...</div>}
          {error && <div className="py-8 text-center text-red-500">{error}</div>}

          {/* Grid of Objects */}
          {!isLoading && !error && (
            <>
              {objects.length === 0 ? (
                <div className="py-8 text-center text-gray-500">No items found</div>
              ) : (
                <div className="grid grid-cols-6 gap-4">
                  {objects.map((obj) => {
                    const isFolder = obj.Key.endsWith('/') || obj.IsFolder;
                    const shouldDisplay = isFolder || isImage(obj.Key);

                    if (!shouldDisplay) return null;

                    return (
                      <div
                        key={obj.Key}
                        className="relative group"
                      >
                        {isFolder ? (
                          <button
                            onClick={() => navigateToFolder(obj.Key)}
                            className="flex flex-col items-center p-2 w-full h-full rounded hover:bg-gray-100"
                          >
                            <Folder className="w-16 h-16 text-yellow-500" />
                            <span className="mt-2 text-sm truncate w-full text-center">
                              {getDisplayName(obj.Key)}
                            </span>
                          </button>
                        ) : (
                          <div className="flex flex-col items-center p-2 w-full h-full rounded hover:bg-gray-100">
                            <div className="relative w-24 h-24 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                              <img
                                src={`https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${obj.Key}`}
                                alt={getDisplayName(obj.Key)}
                                className="max-w-full max-h-full object-contain"
                              />
                              <button
                                onClick={() => copyImageUrl(obj.Key)}
                                className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                {copiedUrl === obj.Key ? (
                                  <Check className="w-8 h-8 text-white" />
                                ) : (
                                  <Copy className="w-8 h-8 text-white" />
                                )}
                              </button>
                            </div>
                            <span className="mt-2 text-sm truncate w-full text-center">
                              {getDisplayName(obj.Key)}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default S3ImageExplorer;