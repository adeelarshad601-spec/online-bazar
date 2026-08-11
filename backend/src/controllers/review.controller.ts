import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import {
  createReviewSchema,
  reviewIdParamSchema,
  productIdParamSchema,
  updateReviewSchema,
  paginationQuerySchema,
} from "../validators/review.validator.js";
import {
  createReview,
  getProductReviews,
  getReviewById,
  updateReview,
  deleteReview,
} from "../services/review.service.js";

export const createReviewController = async (req: AuthRequest, res: Response) => {
  try {
    const validationResult = createReviewSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationResult.error.issues,
      });
    }

    const review = await createReview(req.user!.userId, validationResult.data);

    return res.status(201).json({
      success: true,
      message: "Review created successfully",
      data: review,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Product not found") {
        return res.status(404).json({ success: false, message: error.message });
      }
      if (error.message === "Review already exists for this product") {
        return res.status(409).json({ success: false, message: error.message });
      }
      if (error.message === "You must purchase this product before reviewing it") {
        return res.status(403).json({ success: false, message: error.message });
      }
      if (error.message === "Product is not available for review") {
        return res.status(400).json({ success: false, message: error.message });
      }
    }

    console.error("Create review error:", error);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

export const getProductReviewsController = async (req: AuthRequest, res: Response) => {
  try {
    const paramsResult = productIdParamSchema.safeParse(req.params);
    const queryResult = paginationQuerySchema.safeParse(req.query);

    if (!paramsResult.success || !queryResult.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: [
          ...(paramsResult.success ? [] : paramsResult.error.issues),
          ...(queryResult.success ? [] : queryResult.error.issues),
        ],
      });
    }

    const data = await getProductReviews(paramsResult.data.productId, queryResult.data);

    return res.status(200).json({
      success: true,
      message: "Product reviews fetched successfully",
      data,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Product not found") {
      return res.status(404).json({ success: false, message: error.message });
    }

    console.error("Get product reviews error:", error);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

export const getReviewController = async (req: AuthRequest, res: Response) => {
  try {
    const validationResult = reviewIdParamSchema.safeParse(req.params);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid review ID",
        errors: validationResult.error.issues,
      });
    }

    const review = await getReviewById(validationResult.data.id);

    return res.status(200).json({
      success: true,
      message: "Review fetched successfully",
      data: review,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Review not found") {
      return res.status(404).json({ success: false, message: error.message });
    }

    console.error("Get review error:", error);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

export const updateReviewController = async (req: AuthRequest, res: Response) => {
  try {
    const paramsResult = reviewIdParamSchema.safeParse(req.params);
    const bodyResult = updateReviewSchema.safeParse(req.body);

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

    const review = await updateReview(req.user!.userId, paramsResult.data.id, bodyResult.data);

    return res.status(200).json({
      success: true,
      message: "Review updated successfully",
      data: review,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Review not found") {
        return res.status(404).json({ success: false, message: error.message });
      }
      if (error.message === "Access denied") {
        return res.status(403).json({ success: false, message: error.message });
      }
    }

    console.error("Update review error:", error);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

export const deleteReviewController = async (req: AuthRequest, res: Response) => {
  try {
    const validationResult = reviewIdParamSchema.safeParse(req.params);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid review ID",
        errors: validationResult.error.issues,
      });
    }

    await deleteReview(req.user!.userId, req.user!.role, validationResult.data.id);

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully",
      data: {
        id: validationResult.data.id,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Review not found") {
        return res.status(404).json({ success: false, message: error.message });
      }
      if (error.message === "Access denied") {
        return res.status(403).json({ success: false, message: error.message });
      }
    }

    console.error("Delete review error:", error);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};
