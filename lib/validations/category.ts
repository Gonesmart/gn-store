import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must be lowercase letters, numbers, and hyphens only"
    ),
  description: z.string().optional(),
  parentId: z.string().optional(),
  image: z.string().optional(),
  imagePublicId: z.string().optional(),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;
