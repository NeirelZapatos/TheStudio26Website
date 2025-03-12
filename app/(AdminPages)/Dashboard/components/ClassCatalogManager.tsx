"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";

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

const ClassCatalogManager: React.FC = () => {
  const [courses, setCourses] = useState<CourseType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch all courses on component mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get("/api/courses");
        // Set courses from the API (default order)
        setCourses(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching courses:", error);
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Simple function to swap two items in the array
  const swapCourses = (indexA: number, indexB: number) => {
    const updatedCourses = [...courses];
    const temp = updatedCourses[indexA];
    updatedCourses[indexA] = updatedCourses[indexB];
    updatedCourses[indexB] = temp;
    setCourses(updatedCourses);
  };

  // Move item up in the list
  const moveUp = (index: number) => {
    if (index === 0) return;
    swapCourses(index, index - 1);
  };

  // Move item down in the list
  const moveDown = (index: number) => {
    if (index === courses.length - 1) return;
    swapCourses(index, index + 1);
  };

  // Save the new order in localStorage
  const saveOrder = async () => {
    try {
      const reorderedIDs = courses.map((course) => course._id);
      localStorage.setItem("courseOrder", JSON.stringify(reorderedIDs));
      console.log("New order saved in localStorage:", reorderedIDs);
      alert("Order saved in localStorage!");
    } catch (error) {
      console.error("Error saving order:", error);
    }
  };

  if (loading) {
    return <div>Loading courses...</div>;
  }

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Class Catalog Manager</h2>
      <p className="text-gray-600 mb-6">
        Rearrange and manage classes that appear on the public Class Catalog
        page.
      </p>

      <div className="space-y-4">
        {courses.map((course, index) => (
          <div
            key={course._id}
            className="border border-gray-300 p-4 rounded flex justify-between items-center"
          >
            <div>
              <h3 className="font-semibold text-lg">{course.name}</h3>
              <p className="text-sm text-gray-500">{course.description}</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => moveUp(index)}
                className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 rounded"
              >
                Up
              </button>
              <button
                onClick={() => moveDown(index)}
                className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 rounded"
              >
                Down
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={saveOrder}
        className="mt-6 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
      >
        Save Order
      </button>
    </div>
  );
};

export default ClassCatalogManager;
