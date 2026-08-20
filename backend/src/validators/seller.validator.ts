import { z } from "zod";

export const applySellerSchema = z.object({}).optional();

export const sellerStatusFilterSchema = z.object({
  status: z
    .enum(["PENDING", "APPROVED", "REJECTED", "SUSPENDED"])
    .optional(),
});

export const sellerIdParamSchema = z.object({
  id: z.string().uuid("Invalid seller ID"),
});

export type ApplySellerInput = z.infer<typeof applySellerSchema>;
export type SellerStatusFilterInput = z.infer<
  typeof sellerStatusFilterSchema
>;
