import { useState } from "react";

const ImageCarousel = ({ images, fileNames, onFileNameChange }: { 
  images: string[]; 
  fileNames: string[]; 
  onFileNameChange: (index: number, newName: string) => void; 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrevious = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const goToNext = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  return (
    <div className="w-full">
      {/* Counter Above the Carousel */}
      <div className="text-center mb-2 text-sm text-gray-600">
        {`${currentIndex + 1}/${images.length}`}
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
                index === currentIndex ? "block" : "hidden"
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

              {/* File Name Input (Conditionally Rendered) */}
              {fileNames.length > 0 && (
                <div className="mt-2 w-64">
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    value={fileNames[index]}
                    onChange={(e) => onFileNameChange(index, e.target.value)}
                    placeholder="Enter file name"
                  />
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