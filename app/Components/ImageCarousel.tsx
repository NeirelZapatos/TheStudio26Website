import { useState, useEffect } from "react";

interface ImageCarouselProps {
  images: string[];
  currentIndex?: number;
  onIndexChange?: (index: number) => void;
  onRemoveImage?: (index: number) => void;
  onReplaceImage?: (index: number) => void;
}

const ImageCarousel = ({
  images,
  currentIndex = 0,
  onIndexChange,
  onRemoveImage,
  onReplaceImage,
}: ImageCarouselProps) => {
  const [localIndex, setLocalIndex] = useState(currentIndex);

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

  const isPlaceholder = (imageUrl: string) => {
    return imageUrl.includes("ProductPlaceholder");
  }

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
              className={`carousel-item w-full flex flex-col justify-center items-center ${index === localIndex ? "block" : "hidden"
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
                    className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                    onClick={(e) => removeImage(e, index)}
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImageCarousel;