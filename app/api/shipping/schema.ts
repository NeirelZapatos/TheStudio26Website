import { z } from 'zod';
import mongoose from 'mongoose';

// Validate MongoDB ObjectId
enum DistanceUnitEnum {
    IN = 'in',
    CM = 'cm'
  }
  
  enum WeightUnitEnum {
    LB = 'lb',
    KG = 'kg',
    G = 'g',
    OZ = 'oz'
  }
  
  const objectIdSchema = z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
      message: "Invalid ObjectId",
  });
  
  // Address schema
  const addressSchema = z.object({
      name: z.string().min(1, { message: "Name is required" }),
      company: z.string().optional(),
      street1: z.string().min(1, { message: "Street address is required" }),
      street2: z.string().optional(),
      city: z.string().min(1, { message: "City is required" }),
      state: z.string().length(2, { message: "State must be a 2-letter code" }),
      zip: z.string().min(1, { message: "ZIP code is required" }),
      country: z.string().length(2, { message: "Country must be a 2-letter code" }),
      phone: z.string().optional(),
      email: z.string().email({ message: "Invalid email address" }).optional(),
  });
  
  // Updated Parcel schema with enums
  const parcelSchema = z.object({
      length: z.number().or(z.string()).transform(Number).refine(val => val > 0, { message: "Length must be a positive number" }),
      width: z.number().or(z.string()).transform(Number).refine(val => val > 0, { message: "Width must be a positive number" }),
      height: z.number().or(z.string()).transform(Number).refine(val => val > 0, { message: "Height must be a positive number" }),
      distance_unit: z.nativeEnum(DistanceUnitEnum),
      weight: z.number().or(z.string()).transform(Number).refine(val => val > 0, { message: "Weight must be a positive number" }),
      mass_unit: z.nativeEnum(WeightUnitEnum),
      metadata: z.string().optional()
  });
  
  // Shipment schema
  const shipmentSchema = z.object({
      carrier_account: z.string().min(1, { message: "Carrier account is required" }),
      servicelevel_token: z.string().min(1, { message: "Service level token is required" }),
      label_file_type: z.enum(['PDF', 'PDF_4x6', 'PNG']).default('PDF_4x6'),
      metadata: z.record(z.any()).optional(),
  });
  
  // Main schema
  const schema = z.object({
      order_id: objectIdSchema,
      address_from: addressSchema,
      address_to: addressSchema,
      parcel: parcelSchema,
      shipment: shipmentSchema,
  });
  
  export default schema;