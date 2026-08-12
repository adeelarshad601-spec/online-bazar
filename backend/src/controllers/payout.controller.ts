import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import {
  payoutRequestSchema,
  payoutQuerySchema,
  payoutIdParamSchema,
  payoutStatusUpdateSchema,
} from "../validators/payout.validator.js";
import {
  getSellerPayoutDashboard,
  getSellerPayouts,
  getSellerPayoutById,
  requestSellerPayout,
  getAdminPayouts,
  getAdminPayoutById,
  updatePayoutStatus,
} from "../services/payout.service.js";

export const getSellerDashboard = async (req: AuthRequest, res: Response) => {
  try {
    const data = await getSellerPayoutDashboard(req.user!.userId);
    return res.status(200).json({ success: true, message: "Seller payout dashboard fetched successfully", data });
  } catch (error) {
    if (error instanceof Error && error.message === "Seller shop not found") {
      return res.status(404).json({ success: false, message: error.message });
    }
    console.error("Get seller payout dashboard error:", error);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

export const getSellerPayoutHistory = async (req: AuthRequest, res: Response) => {
  try {
    const validationResult = payoutQuerySchema.safeParse(req.query);
    if (!validationResult.success) {
      return res.status(400).json({ success: false, message: "Invalid query parameters", errors: validationResult.error.issues });
    }

    const data = await getSellerPayouts(req.user!.userId, validationResult.data);
    return res.status(200).json({ success: true, message: "Seller payouts fetched successfully", data });
  } catch (error) {
    if (error instanceof Error && error.message === "Seller shop not found") {
      return res.status(404).json({ success: false, message: error.message });
    }
    console.error("Get seller payouts error:", error);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

export const getSellerPayout = async (req: AuthRequest, res: Response) => {
  try {
    const validationResult = payoutIdParamSchema.safeParse(req.params);
    if (!validationResult.success) {
      return res.status(400).json({ success: false, message: "Invalid payout ID", errors: validationResult.error.issues });
    }

    const payout = await getSellerPayoutById(req.user!.userId, validationResult.data.id);
    return res.status(200).json({ success: true, message: "Seller payout fetched successfully", data: payout });
  } catch (error) {
    if (error instanceof Error && error.message === "Seller shop not found") {
      return res.status(404).json({ success: false, message: error.message });
    }
    if (error instanceof Error && error.message === "Payout not found") {
      return res.status(404).json({ success: false, message: error.message });
    }
    if (error instanceof Error && error.message === "Access denied") {
      return res.status(403).json({ success: false, message: error.message });
    }
    console.error("Get seller payout error:", error);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

export const requestPayout = async (req: AuthRequest, res: Response) => {
  try {
    const validationResult = payoutRequestSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ success: false, message: "Validation failed", errors: validationResult.error.issues });
    }

    const payout = await requestSellerPayout(req.user!.userId, validationResult.data);
    return res.status(201).json({ success: true, message: "Payout requested successfully", data: payout });
  } catch (error) {
    if (error instanceof Error && error.message === "Seller shop not found") {
      return res.status(404).json({ success: false, message: error.message });
    }
    if (error instanceof Error && error.message === "Requested payout exceeds available balance") {
      return res.status(409).json({ success: false, message: error.message });
    }
    console.error("Request payout error:", error);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

export const getAdminPayoutsController = async (req: AuthRequest, res: Response) => {
  try {
    const validationResult = payoutQuerySchema.safeParse(req.query);
    if (!validationResult.success) {
      return res.status(400).json({ success: false, message: "Invalid query parameters", errors: validationResult.error.issues });
    }

    const data = await getAdminPayouts(validationResult.data);
    return res.status(200).json({ success: true, message: "Payouts fetched successfully", data });
  } catch (error) {
    console.error("Get admin payouts error:", error);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

export const getAdminPayout = async (req: AuthRequest, res: Response) => {
  try {
    const validationResult = payoutIdParamSchema.safeParse(req.params);
    if (!validationResult.success) {
      return res.status(400).json({ success: false, message: "Invalid payout ID", errors: validationResult.error.issues });
    }

    const payout = await getAdminPayoutById(validationResult.data.id);
    return res.status(200).json({ success: true, message: "Payout fetched successfully", data: payout });
  } catch (error) {
    if (error instanceof Error && error.message === "Payout not found") {
      return res.status(404).json({ success: false, message: error.message });
    }
    console.error("Get admin payout error:", error);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

export const updatePayoutStatusController = async (req: AuthRequest, res: Response) => {
  try {
    const paramsResult = payoutIdParamSchema.safeParse(req.params);
    const bodyResult = payoutStatusUpdateSchema.safeParse(req.body);

    if (!paramsResult.success || !bodyResult.success) {
      return res.status(400).json({ success: false, message: "Validation failed", errors: [ ...(paramsResult.success ? [] : paramsResult.error.issues), ...(bodyResult.success ? [] : bodyResult.error.issues), ], });
    }

    const payout = await updatePayoutStatus(paramsResult.data.id, bodyResult.data);
    return res.status(200).json({ success: true, message: "Payout status updated successfully", data: payout });
  } catch (error) {
    if (error instanceof Error && error.message === "Payout not found") {
      return res.status(404).json({ success: false, message: error.message });
    }
    if (error instanceof Error && error.message === "Completed payouts cannot be updated") {
      return res.status(409).json({ success: false, message: error.message });
    }
    if (error instanceof Error && error.message === "Only pending payouts can be moved back to pending") {
      return res.status(400).json({ success: false, message: error.message });
    }
    console.error("Update payout status error:", error);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};
