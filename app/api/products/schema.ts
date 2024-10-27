import { z } from 'zod';
import mongoose from 'mongoose';

const schema = z.object({
    name: z.string().min(1),
    price: z.number().min(0),
    description: z.string().optional(),
    category: z.string().optional(),
    material: z.string().optional(),
    image_url: z.string().optional(),
    size: z.string().optional(),
    color: z.string().optional(),
    quantity_in_stock: z.number().min(0)
});

export default schema;