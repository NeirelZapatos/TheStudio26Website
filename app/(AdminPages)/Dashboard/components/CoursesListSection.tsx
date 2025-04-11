import { useEffect, useState } from "react";
import axios from "axios";
import CourseCard, { Course } from "./productList/CourseCard";
import EditCourseForm from "./productList/EditCourseForm";
import CourseListFilters from "./productList/CourseFilters";

const CoursesList: React.FC = () => {
  type FilterState = {
    sort: string;
    category: string;
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
    category: "all",
    classType: [],
    price: { isCustom: false, range: [0, 500] as [number, number] },
    searchTerm: "",
  });
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Editing States
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  // Fetch courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/courses");
        setCourses(response.data);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  // Handlers for editing courses
  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
  };

  const handleSaveCourse = async (updatedCourse: Course) => {
    try {
      await axios.put(`/api/courses/${updatedCourse._id}`, updatedCourse);
      setCourses((prev) =>
        prev.map((c) => (c._id === updatedCourse._id ? updatedCourse : c))
      );
      setEditingCourse(null);
    } catch (err) {
      console.error("Error saving course:", err);
      setError(true);
    }
  };

  const handleCancelCourse = () => {
    setEditingCourse(null);
  };

  const handleDeleteCourse = async (course: Course) => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      try {
        // Call Next.js DELETE route, sending JSON in the body
        await axios.delete(`/api/courses/${course._id}`);

        // Remove from state
        setCourses((prev) => prev.filter((c) => c._id !== course._id));

        // Clear editing state if needed
        if (editingCourse && editingCourse._id === course._id) {
          setEditingCourse(null);
        }
      } catch (err) {
        console.error("Error deleting course:", err);
        setError(true);
      }
    }
  };

  const getFilteredCourses = () => {
    return courses.filter((course) => {
      if (filter.category !== "all" && course.category !== filter.category) {
        return false;
      }
      // Filter by class type
      if (
        filter.classType.length > 0 &&
        !filter.classType.includes(course.classType)
      ) {
        return false;
      }

      // Apply search filter - case insensitive
      if (
        filter.searchTerm &&
        !course.name.toLowerCase().includes(filter.searchTerm.toLowerCase())
      ) {
        return false;
      }

      return true;
    });
  };

  const filteredCourses = getFilteredCourses();

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error loading data.</div>;
  }

  return (
    <div className="container mx-auto py-8">
      {/* Courses Section */}
      <section className="mb-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold mb-4">Courses</h2>
          <CourseListFilters filter={filter} setFilter={setFilter} />
        </div>

        {filteredCourses.length === 0 ? (
          <p>No courses available.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <div key={course._id} className="bg-white shadow rounded-lg p-4">
                {editingCourse && editingCourse._id === course._id ? (
                  <EditCourseForm
                    initialCourse={editingCourse}
                    onSave={handleSaveCourse}
                    onCancel={handleCancelCourse}
                    onDelete={handleDeleteCourse}
                  />
                ) : (
                  <CourseCard course={course} onEdit={handleEditCourse} />
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default CoursesList;
