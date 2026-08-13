import { z } from "zod";

// ==========================================
// SELLER PLAN VALIDATORS
// ==========================================

export const createSellerPlanSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Plan name is required")
    .max(50, "Plan name must not exceed 50 characters"),

  description: z
    .string()
    .trim()
    .max(500, "Description must not exceed 500 characters")
    .optional()
    .nullable(),

  price: z
    .number()
    .positive("Price must be a positive number")
    .or(z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid price format").transform(Number)),

  maxProducts: z
    .number()
    .int("Max products must be an integer")
    .positive("Max products must be positive")
    .optional()
    .nullable(),

  commissionRate: z
    .number()
    .min(0, "Commission rate cannot be negative")
    .max(100, "Commission rate cannot exceed 100")
    .or(z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid commission rate format").transform(Number)),

  isActive: z
    .boolean()
    .optional()
    .default(true),
});

export type CreateSellerPlanInput = z.infer<typeof createSellerPlanSchema>;

export const updateSellerPlanSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Plan name is required")
    .max(50, "Plan name must not exceed 50 characters")
    .optional(),

  description: z
    .string()
    .trim()
    .max(500, "Description must not exceed 500 characters")
    .optional()
    .nullable(),

  price: z
    .number()
    .positive("Price must be a positive number")
    .or(z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid price format").transform(Number))
    .optional(),

  maxProducts: z
    .number()
    .int("Max products must be an integer")
    .positive("Max products must be positive")
    .optional()
    .nullable(),

  commissionRate: z
    .number()
    .min(0, "Commission rate cannot be negative")
    .max(100, "Commission rate cannot exceed 100")
    .or(z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid commission rate format").transform(Number))
    .optional(),

  isActive: z
    .boolean()
    .optional(),
});

export type UpdateSellerPlanInput = z.infer<typeof updateSellerPlanSchema>;

export const getSellerPlansQuerySchema = z.object({
  page: z
    .number()
    .int()
    .positive()
    .optional()
    .or(z.string().regex(/^\d+$/, "Page must be a number").transform(Number)),

  limit: z
    .number()
    .int()
    .positive()
    .optional()
    .or(z.string().regex(/^\d+$/, "Limit must be a number").transform(Number)),

  isActive: z
    .boolean()
    .optional()
    .or(z.string().transform(val => val === "true")),
});

export type GetSellerPlansQuery = z.infer<typeof getSellerPlansQuerySchema>;

// ==========================================
// SELLER SUBSCRIPTION VALIDATORS
// ==========================================

export const createSellerSubscriptionSchema = z.object({
  planId: z
    .string()
    .trim()
    .min(1, "Plan ID is required"),

  startedAt: z
    .string()
    .datetime("Invalid start date format")
    .optional(),
});

export type CreateSellerSubscriptionInput = z.infer<typeof createSellerSubscriptionSchema>;

export const getSellerSubscriptionsQuerySchema = z.object({
  page: z
    .number()
    .int()
    .positive()
    .optional()
    .or(z.string().regex(/^\d+$/, "Page must be a number").transform(Number)),

  limit: z
    .number()
    .int()
    .positive()
    .optional()
    .or(z.string().regex(/^\d+$/, "Limit must be a number").transform(Number)),

  isActive: z
    .boolean()
    .optional()
    .or(z.string().transform(val => val === "true")),
});

export type GetSellerSubscriptionsQuery = z.infer<typeof getSellerSubscriptionsQuerySchema>;
