import { z } from "zod";

export const createReviewSchema = z.object({
  productId: z.string().uuid("Invalid product ID"),
  rating: z.coerce.number().int().min(1, "Rating must be between 1 and 5").max(5, "Rating must be between 1 and 5"),
  comment: z.string().trim().min(5, "Comment must be at least 5 characters").max(1000, "Comment must be at most 1000 characters").optional(),
});

export const updateReviewSchema = z.object({
  rating: z.coerce.number().int().min(1, "Rating must be between 1 and 5").max(5, "Rating must be between 1 and 5").optional(),
  comment: z.string().trim().min(5, "Comment must be at least 5 characters").max(1000, "Comment must be at most 1000 characters").optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: "At least one field must be provided",
});

export const reviewIdParamSchema = z.object({
  id: z.string().uuid("Invalid review ID"),
});

export const productIdParamSchema = z.object({
  productId: z.string().uuid("Invalid product ID"),
});

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
