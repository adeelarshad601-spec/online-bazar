import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import {
  paymentIdParamSchema,
  paymentOrderIdParamSchema,
  updatePaymentStatusSchema,
} from "../validators/payment.validator.js";
import {
  getPaymentById,
  getPaymentByOrderId,
  updatePaymentStatus,
} from "../services/payment.service.js";

export const getPaymentForOrder = async (req: AuthRequest, res: Response) => {
  try {
    const paramsResult = paymentOrderIdParamSchema.safeParse(req.params);

    if (!paramsResult.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
        errors: paramsResult.error.issues,
      });
    }

    const payment = await getPaymentByOrderId(
      req.user!.userId,
      req.user!.role,
      paramsResult.data.orderId
    );

    return res.status(200).json({
      success: true,
      message: "Payment fetched successfully",
      data: payment,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Payment not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    if (error instanceof Error && error.message === "Access denied") {
      return res.status(403).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Get payment by order error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const getPayment = async (req: AuthRequest, res: Response) => {
  try {
    const paramsResult = paymentIdParamSchema.safeParse(req.params);

    if (!paramsResult.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment ID",
        errors: paramsResult.error.issues,
      });
    }

    const payment = await getPaymentById(
      req.user!.userId,
      req.user!.role,
      paramsResult.data.id
    );

    return res.status(200).json({
      success: true,
      message: "Payment fetched successfully",
      data: payment,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Payment not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    if (error instanceof Error && error.message === "Access denied") {
      return res.status(403).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Get payment by ID error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const updatePaymentStatusController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const paramsResult = paymentIdParamSchema.safeParse(req.params);
    const bodyResult = updatePaymentStatusSchema.safeParse(req.body);

    if (!paramsResult.success || !bodyResult.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: [
          ...(paramsResult.success ? [] : paramsResult.error.issues),
          ...(bodyResult.success ? [] : bodyResult.error.issues),
        ],
      });
    }

    const payment = await updatePaymentStatus(
      paramsResult.data.id,
      bodyResult.data
    );

    return res.status(200).json({
      success: true,
      message: "Payment status updated successfully",
      data: payment,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Payment not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    if (error instanceof Error && error.message === "Access denied") {
      return res.status(403).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Update payment status error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};
