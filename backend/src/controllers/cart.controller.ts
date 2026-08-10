import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import {
  addCartItemSchema,
  cartItemIdParamSchema,
  updateCartItemQuantitySchema,
} from "../validators/cart.validator.js";
import {
  getOrCreateCart,
  addItemToCart,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
} from "../services/cart.service.js";

export const getCart = async (
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

    const cart = await getOrCreateCart(req.user.userId);

    return res.status(200).json({
      success: true,
      message: "Cart fetched successfully",
      data: cart,
    });
  } catch (error) {
    console.error("Get cart error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const addItem = async (
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

    const validationResult = addCartItemSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationResult.error.issues,
      });
    }

    const cart = await addItemToCart(
      req.user.userId,
      validationResult.data.productId,
      validationResult.data.variantId,
      validationResult.data.quantity
    );

    return res.status(201).json({
      success: true,
      message: "Item added to cart successfully",
      data: cart,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      [
        "Product not found",
        "Variant not found",
        "Cart not found",
      ].includes(error.message)
    ) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    if (
      error instanceof Error &&
      [
        "Product is not available",
        "Product is out of stock",
        "Variant is not available",
        "Variant is out of stock",
        "Variant does not belong to product",
        "Quantity exceeds available stock",
      ].includes(error.message)
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Add item to cart error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const updateItem = async (
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

    const paramsResult = cartItemIdParamSchema.safeParse(req.params);
    const bodyResult = updateCartItemQuantitySchema.safeParse(req.body);

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

    const cart = await updateCartItemQuantity(
      req.user.userId,
      paramsResult.data.id,
      bodyResult.data.quantity
    );

    return res.status(200).json({
      success: true,
      message: "Cart item updated successfully",
      data: cart,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      ["Cart item not found"].includes(error.message)
    ) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    if (
      error instanceof Error &&
      [
        "Unauthorized cart item access",
        "Quantity exceeds available stock",
        "Product not found",
        "Product is not available",
        "Product is out of stock",
        "Variant not found",
        "Variant is not available",
        "Variant is out of stock",
        "Variant does not belong to product",
      ].includes(error.message)
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Update cart item error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const removeItem = async (
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

    const validationResult = cartItemIdParamSchema.safeParse(req.params);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid cart item ID",
        errors: validationResult.error.issues,
      });
    }

    const cart = await removeCartItem(
      req.user.userId,
      validationResult.data.id
    );

    return res.status(200).json({
      success: true,
      message: "Cart item removed successfully",
      data: cart,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Cart item not found"
    ) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    if (
      error instanceof Error &&
      error.message === "Unauthorized cart item access"
    ) {
      return res.status(403).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Remove cart item error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const clear = async (
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

    const cart = await clearCart(req.user.userId);

    return res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
      data: cart,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Cart not found"
    ) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Clear cart error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};
