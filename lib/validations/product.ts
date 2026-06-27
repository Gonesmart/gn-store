import { z } from "zod";

export const variantSchema = z.object({
  id: z.string().optional(),
  size: z.string().optional(),
  color: z.string().optional(),
  price: z.number().positive("Price must be greater than 0"),
  compareAtPrice: z.number().positive().nullable().optional(),
  stock: z.number().int().min(0, "Stock cannot be negative"),
  sku: z.string().optional(),
});

export const productImageSchema = z.object({
  id: z.string().optional(),
  url: z.string().url("Invalid image URL"),
  publicId: z.string().optional(),
  altText: z.string().optional(),
  position: z.number().int(),
});

export const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must be lowercase letters, numbers, and hyphens only"
    ),
  description: z.string().min(1, "Description is required"),
  categoryId: z.string().min(1, "Category is required"),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]),
  featured: z.boolean(),
  variants: z
    .array(variantSchema)
    .min(1, "At least one variant is required"),
  images: z.array(productImageSchema),
});

export type ProductFormValues = z.infer<typeof productSchema>;
export type VariantFormValues = z.infer<typeof variantSchema>;
export type ProductImageFormValues = z.infer<typeof productImageSchema>;
