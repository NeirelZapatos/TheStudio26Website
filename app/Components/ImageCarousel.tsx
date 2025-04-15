import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Trash, FolderSearch } from "lucide-react";
import S3ImageExplorer from "./S3ImageExplorer";

interface ImageCarouselProps {
  images: string[];
  currentIndex?: number;
  onIndexChange?: (index: number) => void;
  onRemoveImage?: (index: number) => void;
  onAddS3Image?: (imageUrl: string) => void; 
}

const ImageCarousel = ({
  images,
  currentIndex = 0,
  onIndexChange,
  onRemoveImage,
  onAddS3Image,
}: ImageCarouselProps) => {
  const [localIndex, setLocalIndex] = useState(currentIndex);
  const [isS3SelectorOpen, setIsS3SelectorOpen] = useState(false);

  useEffect(() => {
    setLocalIndex(currentIndex);
  }, [currentIndex]);

  const goToPrevious = (e: React.MouseEvent) => {
    e.preventDefault();
    const newIndex = localIndex === 0 ? images.length - 1 : localIndex - 1;
    setLocalIndex(newIndex);
    onIndexChange?.(newIndex);
  };

  const goToNext = (e: React.MouseEvent) => {
    e.preventDefault();
    const newIndex = localIndex === images.length - 1 ? 0 : localIndex + 1;
    setLocalIndex(newIndex);
    onIndexChange?.(newIndex);
  };

  const removeImage = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    onRemoveImage?.(index);
  };

  const handleS3ImageSelect = (imageUrl: string) => {
    if (onAddS3Image) {
      onAddS3Image(imageUrl);
    }
    setIsS3SelectorOpen(false);
  };

  const isPlaceholder = (imageUrl: string) => {
    return imageUrl.includes("ProductPlaceholder");
  };

  return (
    <div className="w-full">
      {/* Counter Above the Carousel */}
      <div className="text-center mb-2 text-sm text-gray-600">
        {`${localIndex + 1}/${images.length}`}
      </div>

      {/* Carousel Container */}
      <div className="carousel w-full rounded-lg overflow-hidden relative">
        {/* Navigation Buttons */}
        <div className="absolute flex justify-between transform -translate-y-1/2 left-2 right-2 top-1/2 z-10">
          <button
            onClick={goToPrevious}
            className="btn btn-circle bg-white/50 hover:bg-white/70"
          >
            ❮
          </button>
          <button
            onClick={goToNext}
            className="btn btn-circle bg-white/50 hover:bg-white/70"
          >
            ❯
          </button>
        </div>

        {/* Image Container */}
        <div className="w-full flex justify-center items-center">
          {images.map((image, index) => (
            <div
              key={index}
              id={`slide${index}`}
              className={`carousel-item w-full flex flex-col justify-center items-center ${
                index === localIndex ? "block" : "hidden"
              }`}
            >
              {/* Image */}
              <div className="w-64 h-64 flex justify-center items-center">
                <img
                  src={image}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover border-2 border-gray-300 rounded-lg"
                />
              </div>

              {/* Remove Image Button */}
              {!isPlaceholder(image) && (
                <div className="absolute bottom-2 flex space-x-2">
                  <button
                    className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 flex items-center"
                    onClick={(e) => removeImage(e, index)}
                  >
                    <Trash size={16} className="mr-1" /> Remove
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* S3 Image Selection Button */}
      <div className="mt-4 flex justify-center gap-2">
        <button
          type="button"
          className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 flex items-center"
          onClick={() => setIsS3SelectorOpen(true)}
        >
          <FolderSearch size={16} className="mr-2" /> Select from existing images
        </button>
      </div>

      {/* S3 Image Selector */}
      {isS3SelectorOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 w-11/12 max-w-4xl max-h-[90vh] overflow-auto">
            <h3 className="text-lg font-semibold mb-4">Select Image</h3>
            <S3ImageExplorer onSelectImage={handleS3ImageSelect} />
            <button
              className="mt-4 bg-gray-300 text-gray-800 px-3 py-2 rounded hover:bg-gray-400"
              onClick={() => setIsS3SelectorOpen(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageCarousel;