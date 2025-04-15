"use client";

import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import ProductSkeleton from "../../StoreSearch/Components/ProductSkeleton";
import Pagination from "../../StoreSearch/Components/Pagination";

interface Course {
  _id: string;
  name: string;
  price: number;
  class_category: string;
  image_url: string;
  description: string;
  date?: string;
  time?: string;
}

interface ProductGridProps {
  filter: {
    sort: string;
    class_category: string;
    price: { range: [number, number] };
    searchTerm?: string;
  };
}

export default function ProductGrid({ filter }: ProductGridProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [postPerPage] = useState(12);
  const [noSearchResults, setNoSearchResults] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();

        if (filter.sort !== "none") {
          params.append("sort", filter.sort);
        }
        if (filter.class_category && filter.class_category !== "all") {
          params.append("class_category", filter.class_category);
        }
        params.append("minPrice", filter.price.range[0].toString());
        params.append("maxPrice", filter.price.range[1].toString());

        console.log("Fetching with params:", params.toString());
        const response = await fetch(`/api/courses?${params.toString()}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch courses");
        }

        const data = await response.json();
        console.log(`Fetched ${data.length} courses`);
        setCourses(data);
        setNoSearchResults(false); // Reset search results state
        setCurrentPage(1); // Reset to first page when filters change
      } catch (err) {
        console.error("Error fetching courses:", err);
        setError(err instanceof Error ? err.message : "Failed to load courses");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [filter.sort, filter.class_category, filter.price.range]);

  // Client side search filter
  useEffect(() => {
    if (!filter.searchTerm || filter.searchTerm.trim() === "") {
      setFilteredCourses(courses);
      return;
    }

    const searchTermLower = filter.searchTerm.toLowerCase().trim();
    const filtered = courses.filter((course) =>
      course.name.toLowerCase().includes(searchTermLower) || 
      (course.description && course.description.toLowerCase().includes(searchTermLower))
    );

    setFilteredCourses(filtered);
    setCurrentPage(1); // Reset to first page when search changes
  }, [courses, filter.searchTerm]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 min-h-0">
        {Array(6).fill(0).map((_, index) => (
          <ProductSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        <p className="mb-4">Error: {error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="btn btn-outline btn-error"
        >
          Try Again
        </button>
      </div>
    );
  }

  const coursesToDisplay = filteredCourses.length > 0 || filter.searchTerm ? filteredCourses : courses;
  const lastPostIndex = currentPage * postPerPage;
  const firstPostIndex = lastPostIndex - postPerPage;
  const currentPosts = coursesToDisplay.slice(firstPostIndex, lastPostIndex);

  if (noSearchResults) {
    return (
      <div className="lg:col-span-3 text-center py-8">
        <div className="p-8 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No products match your search
          </h3>
          <p className="text-gray-500">
            Try adjusting your search or filter criteria
          </p>
        </div>
      </div>
    );
  }

  if (coursesToDisplay.length === 0) {
    return (
      <div className="lg:col-span-3 text-center py-8">
        <div className="p-8 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No products match your filters
          </h3>
          <p className="text-gray-500">Try adjusting your filter criteria</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-8 min-h-0">
        {currentPosts.map((course) => (
          <ProductCard
            key={course._id}
            _id={course._id}
            name={course.name}
            price={course.price}
            image_url={course.image_url}
            date={course.date}
            time={course.time}
          />
        ))}
      </div>
      {coursesToDisplay.length > postPerPage && (
        <div className="col-span-full flex justify-center mt-8">
          <Pagination
            totalPosts={coursesToDisplay.length}
            postsPerPage={postPerPage}
            setCurrentPage={setCurrentPage}
            currentPage={currentPage}
          />
        </div>
      )}
    </div>
  );
}