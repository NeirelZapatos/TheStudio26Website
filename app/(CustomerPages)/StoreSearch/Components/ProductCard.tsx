import Link from "next/link";
import Image from "next/image";
import AddToCartButton from "./AddToCartButton";

interface ProductCardProps {
  _id: string;
  name: string;
  price: number;
  image_url: string;
  compact?: boolean;
}

function ProductCard({ name, price, image_url, _id, compact }: ProductCardProps) {
  return (
    <div className={`group relative h-full ${compact ? "h-48" : "h-64"}`}>
      <div className="relative aspect-square">
        <Link
          href={`/StoreSearch/products/${_id}`}
          className="block w-full h-full"
        >
          <Image
            src={image_url}
            width={compact ? 200 : 300}
            height={compact ? 200 : 300}
            alt="Product Image"
            className="rounded-md h-full w-full object-cover group-hover:opacity-90 duration-200"
          />
          <AddToCartButton product={{ _id, name, price, image_url, }}/>
        </Link>
      </div>
      <div className="mt-3 px-1">
        <h3 className="text-sm text-gray-700">{name}</h3>
        <p className="mt-1 text-lg font- text-gray-900">${Number(price).toFixed(2)}</p>
      </div>
    </div>
  );
}

export default ProductCard;