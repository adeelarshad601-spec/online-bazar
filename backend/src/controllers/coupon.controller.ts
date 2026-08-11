import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import {
  createCouponSchema,
  updateCouponSchema,
  couponIdParamSchema,
  validateCouponSchema,
  couponPaginationSchema,
} from "../validators/coupon.validator.js";
import {
  createCoupon,
  getCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
} from "../services/coupon.service.js";

export const createCouponController = async (req: AuthRequest, res: Response) => {
  try {
    const validationResult = createCouponSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationResult.error.issues,
      });
    }

    const coupon = await createCoupon(validationResult.data);

    return res.status(201).json({
      success: true,
      message: "Coupon created successfully",
      data: coupon,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Coupon code already exists") {
      return res.status(409).json({ success: false, message: error.message });
    }

    console.error("Create coupon error:", error);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

export const getCouponsController = async (req: AuthRequest, res: Response) => {
  try {
    const validationResult = couponPaginationSchema.safeParse(req.query);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationResult.error.issues,
      });
    }

    const data = await getCoupons(validationResult.data);

    return res.status(200).json({
      success: true,
      message: "Coupons fetched successfully",
      data,
    });
  } catch (error) {
    console.error("Get coupons error:", error);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

export const getCouponController = async (req: AuthRequest, res: Response) => {
  try {
    const validationResult = couponIdParamSchema.safeParse(req.params);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid coupon ID",
        errors: validationResult.error.issues,
      });
    }

    const coupon = await getCouponById(validationResult.data.id);

    return res.status(200).json({
      success: true,
      message: "Coupon fetched successfully",
      data: coupon,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Coupon not found") {
      return res.status(404).json({ success: false, message: error.message });
    }

    console.error("Get coupon error:", error);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

export const updateCouponController = async (req: AuthRequest, res: Response) => {
  try {
    const paramsResult = couponIdParamSchema.safeParse(req.params);
    const bodyResult = updateCouponSchema.safeParse(req.body);

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

    const coupon = await updateCoupon(paramsResult.data.id, bodyResult.data);

    return res.status(200).json({
      success: true,
      message: "Coupon updated successfully",
      data: coupon,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Coupon not found") {
        return res.status(404).json({ success: false, message: error.message });
      }
      if (error.message === "Coupon code already exists") {
        return res.status(409).json({ success: false, message: error.message });
      }
    }

    console.error("Update coupon error:", error);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

export const deleteCouponController = async (req: AuthRequest, res: Response) => {
  try {
    const validationResult = couponIdParamSchema.safeParse(req.params);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid coupon ID",
        errors: validationResult.error.issues,
      });
    }

    const result = await deleteCoupon(validationResult.data.id);

    return res.status(200).json({
      success: true,
      message: "Coupon deleted successfully",
      data: result,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Coupon not found") {
      return res.status(404).json({ success: false, message: error.message });
    }

    console.error("Delete coupon error:", error);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

export const validateCouponController = async (req: AuthRequest, res: Response) => {
  try {
    const validationResult = validateCouponSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationResult.error.issues,
      });
    }

    const data = await validateCoupon(req.user!.userId, validationResult.data);

    return res.status(200).json({
      success: true,
      message: "Coupon validated successfully",
      data,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Coupon not found") {
        return res.status(404).json({ success: false, message: error.message });
      }
      if (
        error.message === "Coupon is not active" ||
        error.message === "Coupon has expired" ||
        error.message === "Coupon usage limit exceeded" ||
        error.message === "Order amount does not meet minimum requirement"
      ) {
        return res.status(400).json({ success: false, message: error.message });
      }
    }

    console.error("Validate coupon error:", error);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};
