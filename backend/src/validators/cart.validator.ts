import { z } from "zod";

export const addCartItemSchema = z.object({
  productId: z.string().uuid("Invalid product ID"),
  variantId: z.string().uuid("Invalid variant ID").optional(),
  quantity: z
    .number()
    .int("Quantity must be an integer")
    .positive("Quantity must be greater than zero"),
});

export const updateCartItemQuantitySchema = z.object({
  quantity: z
    .number()
    .int("Quantity must be an integer")
    .positive("Quantity must be greater than zero"),
});

export const cartItemIdParamSchema = z.object({
  id: z.string().uuid("Invalid cart item ID"),
});

export type AddCartItemInput = z.infer<typeof addCartItemSchema>;
export type UpdateCartItemQuantityInput = z.infer<
  typeof updateCartItemQuantitySchema
>;
