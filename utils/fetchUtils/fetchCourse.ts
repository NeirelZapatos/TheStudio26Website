import { ICourse } from '@/app/models/Course'; // Import the ICourse interface from the Course model

// Fetch a single course by ID
export const fetchCourse = async (courseId: string): Promise<ICourse> => {
  const response = await fetch(`/api/courses/${courseId}`); // Fetch course data from the API
  if (!response.ok) throw new Error(`Failed to fetch course: ${courseId}`); // Throw an error if the response is not OK
  return response.json(); // Return the parsed JSON response
};