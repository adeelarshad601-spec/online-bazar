import { z } from "zod";

const payoutStatusEnum = z.enum(["PENDING", "PROCESSING", "COMPLETED", "FAILED"]);

export const payoutRequestSchema = z.object({
  amount: z.coerce.number().positive("Invalid payout amount"),
});

export const payoutStatusUpdateSchema = z.object({
  status: payoutStatusEnum,
});

export const payoutIdParamSchema = z.object({
  id: z.string().uuid("Invalid payout ID"),
});

export const payoutQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
  status: payoutStatusEnum.optional(),
});

export type PayoutRequestInput = z.infer<typeof payoutRequestSchema>;
export type PayoutStatusUpdateInput = z.infer<typeof payoutStatusUpdateSchema>;
export type PayoutQuery = z.infer<typeof payoutQuerySchema>;
