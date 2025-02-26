"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";

// Define multiple sets of prerequisites to choose from
const prerequisitesPool = [
  ["Basic metalsmithing skills", "Must be 18+ years old"],
  ["No prior experience required", "Familiarity with hand tools"],
  ["Basic jewelry design knowledge", "Comfortable with small materials"],
  ["Some experience with shaping metal", "An interest in ring design"],
];

interface CourseType {
  _id: string;
  name: string;
  price: number;
  description: string;
  purchaseType: string;
  date: string;
  duration: number;
  location: string;
  image_url: string;
}

const ClassCatalogPage: React.FC = () => {
  const [courses, setCourses] = useState<CourseType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAndReorderCourses = async () => {
      try {
        // Fetch courses from API (default order)
        const response = await axios.get("/api/courses");
        let fetchedCourses: CourseType[] = response.data;

        // Check for saved order in localStorage
        const savedOrder = localStorage.getItem("courseOrder");
        if (savedOrder) {
          const order: string[] = JSON.parse(savedOrder);
          // Reorder fetchedCourses based on the saved order
          fetchedCourses.sort((a, b) => {
            return order.indexOf(a._id) - order.indexOf(b._id);
          });
        }
        setCourses(fetchedCourses);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching courses:", error);
        setLoading(false);
      }
    };

    fetchAndReorderCourses();
  }, []);

  if (loading) {
    return <div>Loading courses...</div>;
  }

  return (
    <div className="bg-white py-10">
      <div className="max-w-7xl mx-auto px-4">
        {/* Page Heading */}
        <h1 className="text-center text-3xl font-bold mb-4">Class Catalog</h1>
        <p className="text-center text-lg mb-8">
          Below is a comprehensive list of the classes available at our studio.
          If you have any questions, please contact the studio directly.
        </p>

        {/* Responsive Grid of Courses */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {courses.map((course) => {
            // Randomly select one set of prerequisites from the pool
            const randomIndex = Math.floor(
              Math.random() * prerequisitesPool.length
            );
            const chosenPrerequisites = prerequisitesPool[randomIndex];

            return (
              <div
                key={course._id}
                className="bg-white shadow-md rounded-lg overflow-hidden"
              >
                {/* Course Image */}
                <img
                  src={course.image_url}
                  alt={course.name}
                  className="w-full h-48 object-cover"
                />

                {/* Course Details */}
                <div className="p-4">
                  <h2 className="text-xl font-semibold mb-2">{course.name}</h2>
                  <p className="text-gray-600 mb-2">{course.description}</p>
                  <p className="text-gray-800 font-bold">
                    ${course.price}{" "}
                    {course.purchaseType && (
                      <span className="ml-2 text-sm text-gray-500">
                        ({course.purchaseType})
                      </span>
                    )}
                  </p>
                  <p className="text-gray-600">Date: {course.date}</p>
                  <p className="text-gray-600">
                    Duration: {course.duration} hours
                  </p>
                  <p className="text-gray-600">Location: {course.location}</p>
                  <div className="mt-4">
                    <h3 className="font-bold">Prerequisites:</h3>
                    <ul className="list-disc list-inside text-gray-600">
                      {chosenPrerequisites.map((pre, idx) => (
                        <li key={idx}>{pre}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ClassCatalogPage;
