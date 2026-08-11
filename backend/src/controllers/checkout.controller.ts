import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { checkoutSchema } from "../validators/checkout.validator.js";
import { processCheckout } from "../services/checkout.service.js";

export const checkout = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const validationResult = checkoutSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationResult.error.issues,
      });
    }

    const order = await processCheckout(req.user.userId, validationResult.data);

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: order,
    });
  } catch (error) {
    if (error instanceof Error) {
      const badRequestErrors = [
        "Cart is empty",
        "Product not found",
        "Product is not available",
        "Product is out of stock",
        "Variant not found",
        "Variant does not belong to product",
        "Variant is not available",
        "Variant is out of stock",
        "Coupon not found",
        "Coupon is not active",
        "Coupon has expired",
        "Coupon has reached its usage limit",
        "Order total does not meet coupon minimum amount",
        "Coupon code must not be empty",
        "Coupon code is required",
      ];

      if (badRequestErrors.includes(error.message)) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      if (error.message === "Unauthorized cart access") {
        return res.status(403).json({
          success: false,
          message: error.message,
        });
      }
    }

    console.error("Checkout error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};
