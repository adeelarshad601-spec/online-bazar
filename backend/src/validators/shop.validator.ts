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

  logo: z
    .string()
    .trim()
    .refine(
      (val) => {
        // Accept valid URLs or base64 data URIs
        if (val.startsWith("data:")) return true; // data:image/...;base64,...
        try {
          new URL(val);
          return true;
        } catch {
          return false;
        }
      },
      "Logo must be a valid URL or image file"
    )
    .optional(),

  banner: z
    .string()
    .trim()
    .refine(
      (val) => {
        // Accept valid URLs or base64 data URIs
        if (val.startsWith("data:")) return true; // data:image/...;base64,...
        try {
          new URL(val);
          return true;
        } catch {
          return false;
        }
      },
      "Banner must be a valid URL or image file"
    )
    .optional(),

  description: z.string().trim().max(500, "Description is too long").optional(),
  pickupAddress: z.string().trim().max(255).optional().nullable(),
  pickupCity: z.string().trim().max(100).optional().nullable(),
  pickupState: z.string().trim().max(100).optional().nullable(),
  pickupCountry: z.string().trim().max(100).optional().nullable(),
  pickupPostalCode: z.string().trim().max(20).optional().nullable(),
});

export const updateShopSchema = createShopSchema.partial();

export const shopSearchSchema = z.object({
  search: z.string().trim().max(100).optional(),
  categoryId: z.string().uuid().optional(),
});

export type CreateShopInput = z.infer<typeof createShopSchema>;
export type UpdateShopInput = z.infer<typeof updateShopSchema>;
export type ShopSearchInput = z.infer<typeof shopSearchSchema>;
