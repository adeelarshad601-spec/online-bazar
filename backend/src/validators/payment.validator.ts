import { z } from "zod";

const paymentStatusEnum = z.enum(["PENDING", "COMPLETED", "FAILED", "REFUNDED"]);

export const paymentIdParamSchema = z.object({
  id: z.string().uuid("Invalid payment ID"),
});

export const paymentOrderIdParamSchema = z.object({
  orderId: z.string().uuid("Invalid order ID"),
});

export const updatePaymentStatusSchema = z.object({
  status: paymentStatusEnum,
});

export const processTestPaymentSchema = z.object({
  action: z.enum(["SUCCESS", "FAILED"]),
});

export type PaymentStatusUpdateInput = z.infer<typeof updatePaymentStatusSchema>;
export type ProcessTestPaymentInput = z.infer<typeof processTestPaymentSchema>;

