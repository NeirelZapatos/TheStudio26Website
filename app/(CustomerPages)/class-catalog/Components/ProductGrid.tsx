"use client";

import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import Pagination from "../../StoreSearch/Components/Pagination";

interface Course {
  _id: string;
  name: string;
  price: number;
  category: string;
  classType: string[];
  image_url: string;
  description: string;
  date?: string;
  time?: string;
}

interface ProductGridProps {
  filter: {
    sort: string;
    category: string;
    classType: string[];
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
  const [postPerPage, setPostsPerPage] = useState(24);

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
        setError(err instanceof Error ? err.message : "Failed to load courses");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [filter.sort, filter.category, filter.classType]);

  //Client side search filter
  useEffect(() => {
    if (!filter.searchTerm || filter.searchTerm.trim() === "") {
      setFilteredCourses(courses);
      return;
    }

    const searchTermLower = filter.searchTerm.toLowerCase().trim();
    const filtered = courses.filter((course) =>
      course.name.toLowerCase().includes(searchTermLower)
    );

    setFilteredCourses(filtered);
    setCurrentPage(1); // Reset to the first page when filtering
  }, [courses, filter.searchTerm]);

  if (loading) {
    return <div className="text-center py-8">Loading courses...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Error: {error}</div>;
  }

  const coursesToDisplay =
    filteredCourses.length > 0 ? filteredCourses : courses;
  const lastPostIndex = currentPage * postPerPage;
  const firstPostIndex = lastPostIndex - postPerPage;
  const currentPosts = coursesToDisplay.slice(firstPostIndex, lastPostIndex);

  if (filteredCourses.length === 0) {
    return (
      <div className="lg:col-span-3 text-center py-8">
        No products match your search criteria.
      </div>
    );
  }

  return (
    <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 min-h-0">
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
      <div className="col-span-full flex justify-center mt-8">
        <Pagination
          totalPosts={coursesToDisplay.length}
          postsPerPage={postPerPage}
          setCurrentPage={setCurrentPage}
          currentPage={currentPage}
        />
      </div>
    </div>
  );
}
