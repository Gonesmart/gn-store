import { z } from "zod";

export const couponSchema = z.object({
  code: z
    .string()
    .min(3, "Code must be at least 3 characters")
    .max(32, "Code must be 32 characters or fewer")
    .regex(/^[A-Z0-9_-]+$/, "Code must be uppercase letters, numbers, hyphens, or underscores"),
  type: z.enum(["PERCENTAGE", "FIXED"]),
  value: z.number().positive("Value must be greater than 0"),
  minOrderAmount: z.number().min(0).optional(),
  maxUses: z.number().int().positive().optional(),
  expiresAt: z.string().optional(),
  active: z.boolean().default(true),
});

export type CouponFormValues = z.infer<typeof couponSchema>;
