import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";

interface ProductGalleryProps {
  images: string[];
}

export default function ProductGallery({ images }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const handlePrev = () => {
    setActiveIndex((prevIndex) =>
      prevIndex > 0 ? prevIndex - 1 : images.length - 1
    );
  };

  const handleNext = () => {
    setActiveIndex((prevIndex) =>
      prevIndex < images.length - 1 ? prevIndex + 1 : 0
    );
  };

  if (!images.length) {
    return (
      <div className="col-span-3 aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-400">No images available</p>
      </div>
    );
  }

  return (
    <div className="col-span-3 space-y-4 lg:sticky top-20">
      {/* Main image container */}
      <div 
        className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 cursor-zoom-in"
        onClick={() => setLightboxOpen(true)}
      >
        <div className="relative aspect-square w-full h-full">
          <Image
            src={images[activeIndex]}
            alt="Product"
            fill
            className="w-full h-full object-cover"
            priority
            sizes="(min-width: 1024px) 60vw, 100vw"
          />
        </div>
        
        {/* Navigation arrows */}
        <div className="absolute inset-0 flex items-center justify-between p-4 pointer-events-none">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="p-2 rounded-full bg-white bg-opacity-70 hover:bg-opacity-100 shadow-md transition-all pointer-events-auto"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-5 w-5 text-gray-800" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="p-2 rounded-full bg-white bg-opacity-70 hover:bg-opacity-100 shadow-md transition-all pointer-events-auto"
            aria-label="Next image"
          >
            <ChevronRight className="h-5 w-5 text-gray-800" />
          </button>
        </div>
      </div>

      {/* Thumbnails */}
      <div className="flex gap-3 overflow-x-auto py-1 px-1 pb-2">
        {images.map((img, index) => (
          <button
            key={index}
            onClick={(e) => {
              e.stopPropagation();
              setActiveIndex(index);
            }}
            className={`relative h-20 w-20 flex-shrink-0 rounded overflow-hidden ${
              activeIndex === index
                ? "ring-4 ring-amber-500 shadow-md"
                : "border border-gray-200 hover:ring-2 hover:ring-gray-300"
            } transition-all duration-100`}
          >
            <Image
              src={img}
              alt={`Product thumbnail ${index + 1}`}
              fill
              className="object-cover"
              sizes="80px"
            />
          </button>
        ))}
      </div>

      {/* Lightbox Component */}
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        index={activeIndex}
        slides={images.map(img => ({ src: img }))}
        plugins={[Zoom, Thumbnails]}
        carousel={{
          finite: images.length <= 1,
          preload: 2,
          padding: 0,
          spacing: 0.1
        }}
        thumbnails={{
          border: 0,
          width: 80,
          height: 80,
          borderRadius: 8,
          padding: 4,
          gap: 8,
        }}
        zoom={{
          maxZoomPixelRatio: 3,
          zoomInMultiplier: 2,
          doubleTapDelay: 300,
          doubleClickDelay: 500,
          scrollToZoom: true
        }}
        controller={{
          closeOnBackdropClick: true,
          closeOnPullDown: true,
        }}
        on={{ view: ({ index }) => setActiveIndex(index) }}
        styles={{
          container: { backgroundColor: "rgba(0, 0, 0, 0.9)" },
          thumbnail: { border: "2px solid rgba(255, 255, 255, 0.1)" },
        }}
        
      />
    </div>
  );
}