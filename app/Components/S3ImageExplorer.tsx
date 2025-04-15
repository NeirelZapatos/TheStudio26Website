import React, { useState, useEffect } from "react";
import { Folder, Image, ChevronLeft, ArrowRight } from "lucide-react";

interface S3Object {
  Key: string;
  LastModified: string;
  Size: number;
  IsFolder: boolean;
}

interface S3ImageExplorerProps {
  onSelectImage: (imageUrl: string) => void;
}

const S3ImageExplorer = ({ onSelectImage }: S3ImageExplorerProps) => {
  const [currentPath, setCurrentPath] = useState<string>("");
  const [objects, setObjects] = useState<S3Object[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageKey, setSelectedImageKey] = useState<string | null>(null);

  useEffect(() => {
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
  }, [currentPath]);

  const navigateToFolder = (folderPath: string) => {
    setCurrentPath(folderPath);
  };

  // Navigate to parent folder
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

  const getImageUrl = (key: string): string => {
    return `https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${key}`;
  };

  const selectImage = (key: string) => {
    setSelectedImageKey(key);
  };

  const confirmSelection = () => {
    if (selectedImageKey) {
      onSelectImage(getImageUrl(selectedImageKey));
    }
  };

  const getFileExtension = (filename: string): string => {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
  };

  const isImage = (key: string): boolean => {
    const ext = getFileExtension(key).toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext);
  };

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
    <div className="w-full">
      {/* Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button" 
          onClick={navigateUp}
          disabled={currentPath === ''}
          className={`flex items-center ${currentPath === '' ? 'text-gray-400' : 'text-blue-600 hover:text-blue-800'}`}
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back
        </button>
        <div className="text-gray-700 truncate">
          {currentPath || ''}
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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {objects.map((obj) => {
                const isFolder = obj.Key.endsWith('/') || obj.IsFolder;
                const shouldDisplay = isFolder || isImage(obj.Key);
                const isSelected = obj.Key === selectedImageKey;

                if (!shouldDisplay) return null;

                return (
                  <div
                    key={obj.Key}
                    className={`relative group ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
                  >
                    {isFolder ? (
                      <button
                        type="button"
                        onClick={() => navigateToFolder(obj.Key)}
                        className="flex flex-col items-center p-2 w-full h-full rounded hover:bg-gray-100"
                      >
                        <Folder className="w-12 h-12 text-yellow-500" />
                        <span className="mt-2 text-xs truncate w-full text-center">
                          {getDisplayName(obj.Key)}
                        </span>
                      </button>
                    ) : (
                      <button 
                        type="button"
                        className="flex flex-col items-center p-2 w-full h-full rounded hover:bg-gray-100 cursor-pointer"
                        onClick={() => selectImage(obj.Key)}
                      >
                        <div className="relative w-20 h-20 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                          <img
                            src={getImageUrl(obj.Key)}
                            alt={getDisplayName(obj.Key)}
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>
                        <span className="mt-2 text-xs truncate w-full text-center">
                          {getDisplayName(obj.Key)}
                        </span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Selection controls */}
      {selectedImageKey && (
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={confirmSelection}
            className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 flex items-center"
          >
            Select Image <ArrowRight className="ml-2 w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default S3ImageExplorer;