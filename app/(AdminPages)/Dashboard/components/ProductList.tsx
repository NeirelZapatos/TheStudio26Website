import { useEffect, useState } from "react";
import axios from 'axios';

type Course = {
    _id: string;
    name: string;
    description: string;
    // Add as necessary
};

type Item = {
    _id: string;
    name: string;
    description: string;
    // Add as necessary
}

const ProductList: React.FC = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState<Item[]>([]);
    const [error, setError] = useState(false);

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

    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>Error fetching courses</p>;
    }
    return (
        <section className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Courses</h2>
            <ul>
                {courses.map((course) => (
                    <li key={course._id} className="border-b border-gray-200 py-4">
                        <h3 className="text-lg font-semibold">{course.name}</h3>
                        <p className="text-gray-600">{course.description}</p>
                    </li>
                ))}
            </ul>
            <h2 className="text-xl font-semibold mb-4">Items</h2>
            <ul>
                {items.map((item) => (
                    <li key={item._id} className="border-b border-gray-200 py-4">
                        <h3 className="text-lg font-semibold">{item.name}</h3>
                        <p className="text-gray-600">{item.description}</p>
                    </li>
                ))}
            </ul>
        </section>
    );
};

export default ProductList;