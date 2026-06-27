import { z } from "zod";

export const shippingSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Enter a valid email address"),
  phone: z
    .string()
    .min(10, "Enter a valid phone number")
    .max(15, "Phone number too long")
    .regex(/^[\d+\-\s()]+$/, "Enter a valid phone number"),
  addressLine1: z.string().min(5, "Street address is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  country: z.string().min(1, "Country is required"),
});

export type ShippingFormData = z.infer<typeof shippingSchema>;
