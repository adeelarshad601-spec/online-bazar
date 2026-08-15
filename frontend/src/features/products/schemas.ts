import { z } from "zod";

export const categoryQuerySchema = z.object({
  search: z.string().optional(),
});

export const productFilterSchema = z.object({
  q: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().optional().default(12),
  categoryId: z.string().optional(),
  shopId: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  sort: z.enum(["newest", "price_asc", "price_desc"]).optional().default("newest"),
});
