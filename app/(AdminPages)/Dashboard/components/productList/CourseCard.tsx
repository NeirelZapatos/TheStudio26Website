// CourseCard.tsx
import React from "react";

export type Course = {
  classType: string;
  category: string;
  _id: string;
  name: string;
  description: string;
  price: number;
  location: string;
  recurring: boolean;
  image_url?: string;
  date: string;
  time: string;
  instructor: string;
  duration: string;
  stripeProductId?: string;
};

type CourseCardProps = {
  course: Course;
  onEdit: (course: Course) => void;
};

const CourseCard: React.FC<CourseCardProps> = ({ course, onEdit }) => {
  return (
    <div className="bg-white p-4 rounded">
      {course.image_url && (
        <img
          src={course.image_url}
          alt={course.name}
          className="w-full h-48 object-cover rounded mb-4"
        />
      )}

      {/* Course Name */}
      <h3 className="text-xl font-semibold text-gray-800 mb-3">
        {course.name}
      </h3>

      {/* Description */}
      <p className="text-gray-700 mb-4">{course.description}</p>

      {/* Key Details */}
      <ul className="space-y-2 text-gray-700 mb-4">
        <li>
          <span className="font-semibold">Price:</span> ${course.price}
        </li>
        <li>
          <span className="font-semibold">Location:</span> {course.location}
        </li>
        <li>
          <span className="font-semibold">Purchase Type:</span>{" "}
          {course.recurring ? "Recurring" : "One-Time"}
        </li>
        <li>
          <span className="font-semibold">Date:</span> {course.date}
        </li>
        <li>
          <span className="font-semibold">Time:</span> {course.time}
        </li>
        <li>
          <span className="font-semibold">Instructor:</span> {course.instructor}
        </li>
        <li>
          <span className="font-semibold">Duration:</span> {course.duration} minutes
        </li>
      </ul>

      {/* Edit Button */}
      <button
        onClick={() => onEdit(course)}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Edit
      </button>
    </div>
  );
};

export default CourseCard;