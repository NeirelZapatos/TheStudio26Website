"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import CourseCard from "./productList/CourseCard";
import ClassViewModal from "./productList/ClassViewModal";
import CourseListFilters from "./productList/CourseFilters";

interface Course {
  _id: string;
  name: string;
  description: string;
  class_category: string;
  price: number;
  date?: string;
  time?: string;
  instructor?: string;
  duration?: number;
  location?: string;
  images?: string[];
  image_url?: string;
  prerequisite?: boolean;
  prerequisiteClass?: string;
  max_capacity?: number;
}

const CoursesListSection: React.FC = () => {
  type FilterState = {
    sort: string;
    class_category: string;
    classType: string[];
    price: {
      isCustom: boolean;
      range: [number, number];
    };
    searchTerm?: string;
  };

  // Data States
  const [filter, setFilter] = useState<FilterState>({
    sort: "none",
    class_category: "all",
    classType: [],
    price: { isCustom: false, range: [0, 999999999] as [number, number] },
  });
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Modal State
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // Fetch courses on component mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/courses", {
          params: {
            search: filter.searchTerm,
            class_category: filter.class_category,
          },
        });
        console.log("Fetched courses:", response.data); // ! Debugging line
        setCourses(response.data);
      } catch (err) {
        setError(true);
        console.error("Error fetching courses:", err);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchCourses();
    }, 300);
  }, []);

  // Handle course click to open view modal
  const handleCourseClick = (course: Course) => {
    setSelectedCourse(course);
  };

  // Close view modal
  const handleCloseModal = () => {
    setSelectedCourse(null);
  };

  // Delete course
  const handleDeleteCourse = async (course: Course) => {
    try {
      await axios.delete(`/api/courses/${course._id}`);
      setCourses((prev) => prev.filter((c) => c._id !== course._id));
      setSelectedCourse(null);
    } catch (err) {
      console.error("Error deleting course:", err);
      alert("Failed to delete course. Please try again.");
    }
  };

  // Filter courses based on selected filters
  const getFilteredCourses = () => {
    console.log("All courses before filtering:", courses); // Log all fetched courses
    const filtered = courses.filter((course) => {
      if (
        filter.searchTerm &&
        !course.name?.toLowerCase().includes(filter.searchTerm.toLowerCase())
      ) {
        return false;
      }

      // Apply category filter
      if (
        filter.class_category !== "all" &&
        course.class_category?.toLowerCase() !== filter.class_category.toLowerCase()
      ) {
        return false;
      }
  
      // // Apply class type filter
      // if (
      //   filter.classType.length > 0 &&
      //   (!course.classCategory ||
      //     !filter.classType.includes(course.classCategory.toLowerCase()))
      // ) {
      //   return false;
      // }
  
      // Apply price filter
      if (
        course.price < filter.price.range[0] ||
        course.price > filter.price.range[1]
      ) {
        return false;
      }
  
      return true;
    });
    console.log("Filtered courses:", filtered); // Log courses after filtering
    return filtered;
  };

  const filteredCourses = getFilteredCourses();

  // Sort courses based on selected sort option
  const sortedCourses = [...filteredCourses].sort((a, b) => {
    if (filter.sort === "price-asc") {
      return a.price - b.price;
    } else if (filter.sort === "price-desc") {
      return b.price - a.price;
    } else if (filter.sort === "name-asc") {
      return a.name.localeCompare(b.name);
    } else if (filter.sort === "name-desc") {
      return b.name.localeCompare(a.name);
    }
    return 0;
  });

  // Render loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="text-error text-xl mb-4">Error loading courses</div>
        <button
          onClick={() => window.location.reload()}
          className="btn btn-primary"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Courses</h1>
        <div className="flex items-center gap-2">
          <select
            value={filter.sort}
            onChange={(e) => setFilter({ ...filter, sort: e.target.value })}
            className="select select-bordered select-sm"
          >
            <option value="none">Default Sort</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name-asc">Name: A to Z</option>
            <option value="name-desc">Name: Z to A</option>
          </select>

          {/* Filter Drawer Component */}
          <CourseListFilters filter={filter} setFilter={setFilter} />
        </div>
      </div>

      <div className="w-full">
        {sortedCourses.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] bg-base-200 rounded-lg p-8">
            <p className="text-xl text-base-content mb-4">
              No courses match your filters
            </p>
            <button
              onClick={() =>
                setFilter({
                  sort: "none",
                  class_category: "all",
                  classType: [],
                  price: { isCustom: false, range: [0, 500] as [number, number] },
                })
              }
              className="btn btn-primary"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <p className="text-base-content opacity-70">
                {sortedCourses.length} courses found
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedCourses.map((course) => (
                <div
                  key={course._id}
                  className="bg-base-100 shadow rounded-lg p-4 hover:shadow-lg transition"
                >
                  <CourseCard
                    course={course}
                    onClick={() => handleCourseClick(course)}
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* View Modal */}
      {selectedCourse && (
        <ClassViewModal
          classItem={selectedCourse}
          onClose={handleCloseModal}
          onDelete={handleDeleteCourse}
        />
      )}
    </div>
  );
};

export default CoursesListSection;