import { z } from "zod";

const orderStatusEnum = z.enum([
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
]);

const paymentStatusEnum = z.enum([
  "PENDING",
  "COMPLETED",
  "FAILED",
  "REFUNDED",
]);

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
});

export const customerOrdersQuerySchema = paginationQuerySchema;
export const vendorOrdersQuerySchema = z.object({
  status: orderStatusEnum.optional(),
});

export const adminOrdersQuerySchema = paginationQuerySchema.extend({
  status: orderStatusEnum.optional(),
  paymentStatus: paymentStatusEnum.optional(),
});

export const orderIdParamSchema = z.object({
  id: z.string().uuid("Invalid order ID"),
});

export const vendorOrderIdParamSchema = z.object({
  id: z.string().uuid("Invalid vendor order ID"),
});

export const updateOrderStatusSchema = z.object({
  status: orderStatusEnum,
});

export const updateVendorOrderStatusSchema = z.object({
  status: orderStatusEnum,
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
export type VendorOrdersQuery = z.infer<typeof vendorOrdersQuerySchema>;
export type AdminOrdersQuery = z.infer<typeof adminOrdersQuerySchema>;
export type StatusUpdateInput = z.infer<typeof updateOrderStatusSchema>;
export type VendorOrderStatusUpdateInput = z.infer<typeof updateVendorOrderStatusSchema>;
