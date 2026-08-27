import { z } from "zod";

export const shippingAddressSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required"),
  phone: z.string().trim().min(5, "Phone number is required (at least 5 characters)"),
  address: z.string().trim().min(1, "Street address is required"),
  city: z.string().trim().min(1, "City is required"),
  postalCode: z.string().trim().min(1, "Postal code is required"),
  country: z.string().trim().min(1, "Country is required"),
});

export const checkoutSchema = z.object({
  shippingAddress: shippingAddressSchema,
  paymentMethod: z.enum(["COD"]),
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

export type ShippingAddressInput = z.infer<typeof shippingAddressSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;

export interface CheckoutResponseData {
  id: string;
  orderNumber: string;
  totalAmount: number;
  paymentStatus: string;
  shippingAddress: ShippingAddressInput;
  vendorOrders?: any[];
  orderItems?: any[];
  payment?: {
    method: string;
    status: string;
    amount: number;
  };
  couponId?: string | null;
  createdAt: string;
}

export interface CheckoutApiResponse {
  success: boolean;
  message: string;
  data: CheckoutResponseData;
}
