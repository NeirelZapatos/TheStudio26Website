import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from "@/app/lib/dbConnect";
import Course from "@/app/models/Course"; 

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  try {
    const courses = await Course.find({});
    
    console.log("Courses fetched:", courses);

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(courses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching courses' });
  }
}