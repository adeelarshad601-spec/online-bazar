import { z } from "zod";

export const productVariantSchema = z.object({
  id: z.string().uuid("Invalid variant ID").optional(),
  name: z.string().trim().min(1, "Variant name is required").max(150, "Variant name is too long").optional(),
  sku: z.string().trim().min(2, "Variant SKU is required").max(100, "Variant SKU is too long").optional(),
  price: z.coerce.number().positive("Variant price must be greater than 0").nullable().optional(),
  stock: z.coerce.number().int().min(0, "Variant stock cannot be negative").optional(),
  options: z.record(z.string(), z.any()).optional(),
});

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

  weight: z.coerce.number().min(0, "Weight cannot be negative").optional().nullable(),
  length: z.coerce.number().min(0, "Length cannot be negative").optional().nullable(),
  width: z.coerce.number().min(0, "Width cannot be negative").optional().nullable(),
  height: z.coerce.number().min(0, "Height cannot be negative").optional().nullable(),

  shopId: z.string().uuid("Invalid shop ID"),

  categoryId: z.string().uuid("Invalid category ID"),

  images: z
    .array(
      z
        .string()
        .refine(
          (value) =>
            value.startsWith("data:image/") || /^https?:\/\//i.test(value),
          "Product images must be valid image URLs"
        )
    )
    .max(8, "You can upload up to 8 product images")
    .optional(),

  variants: z.array(productVariantSchema).optional(),
});

export const updateProductSchema = createProductSchema.partial().extend({
  variants: z.array(productVariantSchema).optional(),
});

export const updateProductStatusSchema = z.object({
  status: z.enum([
    "PENDING",
    "APPROVED",
    "REJECTED",
    "SUSPENDED",
  ]),
  feedback: z.string().trim().max(2000, "Feedback must not exceed 2000 characters").optional(),
});

export type CreateProductInput =
  z.infer<typeof createProductSchema>;

export type UpdateProductInput =
  z.infer<typeof updateProductSchema>;

export type UpdateProductStatusInput =
  z.infer<typeof updateProductStatusSchema>;