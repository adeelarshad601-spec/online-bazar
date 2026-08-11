import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import {
  addWishlistItemSchema,
  wishlistItemProductIdParamSchema,
} from "../validators/wishlist.validator.js";
import {
  getWishlist,
  addWishlistItem,
  removeWishlistItem,
  checkWishlistItem,
  clearWishlist,
} from "../services/wishlist.service.js";

export const getWishlistController = async (req: AuthRequest, res: Response) => {
  try {
    const wishlist = await getWishlist(req.user!.userId);

    return res.status(200).json({
      success: true,
      message: "Wishlist fetched successfully",
      data: wishlist,
    });
  } catch (error) {
    console.error("Get wishlist error:", error);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

export const addWishlistItemController = async (req: AuthRequest, res: Response) => {
  try {
    const validationResult = addWishlistItemSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationResult.error.issues,
      });
    }

    const item = await addWishlistItem(req.user!.userId, validationResult.data.productId);

    return res.status(201).json({
      success: true,
      message: "Product added to wishlist successfully",
      data: item,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Product not found") {
        return res.status(404).json({ success: false, message: error.message });
      }
      if (error.message === "Product is not available") {
        return res.status(400).json({ success: false, message: error.message });
      }
      if (error.message === "Product already in wishlist") {
        return res.status(409).json({ success: false, message: error.message });
      }
    }

    console.error("Add wishlist item error:", error);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

export const removeWishlistItemController = async (req: AuthRequest, res: Response) => {
  try {
    const validationResult = wishlistItemProductIdParamSchema.safeParse(req.params);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
        errors: validationResult.error.issues,
      });
    }

    const result = await removeWishlistItem(req.user!.userId, validationResult.data.productId);

    return res.status(200).json({
      success: true,
      message: "Product removed from wishlist successfully",
      data: result,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Wishlist item not found") {
      return res.status(404).json({ success: false, message: error.message });
    }

    console.error("Remove wishlist item error:", error);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

export const checkWishlistItemController = async (req: AuthRequest, res: Response) => {
  try {
    const validationResult = wishlistItemProductIdParamSchema.safeParse(req.params);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
        errors: validationResult.error.issues,
      });
    }

    const result = await checkWishlistItem(req.user!.userId, validationResult.data.productId);

    return res.status(200).json({
      success: true,
      message: "Wishlist check completed successfully",
      data: result,
    });
  } catch (error) {
    console.error("Check wishlist item error:", error);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

export const clearWishlistController = async (req: AuthRequest, res: Response) => {
  try {
    const result = await clearWishlist(req.user!.userId);

    return res.status(200).json({
      success: true,
      message: "Wishlist cleared successfully",
      data: result,
    });
  } catch (error) {
    console.error("Clear wishlist error:", error);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};
