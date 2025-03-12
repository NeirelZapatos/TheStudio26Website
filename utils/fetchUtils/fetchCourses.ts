import { fetchCourse } from '@/utils/fetchUtils/fetchCourse'; // Import the fetchCourse utility function
import { ICourse } from '@/app/models/Course'; // Import the ICourse interface from the Course model
import { Types } from 'mongoose'; // Import Types from mongoose for ObjectId handling

// Fetch courses for an order
export const fetchCourses = async (courseIds: Types.ObjectId[]): Promise<ICourse[]> => {
  const courses = await Promise.all(
    courseIds.map(async (courseId) => {
      return fetchCourse(courseId.toString()); // Fetch course details
    })
  );

  return courses.filter((c): c is ICourse => c !== null); // Filter out null courses
};