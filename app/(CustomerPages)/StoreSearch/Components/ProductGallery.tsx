// components/ProductGallery.jsx
import { useState } from "react";
import Image from "next/image";
import Zoom from "react-medium-image-zoom";

interface ProductGalleryProps {
  images: string[];
}

const ProductGallery = ({ images }: ProductGalleryProps) => {
  const [mainImage, setMainImage] = useState(images[0] || "");

  return (
    <div className="flex flex-col md:flex-row gap-4">
      {/* Thumbnails */}
      <div className="flex md:flex-col flex-row gap-2 w-full md:w-1/5 overflow-x-auto md:overflow-y-auto md:max-h-96">
        {images.map((img, index) => (
          <button
            key={index}
            onClick={() => setMainImage(img)}
            className={`relative h-20 w-20 flex-shrink-0 rounded overflow-hidden border-2 ${
              mainImage === img ? "border-blue-500" : "border-gray-200"
            } hover:border-blue-300 transition-colors`}
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
      
      {/* Main image */}
      <div className="w-full aspect-square relative rounded-lg overflow-hidden border border-gray-200">
        {mainImage ? (
          <Zoom>
            <Image
              src={mainImage}
              alt="Product"
              fill
              className="w-full h-full object-cover"
              priority
            />
          </Zoom>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <p className="text-gray-400">No image available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductGallery;
