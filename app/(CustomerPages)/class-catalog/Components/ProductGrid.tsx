// app/(CustomerPages)/class-catalog/components/ProductGrid.tsx
"use client";

import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";

interface Course {
  _id: string;
  name: string;
  price: number;
  category: string;
  classType: string[];
  image_url: string;
  description: string;
}

interface ProductGridProps {
  filter: {
    sort: string;
    category: string;
    classType: string[];
    price: { range: [number, number] };
  };
}

export default function ProductGrid({ filter }: ProductGridProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const params = new URLSearchParams();

        // Only add parameters if they have values
        if (filter.sort !== "none") {
          params.append("sort", filter.sort);
        }
        if (filter.category && filter.category !== "all") {
          params.append("category", filter.category);
        }
        if (filter.classType.length > 0) {
          params.append("classType", filter.classType.join(","));
        }

        console.log("Fetching with params:", params.toString());
        const response = await fetch(`/api/courses?${params.toString()}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch courses");
        }

        const data = await response.json();
        setCourses(data);
      } catch (err) {
        console.error("Error fetching courses:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load courses"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [filter]);

  if (loading) {
    return <div className="text-center py-8">Loading courses...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 min-h-0">
      {courses.map((course) => (
        <ProductCard
          key={course._id}
          _id={course._id}
          name={course.name}
          price={course.price}
          image_url={course.image_url}
        />
      ))}
    </div>
  );
}