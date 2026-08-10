import { z } from "zod";

export const createShopSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters long")
    .max(100, "Name must not exceed 100 characters"),

  slug: z
    .string()
    .trim()
    .min(2, "Slug is required")
    .max(100, "Slug is too long")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must contain lowercase letters, numbers and hyphens only"
    ),

  logo: z.string().trim().url("Logo must be a valid URL").optional(),
  banner: z.string().trim().url("Banner must be a valid URL").optional(),
  description: z.string().trim().max(500, "Description is too long").optional(),
});

export const updateShopSchema = createShopSchema.partial();

export type CreateShopInput = z.infer<typeof createShopSchema>;
export type UpdateShopInput = z.infer<typeof updateShopSchema>;
