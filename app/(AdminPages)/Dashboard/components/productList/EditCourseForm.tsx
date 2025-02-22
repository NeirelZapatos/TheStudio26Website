import React, { useState } from "react";
import { Course } from "./CourseCard";

interface EditCourseFormProps {
  initialCourse: Course;
  onSave: (updatedCourse: Course) => void;
  onCancel: () => void;
  onDelete: (course: Course) => void;
}

const EditCourseForm: React.FC<EditCourseFormProps> = ({
  initialCourse,
  onSave,
  onCancel,
  onDelete,
}) => {
  const [course, setCourse] = useState<Course>(initialCourse);

  const handleSaveClick = () => {
    const updatedCourse = {
      ...course,
      price: Number(course.price),
    };
    onSave(updatedCourse);
  };

  const handleDeleteClick = () => {
    // Optionally add a confirmation prompt
    if (window.confirm("Are you sure you want to delete this course?")) {
      onDelete(course);
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Edit Course</h2>
      
      {/* Course Name */}
      <div className="mb-4">
        <label
          className="block text-gray-700 font-semibold mb-2"
          htmlFor="courseName"
        >
          Course Name
        </label>
        <input
          id="courseName"
          type="text"
          value={course.name}
          onChange={(e) => setCourse({ ...course, name: e.target.value })}
          className="border border-gray-300 rounded px-3 py-2 w-full"
        />
      </div>

      {/* Description */}
      <div className="mb-4">
        <label
          className="block text-gray-700 font-semibold mb-2"
          htmlFor="courseDescription"
        >
          Description
        </label>
        <textarea
          id="courseDescription"
          value={course.description}
          onChange={(e) =>
            setCourse({ ...course, description: e.target.value })
          }
          className="border border-gray-300 rounded px-3 py-2 w-full"
        />
      </div>

      {/* Price */}
      <div className="mb-4">
        <label
          className="block text-gray-700 font-semibold mb-2"
          htmlFor="coursePrice"
        >
          Price
        </label>
        <input
          id="coursePrice"
          type="number"
          value={course.price}
          onChange={(e) =>
            setCourse({ ...course, price: parseInt(e.target.value) })
          }
          className="border border-gray-300 rounded px-3 py-2 w-full"
        />
      </div>

      {/* Location */}
      <div className="mb-4">
        <label
          className="block text-gray-700 font-semibold mb-2"
          htmlFor="courseLocation"
        >
          Location
        </label>
        <input
          id="courseLocation"
          type="text"
          value={course.location}
          onChange={(e) =>
            setCourse({ ...course, location: e.target.value })
          }
          className="border border-gray-300 rounded px-3 py-2 w-full"
        />
      </div>

      {/* Recurring */}
      <div className="mb-4">
        <label
          className="block text-gray-700 font-semibold mb-2"
          htmlFor="courseRecurring"
        >
          Recurring?
        </label>
        <select
          id="courseRecurring"
          value={course.recurring ? "true" : "false"}
          onChange={(e) =>
            setCourse({
              ...course,
              recurring: e.target.value === "true",
            })
          }
          className="border border-gray-300 rounded px-3 py-2 w-full"
        >
          <option value="true">Recurring</option>
          <option value="false">One-Time</option>
        </select>
      </div>

      {/* Date & Time */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label
            className="block text-gray-700 font-semibold mb-2"
            htmlFor="courseDate"
          >
            Date
          </label>
          <input
            id="courseDate"
            type="date"
            value={course.date}
            onChange={(e) =>
              setCourse({ ...course, date: e.target.value })
            }
            className="border border-gray-300 rounded px-3 py-2 w-full"
          />
        </div>
        <div>
          <label
            className="block text-gray-700 font-semibold mb-2"
            htmlFor="courseTime"
          >
            Time
          </label>
          <input
            id="courseTime"
            type="time"
            value={course.time}
            onChange={(e) =>
              setCourse({ ...course, time: e.target.value })
            }
            className="border border-gray-300 rounded px-3 py-2 w-full"
          />
        </div>
      </div>

      {/* Instructor & Duration */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label
            className="block text-gray-700 font-semibold mb-2"
            htmlFor="courseInstructor"
          >
            Instructor
          </label>
          <input
            id="courseInstructor"
            type="text"
            value={course.instructor}
            onChange={(e) =>
              setCourse({ ...course, instructor: e.target.value })
            }
            className="border border-gray-300 rounded px-3 py-2 w-full"
          />
        </div>
        <div>
          <label
            className="block text-gray-700 font-semibold mb-2"
            htmlFor="courseDuration"
          >
            Duration (minutes)
          </label>
          <input
            id="courseDuration"
            type="text"
            value={course.duration}
            onChange={(e) =>
              setCourse({ ...course, duration: e.target.value })
            }
            className="border border-gray-300 rounded px-3 py-2 w-full"
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex space-x-2">
        <button
          onClick={handleSaveClick}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Save
        </button>
        <button
          onClick={onCancel}
          className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
        >
          Cancel
        </button>
        <button
          onClick={handleDeleteClick}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default EditCourseForm;