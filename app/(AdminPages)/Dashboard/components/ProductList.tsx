import { useEffect, useState } from "react";
import axios from 'axios';

type Course = {
    _id: string;
    name: string;
    description: string;
    price: number;
    location: string,
    recurring: boolean,
    date: string,
    time: string,
    instructor: string,
    duration: string
    // Add as necessary
};

type Item = {
    _id: string;
    name: string;
    description?: string;  // optional
    price: number;        // changed from string to number
    category?: string;    // optional
    material?: string;    // optional
    image_url?: string;   // optional
    size?: string;       // optional
    color?: string;      // optional
    purchaseType?: "Item" | "Course";  // optional enum
    itemType?: string;   // optional
    quantity_in_stock?: number;  // optional number
}

const ProductList: React.FC = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState<Item[]>([]);
    const [error, setError] = useState(false);
    const [editingCourse, setEditingCourse] = useState<Course | null>(null);
    const [editingItem, setEditingItem] = useState<Item | null>(null);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await axios.get('/api/courses');
                setCourses(response.data);
            } catch (err) {
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const response = await axios.get('/api/items');
                setItems(response.data);
            } catch (err) {
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchItems();
    }, []);

    const handleEditCourse = (course: Course) => {
        setEditingCourse(course);
    }

    const handleSaveCourse = async () => {
        if (editingCourse) {
            // Explicitly cast price to number
            const updatedCourse = {
                ...editingCourse,
                price: Number(editingCourse.price)
            };

            console.log("Updating course:", updatedCourse); // Log request data

            try {
                await axios.put(`/api/courses/${updatedCourse._id}`, updatedCourse);
                setCourses(courses.map(course => course._id === updatedCourse._id ? updatedCourse : course));
                setEditingCourse(null);
            } catch (err) {
                if (axios.isAxiosError(err)) {
                    console.error("Validation errors:", err.response?.data);
                    // Optionally show these errors to the user
                    setError(true);
                }
            }
        }
    };

    const handleEditItem = (item: Item) => {
        setEditingItem(item);
    }

    const handleSaveItem = async () => {
        if (editingItem) {
            // Explicitly cast quantity_in_stock to number -> idk why it doesn't do this on the bottom??
            const updatedItem = {
                ...editingItem,
                quantity_in_stock: Number(editingItem.quantity_in_stock)
            };

            console.log("Updating item:", updatedItem); // Log request data
            try {
                await axios.put(`/api/items/${updatedItem._id}`, updatedItem);
                setItems(items.map(item => item._id === updatedItem._id ? updatedItem : item));
                setEditingItem(null);
            } catch (err) {
                if (axios.isAxiosError(err)) {
                    console.error("Validation errors:", err.response?.data);
                    // Optionally show these errors to the user
                    setError(true);
                }
            }
        }
    };

    return (
        <section className="bg-white shadow rounded-lg p-6">
            <h2 className="text-4xl font-semibold mb-4">Courses</h2>
            <ul>
                {courses.map((course) => (
                    <li key={course._id} className="border-b border-gray-200 py-4">
                        {editingCourse && editingCourse._id === course._id ? (
                            <div>
                                <input
                                    type="text"
                                    value={editingCourse.name}
                                    onChange={(e) => setEditingCourse({ ...editingCourse, name: e.target.value })}
                                    className="input input-bordered input-sm w-full mb-2"
                                />
                                <textarea
                                    value={editingCourse.description}
                                    onChange={(e) => setEditingCourse({ ...editingCourse, description: e.target.value })}
                                    className="textarea textarea-bordered w-full mb-2"
                                />
                                <input
                                    type="text"
                                    value={editingCourse.price}
                                    onChange={(e) => setEditingCourse({ ...editingCourse, price: parseInt(e.target.value) })}
                                    className="input input-bordered input-sm w-full mb-2"
                                />
                                <input
                                    type="text"
                                    value={editingCourse.location}
                                    onChange={(e) => setEditingCourse({ ...editingCourse, location: e.target.value })}
                                    className="input input-bordered input-sm w-full mb-2"
                                />
                                <select
                                    value={editingCourse.recurring ? 'true' : 'false'}
                                    onChange={(e) => setEditingCourse({ ...editingCourse, recurring: e.target.value === 'true' })}
                                    className="select select-bordered select-sm w-full mb-2"
                                >
                                    <option value="true">Recurring</option>
                                    <option value="false">One-Time</option>
                                </select>
                                <input
                                    type="date"
                                    value={editingCourse.date}
                                    onChange={(e) => setEditingCourse({ ...editingCourse, date: e.target.value })}
                                    className="input input-bordered input-sm w-full mb-2"
                                />
                                <input
                                    type="time"
                                    value={editingCourse.time}
                                    onChange={(e) => setEditingCourse({ ...editingCourse, time: e.target.value })}
                                    className="input input-bordered input-sm w-full mb-2"
                                />
                                <input
                                    type="text"
                                    value={editingCourse.instructor}
                                    onChange={(e) => setEditingCourse({ ...editingCourse, instructor: e.target.value })}
                                    className="input input-bordered input-sm w-full mb-2"
                                />
                                <input
                                    type="text"
                                    value={editingCourse.duration}
                                    onChange={(e) => setEditingCourse({ ...editingCourse, duration: e.target.value })}
                                    className="input input-bordered input-sm w-full mb-2"
                                />
                                <button onClick={handleSaveCourse} className="btn btn-primary btn-sm">Save</button>
                                <button onClick={() => setEditingCourse(null)} className="btn btn-secondary btn-sm ml-2">Cancel</button>
                            </div>
                        ) : (
                            <div>
                                <h3 className="text-xl font-semibold">{course.name}</h3>
                                <p className="text-gray-600">{course.description}</p>
                                <p className="text-gray-600">Price: {course.price}</p>
                                <p className="text-gray-600">Location: {course.location}</p>
                                <p className="text-gray-600">Purchase Type: {course.recurring ? 'Recurring' : 'One-Time'}</p>
                                <p className="text-gray-600">Date: {course.date}</p>
                                <p className="text-gray-600">Time: {course.time}</p>
                                <p className="text-gray-600">Instructor: {course.instructor}</p>
                                <p className="text-gray-600">Duration: {course.duration} minutes</p>
                                <button onClick={() => handleEditCourse(course)} className="btn btn-primary btn-sm">Edit</button>
                            </div>
                        )}
                    </li>
                ))}
            </ul>
            <h2 className="text-4xl font-semibold mb-4">Items</h2>
            <ul>
                {items.map((item) => (
                    <li key={item._id} className="border-b border-gray-200 py-4">
                        {editingItem && editingItem._id === item._id ? (
                            <div>
                                <input
                                    type="text"
                                    value={editingItem.name}
                                    onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                                    className="input input-bordered input-sm w-full mb-2"
                                />
                                <input
                                    type="text"
                                    value={editingItem.description}
                                    onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                                    className="input input-bordered input-sm w-full mb-2"
                                />
                                <input
                                    type="number"
                                    value={editingItem.price}
                                    onChange={(e) => setEditingItem({ ...editingItem, price: parseFloat(e.target.value) || 0 })}
                                    className="input input-bordered input-sm w-full mb-2"
                                />
                                <input
                                    type="text"
                                    value={editingItem.category}
                                    onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                                    className="input input-bordered input-sm w-full mb-2"
                                />
                                {/* <input
                                    type="number"
                                    value={editingItem.ringSize}
                                    onChange={(e) => setEditingItem({ ...editingItem, ringSize: e.target.value })}
                                    className="input input-bordered input-sm w-full mb-2"
                                /> */}
                                <input
                                    type="number"
                                    value={editingItem.quantity_in_stock}
                                    onChange={(e) => setEditingItem({ ...editingItem, quantity_in_stock: parseInt(e.target.value) || 0 })}
                                    className="input input-bordered input-sm w-full mb-2"
                                />
                                <button onClick={handleSaveItem} className="btn btn-primary btn-sm">Save</button>
                                <button onClick={() => setEditingItem(null)} className="btn btn-secondary btn-sm ml-2">Cancel</button>

                            </div>

                        ) : (
                            <div>
                                <h3 className="text-lg font-semibold">{item.name}</h3>
                                <p className="text-gray-600">Description: {item.description}</p>
                                <p className="text-gray-600">Price: {item.price}</p>
                                <p className="text-gray-600">Category: {item.category}</p>
                                {/* <p className="text-gray-600">Ring Size: {item.ringSize}</p> */}
                                <p className="text-gray-600">Quantity: {item.quantity_in_stock}</p>
                                <button onClick={() => handleEditItem(item)} className="btn btn-primary btn-sm">Edit</button>
                            </div>
                        )}

                    </li>
                ))}
            </ul>
        </section>
    );
};

export default ProductList;