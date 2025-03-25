import { useEffect, useState } from "react";
import axios from "axios";
import CourseCard, { Course } from "./productList/CourseCard";
import ItemCard, { Item } from "./productList/ItemCard";
import EditCourseForm from "./productList/EditCourseForm";
import EditItemForm from "./productList/EditItemForm";

const ProductList: React.FC = () => {
  type FilterState = {
    sort: string;
    category: string;
    color: string[];
    material: string[];
    size: string[];
    price: {
      isCustom: boolean;
      range: [number, number];
    };
  };
  // Data States
  const [filter, setFilter] = useState<FilterState>({
    sort: "none",
    category: "all",
    color: [],
    material: [],
    size: [],
    price: { isCustom: false, range: [0, 500] as [number, number] },
  });
  const [courses, setCourses] = useState<Course[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Editing States
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editingItem, setEditingItem] = useState<Item | null>(null);

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

  // Fetch items
  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/items");
        setItems(response.data);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
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

  // Handlers for editing items
  const handleEditItem = (item: Item) => {
    setEditingItem(item);
  };

  const handleSaveItem = async (updatedItem: Item) => {
    try {
      await axios.put(`/api/items/${updatedItem._id}`, updatedItem);
      setItems((prev) =>
        prev.map((i) => (i._id === updatedItem._id ? updatedItem : i))
      );
      setEditingItem(null);
    } catch (err) {
      console.error("Error saving item:", err);
      setError(true);
    }
  };

  const handleCancelItem = () => {
    setEditingItem(null);
  };

  const handleDeleteItem = async (item: Item) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        await axios.delete(`/api/items/${item._id}`);

        setItems((prev) => prev.filter((i) => i._id !== item._id));

        // Clear editing state if needed
        if (editingItem && editingItem._id === item._id) {
          setEditingItem(null);
        }
      } catch (err) {
        console.error("Error deleting item:", err);
        setError(true);
      }
    }
  };

  const getFilteredCourses = () => {
    return courses.filter((course) => {
      if (filter.category !== "all" && course.category !== filter.category) {
        return false;
      }
      return true;
    });
  };

  const getFilteredItems = () => {
    return items.filter((item) => {
      // Apply category filter
      if (
        filter.category !== "all" &&
        item.category?.toLowerCase() !== filter.category
      ) {
        return false;
      }

      // Apply color filter
      if (
        filter.color.length > 0 &&
        (!item.color || !filter.color.includes(item.color.toLowerCase()))
      ) {
        return false;
      }

      // Apply material filter
      if (
        filter.material.length > 0 &&
        (!item.material ||
          !filter.material.includes(item.material.toLowerCase()))
      ) {
        return false;
      }

      // Apply size filter
      if (
        filter.size.length > 0 &&
        (!item.size || !filter.size.includes(item.size))
      ) {
        return false;
      }

      // Apply price filter
      if (
        item.price &&
        (item.price < filter.price.range[0] ||
          item.price > filter.price.range[1])
      ) {
        return false;
      }

      return true;
    });
  };

  const filteredCourses = getFilteredCourses();
  const filteredItems = getFilteredItems();

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

      {/* Items Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Items</h2>
        {filteredItems.length === 0 ? (
          <p>No items available.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <div key={item._id} className="bg-white shadow rounded-lg p-4">
                {editingItem && editingItem._id === item._id ? (
                  <EditItemForm
                    initialItem={editingItem}
                    onSave={handleSaveItem}
                    onCancel={handleCancelItem}
                    onDelete={handleDeleteItem}
                  />
                ) : (
                  <ItemCard item={item} onEdit={handleEditItem} />
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default ProductList;
