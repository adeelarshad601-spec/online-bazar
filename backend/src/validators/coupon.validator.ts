import { z } from "zod";

const couponTypeEnum = z.enum(["PERCENTAGE", "FIXED"]);

export const createCouponSchema = z.object({
  code: z.string().trim().min(1, "Coupon code is required"),
  type: couponTypeEnum,
  value: z.coerce.number().positive("Value must be greater than zero"),
  minOrderAmount: z.coerce.number().nonnegative().optional(),
  maxDiscount: z.coerce.number().nonnegative().optional(),
  usageLimit: z.coerce.number().int().positive().optional(),
  expiresAt: z.string().datetime().optional(),
  isActive: z.boolean().optional(),
});

export const updateCouponSchema = z.object({
  code: z.string().trim().min(1, "Coupon code is required").optional(),
  type: couponTypeEnum.optional(),
  value: z.coerce.number().positive("Value must be greater than zero").optional(),
  minOrderAmount: z.coerce.number().nonnegative().optional(),
  maxDiscount: z.coerce.number().nonnegative().optional(),
  usageLimit: z.coerce.number().int().positive().optional(),
  expiresAt: z.string().datetime().optional(),
  isActive: z.boolean().optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: "At least one field must be provided",
});

export const couponIdParamSchema = z.object({
  id: z.string().uuid("Invalid coupon ID"),
});

export const validateCouponSchema = z.object({
  code: z.string().trim().min(1, "Coupon code is required"),
  orderAmount: z.coerce.number().positive("Order amount must be greater than zero"),
});

export const couponPaginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
});

export type CreateCouponInput = z.infer<typeof createCouponSchema>;
export type UpdateCouponInput = z.infer<typeof updateCouponSchema>;
export type ValidateCouponInput = z.infer<typeof validateCouponSchema>;
export type PaginationQuery = z.infer<typeof couponPaginationSchema>;
