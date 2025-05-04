import Link from "next/link";
import Image from "next/image";
import AddToCartButton from "./AddToCartButton";

interface ProductCardProps {
  _id: string;
  name: string;
  price: number;
  image_url: string;
  quantity_in_stock?: number;
  compact?: boolean;
}

function ProductCard({
  name,
  price,
  image_url,
  _id,
  quantity_in_stock = 0,
  compact,
}: ProductCardProps) {
  const isInStock = quantity_in_stock > 0;

  return (
    <div
      className={`group relative h-full p-4 rounded-lg hover:shadow-lg transition-shadow bg-white ${compact ? "h-48" : "h-64"}`}
    >
      <Link
        href={`/StoreSearch/products/${_id}`}
        className="aspect-h-1 aspect-w-1 w-full rounded-md overflow-hidden bg-gray-200 lg:aspect-none lg:h-80"
      >
        <div className="relative aspect-square">
          <Image
            src={image_url}
            width={compact ? 200 : 300}
            height={compact ? 200 : 300}
            alt="Product Image"
            className="rounded-md h-full w-full object-cover group-hover:opacity-75 duration-200"
          />

          {isInStock && (
            <AddToCartButton
              product={{ _id, name, price, image_url, quantity_in_stock }}
            />
          )}
        </div>
        <div className="mt-4">
          <h3 className="text-sm text-gray-700">{name}</h3>
          <p className="mt-1 text-md text-gray-900">
            ${Number(price).toFixed(2)}
          </p>
          {!isInStock && (
            <p className="text-xs text-red-500 mt-1">Out of stock</p>
          )}
        </div>
      </Link>
    </div>
  );
}

export default ProductCard;
