import Link from "next/link";
import Image from "next/image";

function ProductCard() {
  return (
    <Link
      href="/ProductDetails"
      className="block bg-white rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300"
    >
      <div className="relative aspect-square">
        <Image
          src="https://images.freeimages.com/images/large-previews/521/accessories-5-1426954.jpg?fmt=webp&w=500"
          width={300}
          height={300}
          alt="Product Image"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="text-gray-800 font-medium text-sm mb-2">Product Name</h3>
        <p className="text-gray-900 font-semibold">$0.00</p>
      </div>
    </Link>
  );
}

export default ProductCard;
