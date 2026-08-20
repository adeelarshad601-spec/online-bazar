import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import {
  applySellerSchema,
  sellerIdParamSchema,
  sellerStatusFilterSchema,
} from "../validators/seller.validator.js";
import {
  applyForSeller,
  getMySellerStatus,
  getSellerApplications,
  getSellerById,
  approveSeller,
  rejectSeller,
  suspendSeller,
  reactivateSeller,
  requestSellerReactivation,
} from "../services/seller.service.js";

export const apply = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const validationResult = applySellerSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationResult.error.issues,
      });
    }

    const seller = await applyForSeller(req.user.userId);

    return res.status(201).json({
      success: true,
      message: "Seller application submitted successfully",
      data: seller,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      [
        "Seller application is already pending",
        "Seller is already approved",
        "Suspended sellers cannot reapply",
      ].includes(error.message)
    ) {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }

    if (
      error instanceof Error &&
      error.message === "Only customers can apply to become a seller"
    ) {
      return res.status(403).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Apply seller error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const getMe = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const seller = await getMySellerStatus(req.user.userId);

    return res.status(200).json({
      success: true,
      message: "Seller status fetched successfully",
      data: seller,
    });
  } catch (error) {
    console.error("Get seller status error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const requestReactivation = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    await requestSellerReactivation(req.user.userId);

    return res.status(201).json({
      success: true,
      message: "Reactivation request sent to the admin team",
      data: { requested: true },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Seller not found") {
      return res.status(404).json({ success: false, message: error.message });
    }

    if (error instanceof Error && error.message === "Only suspended sellers can request reactivation") {
      return res.status(409).json({ success: false, message: error.message });
    }

    console.error("Request seller reactivation error:", error);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

export const getAll = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const validationResult = sellerStatusFilterSchema.safeParse(
      req.query
    );

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid query parameter",
        errors: validationResult.error.issues,
      });
    }

    const sellers = await getSellerApplications(
      validationResult.data.status
    );

    return res.status(200).json({
      success: true,
      message: "Seller applications fetched successfully",
      data: sellers,
    });
  } catch (error) {
    console.error("Get seller applications error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const getOne = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const validationResult = sellerIdParamSchema.safeParse(req.params);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid seller ID",
        errors: validationResult.error.issues,
      });
    }

    const seller = await getSellerById(validationResult.data.id);

    return res.status(200).json({
      success: true,
      message: "Seller fetched successfully",
      data: seller,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Seller not found"
    ) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Get seller error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const approve = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const validationResult = sellerIdParamSchema.safeParse(req.params);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid seller ID",
        errors: validationResult.error.issues,
      });
    }

    const seller = await approveSeller(validationResult.data.id);

    return res.status(200).json({
      success: true,
      message: "Seller approved successfully",
      data: seller,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Seller not found"
    ) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    if (
      error instanceof Error &&
      [
        "Seller is already approved",
        "Only pending sellers can be approved",
      ].includes(error.message)
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Approve seller error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const reject = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const validationResult = sellerIdParamSchema.safeParse(req.params);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid seller ID",
        errors: validationResult.error.issues,
      });
    }

    const seller = await rejectSeller(validationResult.data.id);

    return res.status(200).json({
      success: true,
      message: "Seller rejected successfully",
      data: seller,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Seller not found"
    ) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    if (
      error instanceof Error &&
      error.message === "Only pending sellers can be rejected"
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Reject seller error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const suspend = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const validationResult = sellerIdParamSchema.safeParse(req.params);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid seller ID",
        errors: validationResult.error.issues,
      });
    }

    const seller = await suspendSeller(validationResult.data.id);

    return res.status(200).json({
      success: true,
      message: "Seller suspended successfully",
      data: seller,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Seller not found"
    ) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    if (
      error instanceof Error &&
      error.message === "Only approved sellers can be suspended"
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Suspend seller error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const reactivate = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const validationResult = sellerIdParamSchema.safeParse(req.params);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid seller ID",
        errors: validationResult.error.issues,
      });
    }

    const seller = await reactivateSeller(
      validationResult.data.id
    );

    return res.status(200).json({
      success: true,
      message: "Seller reactivated successfully",
      data: seller,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Seller not found"
    ) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    if (
      error instanceof Error &&
      error.message === "Only suspended sellers can be reactivated"
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Reactivate seller error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};
