import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import {
  adminOrdersQuerySchema,
  customerOrdersQuerySchema,
  orderIdParamSchema,
  updateOrderStatusSchema,
  updateVendorOrderStatusSchema,
  vendorOrderIdParamSchema,
  vendorOrdersQuerySchema,
} from "../validators/order.validator.js";
import {
  cancelCustomerOrder,
  getAdminOrders as getAdminOrdersService,
  getCustomerOrder,
  getCustomerOrders as getCustomerOrdersService,
  getSellerVendorOrders,
  updateAdminOrderStatus as updateAdminOrderStatusService,
  updateVendorOrderStatus as updateVendorOrderStatusService,
} from "../services/order.service.js";

export const getOrders = async (req: AuthRequest, res: Response) => {
  try {
    const validationResult = customerOrdersQuerySchema.safeParse(req.query);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid query parameters",
        errors: validationResult.error.issues,
      });
    }

    const data = await getCustomerOrdersService(req.user!.userId, validationResult.data);

    return res.status(200).json({
      success: true,
      message: "Orders fetched successfully",
      data,
    });
  } catch (error) {
    console.error("Get orders error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const getOrder = async (req: AuthRequest, res: Response) => {
  try {
    const validationResult = orderIdParamSchema.safeParse(req.params);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
        errors: validationResult.error.issues,
      });
    }

    const order = await getCustomerOrder(req.user!.userId, validationResult.data.id);

    return res.status(200).json({
      success: true,
      message: "Order fetched successfully",
      data: order,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Order not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Get order error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const cancelOrder = async (req: AuthRequest, res: Response) => {
  try {
    const validationResult = orderIdParamSchema.safeParse(req.params);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
        errors: validationResult.error.issues,
      });
    }

    const order = await cancelCustomerOrder(req.user!.userId, validationResult.data.id);

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      data: order,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Order not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    if (error instanceof Error && error.message === "Order cannot be cancelled at this stage") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Cancel order error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const getVendorOrders = async (req: AuthRequest, res: Response) => {
  try {
    const validationResult = vendorOrdersQuerySchema.safeParse(req.query);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid query parameters",
        errors: validationResult.error.issues,
      });
    }

    const data = await getSellerVendorOrders(req.user!.userId, validationResult.data);

    return res.status(200).json({
      success: true,
      message: "Vendor orders fetched successfully",
      data,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Seller shop not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Get vendor orders error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const updateVendorOrderStatus = async (req: AuthRequest, res: Response) => {
  try {
    const paramsResult = vendorOrderIdParamSchema.safeParse(req.params);
    const bodyResult = updateVendorOrderStatusSchema.safeParse(req.body);

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

    const data = await updateVendorOrderStatusService(
      req.user!.userId,
      paramsResult.data.id,
      bodyResult.data
    );

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Vendor order not found") {
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

    console.error("Update vendor order status error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const getAdminOrders = async (req: AuthRequest, res: Response) => {
  try {
    const validationResult = adminOrdersQuerySchema.safeParse(req.query);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid query parameters",
        errors: validationResult.error.issues,
      });
    }

    const data = await getAdminOrdersService(validationResult.data);

    return res.status(200).json({
      success: true,
      message: "Orders fetched successfully",
      data,
    });
  } catch (error) {
    console.error("Get admin orders error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const updateAdminOrderStatus = async (req: AuthRequest, res: Response) => {
  try {
    const paramsResult = orderIdParamSchema.safeParse(req.params);
    const bodyResult = updateOrderStatusSchema.safeParse(req.body);

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

    const data = await updateAdminOrderStatusService(paramsResult.data.id, bodyResult.data);

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Order not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Update admin order status error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};
