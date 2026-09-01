import { z } from "zod";

export const shippingAddressSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  phone: z.string().min(5, "Phone number is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required"),
});

export const checkoutSchema = z.object({
  shippingAddress: shippingAddressSchema,
  paymentMethod: z.enum(["COD", "STRIPE", "CARD"]),
  couponCode: z.string().trim().min(1, "Coupon code must not be empty").nullable().optional(),
  buyNowItem: z
    .object({
      productId: z.string().min(1),
      variantId: z.string().optional().nullable(),
      quantity: z.number().int().positive().default(1),
    })
    .optional()
    .nullable(),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
