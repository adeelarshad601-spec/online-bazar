import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";

import {
  createProductSchema,
  updateProductSchema,
  updateProductStatusSchema,
} from "../validators/product.validator.js";

import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  updateProductStatus,
  getAdminProducts,
  getSellerProducts,
  getSellerProductById,
} from "../services/product.service.js";

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
      createProductSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationResult.error.issues,
      });
    }

    const product = await createProduct(
      validationResult.data,
      req.user.userId,
      req.user.role
    );

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "SKU already exists"
    ) {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }

    if (
      error instanceof Error &&
      error.message === "Slug already exists"
    ) {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }

    if (
      error instanceof Error &&
      error.message === "Seller shop not found"
    ) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Create product error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

// get all products controller
export const getAll = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const products = await getProducts();

    return res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      data: products,
    });
  } catch (error) {
    console.error("Get products error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

//get single product controller
export const getOne = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const product = await getProductById(
      req.params.id
    );

    return res.status(200).json({
      success: true,
      message: "Product fetched successfully",
      data: product,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Product not found"
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

//update product controller
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
      updateProductSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationResult.error.issues,
      });
    }

    const product = await updateProduct(
      req.params.id,
      req.user.userId,
      req.user.role,
      validationResult.data
    );

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Product not found"
    ) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    if (
      error instanceof Error &&
      error.message === "Access denied"
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

//delete product controller
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

    await deleteProduct(
      req.params.id,
      req.user.userId,
      req.user.role
    );

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Product not found"
    ) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    if (
      error instanceof Error &&
      error.message === "Access denied"
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

//status update controller
export const changeStatus = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const validationResult =
      updateProductStatusSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationResult.error.issues,
      });
    }

    const product = await updateProductStatus(
      req.params.id,
      validationResult.data.status,
      validationResult.data.feedback
    );

    return res.status(200).json({
      success: true,
      message: "Product status updated successfully",
      data: product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const getAllForAdmin = async (_req: AuthRequest, res: Response) => {
  try {
    const products = await getAdminProducts();
    return res.status(200).json({
      success: true,
      message: "All products fetched successfully",
      data: products,
    });
  } catch (error) {
    console.error("Get admin products error:", error);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

export const getAllForSeller = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const products = await getSellerProducts(req.user.userId);
    return res.status(200).json({ success: true, message: "Seller products fetched successfully", data: products });
  } catch (error) {
    console.error("Get seller products error:", error);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

export const getOneForSeller = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const product = await getSellerProductById(req.params.id, req.user.userId);
    return res.status(200).json({ success: true, message: "Seller product fetched successfully", data: product });
  } catch (error) {
    if (error instanceof Error && error.message === "Product not found") {
      return res.status(404).json({ success: false, message: error.message });
    }

    console.error("Get seller product error:", error);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};