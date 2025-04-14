import { Class } from "./ClassTypes";

interface CourseCardProps {
  course: Class;
  onClick: () => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, onClick }) => {
  return (
    <div className="flex flex-col h-full cursor-pointer" onClick={onClick}>
      <div className="mb-2 h-48 bg-gray-200 flex items-center justify-center rounded-lg overflow-hidden">
        {course.image_url ? (
          <img
            src={course.image_url}
            alt={course.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-gray-400">Course Image</div>
        )}
      </div>
      <h3 className="font-medium text-lg">{course.name}</h3>
      <p className="text-gray-700">${course.price.toFixed(2)}</p>
      <button
        className="mt-2 w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition"
      >
        View Details
      </button>
    </div>
  );
};

export default CourseCard;