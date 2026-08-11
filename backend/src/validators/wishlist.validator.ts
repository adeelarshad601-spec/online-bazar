import { z } from "zod";

export const addWishlistItemSchema = z.object({
  productId: z.string().uuid("Invalid product ID"),
});

export const wishlistItemProductIdParamSchema = z.object({
  productId: z.string().uuid("Invalid product ID"),
});
