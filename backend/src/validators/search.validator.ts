import { z } from "zod";

export const productSearchSchema = z.object({
  q: z.string().min(1).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
  categoryId: z.string().uuid().optional(),
  shopId: z.string().uuid().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  sort: z.string().optional(),
});

export const suggestionSchema = z.object({
  q: z.string().min(2),
});

export type ProductSearchQuery = z.infer<typeof productSearchSchema>;
