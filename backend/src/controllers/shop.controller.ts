import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import {
  createShopSchema,
  updateShopSchema,
} from "../validators/shop.validator.js";
import {
  createShop,
  getShops,
  getShopById,
  getShopBySellerId,
  updateShop,
  deleteShop,
} from "../services/shop.service.js";

export const create = async (
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

    const validationResult =
      createShopSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationResult.error.issues,
      });
    }

    const shop = await createShop(
      validationResult.data,
      req.user.userId
    );

    return res.status(201).json({
      success: true,
      message: "Shop created successfully",
      data: shop,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Seller already has a shop"
    ) {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }

    if (
      error instanceof Error &&
      (error.message === "Shop name already exists" ||
        error.message === "Shop slug already exists")
    ) {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Create shop error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const getAll = async (
  _req: AuthRequest,
  res: Response
) => {
  try {
    const shops = await getShops();

    return res.status(200).json({
      success: true,
      message: "Shops fetched successfully",
      data: shops,
    });
  } catch (error) {
    console.error("Get shops error:", error);

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
    const shop = await getShopById(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Shop fetched successfully",
      data: shop,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Shop not found"
    ) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const getMine = async (
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

    const shop = await getShopBySellerId(req.user.userId);

    return res.status(200).json({
      success: true,
      message: "Seller shop fetched successfully",
      data: shop,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Shop not found"
    ) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const update = async (
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

    const validationResult =
      updateShopSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationResult.error.issues,
      });
    }

    const shop = await updateShop(
      req.params.id,
      req.user.userId,
      req.user.role,
      validationResult.data
    );

    return res.status(200).json({
      success: true,
      message: "Shop updated successfully",
      data: shop,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Shop not found"
    ) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    if (
      error instanceof Error &&
      (error.message === "Access denied" ||
        error.message === "Shop name already exists" ||
        error.message === "Shop slug already exists")
    ) {
      return res.status(403).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const remove = async (
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

    await deleteShop(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Shop deleted successfully",
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Shop not found"
    ) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};
