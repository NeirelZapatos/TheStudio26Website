import Link from "next/link";
import Image from "next/image";
import AddToCartButton from "./AddToCartButton";

interface ProductCardProps {
  _id: string;
  name: string;
  price: number;
  category: string;
  image_url: string;
  compact?: boolean;
}

function ProductCard({ name, price, image_url, _id, compact }: ProductCardProps) {
  return (
    <div className={`group relative h-full ${compact ? "h-48" : "h-64"}`}>
      <Link
        href={`/StoreSearch/products/${_id}`}
        className="aspect-h-1 aspect-w-1 w-full rounded-md overflow-hidden bg-gray-200 lg:aspect-none lg:h-80"
      >
        <div className="relative aspect-square">
          <Image
            src={image_url}
            width={compact ? 200 : 300} // Adjust image size based on compact prop
            height={compact ? 200 : 300}

            alt="Product Image"
            className="rounded-md h-full w-full object-cover group-hover:opacity-75 duration-200"
          />
        </div>
        <div className="mt-4 flex justify-between">
          <div>
            <h3 className="text-sm text-gray-700">{name}</h3>
            <p className="mt-1 text-sm text-gray-500">${price}</p>
          </div>
        </div>
      </Link>
      <AddToCartButton
        product={{
          _id,
          name,
          price,
          image_url,
        }}
      />
    </div>
  );
}

export default ProductCard;
