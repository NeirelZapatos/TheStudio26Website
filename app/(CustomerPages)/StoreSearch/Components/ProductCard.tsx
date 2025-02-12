import Link from "next/link";
import Image from "next/image";

interface ProductCardProps {
  _id: string;
  name: string;
  price: number;
  category: string;
  image_url: string;
}

function ProductCard({ name, price, image_url, _id }: ProductCardProps) {
  return (
    <div className="group relative h-full">
      <Link
        href={`/ProductDetails/${_id}`}
        className="aspect-h-1 aspect-w-1 w-full rounded-md overflow-hidden bg-gray-200 lg:aspect-none lg:h-80"
      >
        <div className="relative aspect-square">
          <Image
            src={image_url}
            width={300}
            height={300}
            alt="Product Image"
            className="rounded-md h-full w-full object-cover group-hover:opacity-75 duration-200"
          />
        </div>
        <div className="mt-4 flex justify-between">
          <div>
            <h3 className="text-sm text-gray-700">{name}</h3>
            {/* <p className="mt-1 text-sm text-gray-500">${price.toFixed(2)}</p> */}
          </div>
        </div>
      </Link>
    </div>
  );
}

export default ProductCard;
