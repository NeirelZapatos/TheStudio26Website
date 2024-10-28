import { z } from 'zod';
import mongoose from 'mongoose';

// validation for body information
const objectIdValidator = z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: "Invalid ObjectId"
})

const schema = z.object({
    first_name: z.string().min(1),
    last_name: z.string().min(1),
    email: z.string().email(),
    // password: z.string().min(5), // not required for scope
    phone_number: z.number().optional(),
    orders: z.array(objectIdValidator).optional(),
});

export default schema;