"use client"

import Link from "next/link";
import Image from "next/image";
import BookNowButton from "./BookNowButton";
import { useEffect, useState } from "react";

interface ProductCardProps {
  _id: string;
  name: string;
  price: number;
  image_url: string;
  date?: string;
  time?: string;
}

function ProductCard({ _id, name, price, image_url, date, time }: ProductCardProps) {
  const [isFull, setIsFull] = useState(false);

  useEffect(() => {
    async function fetchClassData() {
      try {
        const response = await fetch(`/api/courses/${_id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch class data");
        }
        const data = await response.json();
        const { current_participants, max_capacity } = data;
        setIsFull(current_participants >= max_capacity);
      } catch (error) {
        console.error("Error fetching class data:", error);
      }
    }

    fetchClassData();
  }, [_id]);

  const formattedDate = date ? new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }) : null;

  return (
    <div className="group relative h-full p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow bg-white">
      <Link
        href={`/class-catalog/courses/${_id}`}
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
        <div className="mt-4">
          <div>
            <h3 className="text-sm text-gray-700">{name}</h3>
            <p className="mt-1 text-md text-gray-500">${price}</p>
            {formattedDate && (
              <p className="mt-1 text-sm text-gray-500">
                {formattedDate} {time && `• ${time}`}
              </p>
            )}
          </div>
        </div>
      </Link>
      <div className="mt-4">
        <BookNowButton classId={_id} disabled={isFull}/>
      </div>
    </div>
  );
}

export default ProductCard;