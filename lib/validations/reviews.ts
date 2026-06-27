import { z } from "zod";

export const reviewSchema = z.object({
  productId: z.string().cuid("Invalid product ID"),
  rating: z.number().int().min(1, "Rating is required").max(5),
  title: z.string().max(100, "Title too long").optional(),
  body: z
    .string()
    .min(10, "Review must be at least 10 characters")
    .max(1000, "Review must be under 1000 characters"),
});

export type ReviewInput = z.infer<typeof reviewSchema>;
