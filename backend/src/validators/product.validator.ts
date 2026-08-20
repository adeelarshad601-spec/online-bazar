import { z } from "zod";

export const createProductSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Title must be at least 2 characters long")
    .max(150, "Title must not exceed 150 characters"),

  slug: z
    .string()
    .trim()
    .min(2, "Slug is required")
    .max(180, "Slug is too long")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must contain lowercase letters, numbers and hyphens only"
    ),

  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters long"),

  sku: z
    .string()
    .trim()
    .min(2, "SKU is required")
    .max(100, "SKU is too long"),

  price: z.coerce
    .number()
    .positive("Price must be greater than 0"),

  compareAtPrice: z.coerce
    .number()
    .positive("Compare price must be greater than 0")
    .optional(),

  stock: z.coerce
    .number()
    .int()
    .min(0, "Stock cannot be negative"),

  shopId: z.string().uuid("Invalid shop ID"),

  categoryId: z.string().uuid("Invalid category ID"),

  images: z
    .array(z.string().startsWith("data:image/", "Product images must be valid image files"))
    .max(8, "You can upload up to 8 product images")
    .optional(),
});

export const updateProductSchema = createProductSchema.partial();

export const updateProductStatusSchema = z.object({
  status: z.enum([
    "PENDING",
    "APPROVED",
    "REJECTED",
    "SUSPENDED",
  ]),
});

export type CreateProductInput =
  z.infer<typeof createProductSchema>;

export type UpdateProductInput =
  z.infer<typeof updateProductSchema>;

export type UpdateProductStatusInput =
  z.infer<typeof updateProductStatusSchema>;