import { z } from 'zod';
import mongoose from 'mongoose';

const objectIdSchema = z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: "Invalid ObjectId",
});

const addressSchema = z.object({
    name: z.string().min(1),
    company: z.string().optional(),
    street1: z.string().min(1),
    street2: z.string().optional(),
    city: z.string().min(1),
    state: z.string().length(2),
    zip: z.string().min(1),
    country: z.string().length(2),
    phone: z.string().optional(),
    email: z.string().email().optional()
});

const parcelSchema = z.object({
    length: z.number().positive(),
    width: z.number().positive(),
    height: z.number().positive(),
    distance_unit: z.enum(['in', 'cm']).default('in'),
    weight: z.number().positive(),
    mass_unit: z.enum(['lb', 'kg']).default('lb')
});

const shipmentSchema = z.object({
    carrier_account: z.string().min(1),
    servicelevel_token: z.string().min(1),
    label_file_type: z.enum(['pdf', 'png']).default('pdf'),
    metadata: z.record(z.any()).optional()
});

const schema = z.object({
    order_id: objectIdSchema,
    address_from: addressSchema,
    address_to: addressSchema,
    parcel: parcelSchema,
    shipment: shipmentSchema
});

export default schema;