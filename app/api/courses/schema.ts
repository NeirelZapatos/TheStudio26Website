import { z } from "zod";

const schema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    price: z.number().nonnegative({ message: "Price must be a non-negative number" }),
    description: z.string().optional(),
    // date: z.coerce.date({ message: "Invalid date format" }),
    date: z.string(),
    time: z.string().min(1, { message: "Time is required" }),
    duration: z.number().nonnegative().optional(),
    image_url: z.string().url().optional(),
    instructor: z.string().optional(),
    location: z.string().optional(),
    max_capacity: z.number().int().positive().optional(),
});

export default schema;