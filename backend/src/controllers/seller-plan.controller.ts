import { Response } from "express";
import {
  createSellerPlanSchema,
  updateSellerPlanSchema,
  getSellerPlansQuerySchema,
  createSellerSubscriptionSchema,
  getSellerSubscriptionsQuerySchema,
} from "../validators/seller-plan.validator.js";
import {
  createSellerPlan,
  getSellerPlans,
  getSellerPlanById,
  updateSellerPlan,
  deleteSellerPlan,
  getAvailableSellerPlans,
  createSellerSubscription,
  getCurrentSellerSubscription,
  getSellerSubscriptions,
  getSellerSubscriptionById,
  cancelSellerSubscription,
  getAllSellerSubscriptions,
} from "../services/seller-plan.service.js";
import { AuthRequest } from "../middleware/auth.middleware.js";

// ==========================================
// SELLER PLAN CONTROLLERS (ADMIN ONLY)
// ==========================================

// GET /api/seller-plans
export const listSellerPlans = async (req: AuthRequest, res: Response) => {
  try {
    const validationResult = getSellerPlansQuerySchema.safeParse(req.query);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationResult.error.issues,
      });
    }

    const result = await getSellerPlans(validationResult.data);

    return res.status(200).json({
      success: true,
      message: "Seller plans retrieved successfully",
      data: result.plans,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("List seller plans error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching seller plans",
    });
  }
};

// GET /api/seller-plans/:id
export const getSellerPlan = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const plan = await getSellerPlanById(id);

    return res.status(200).json({
      success: true,
      message: "Seller plan retrieved successfully",
      data: plan,
    });
  } catch (error) {
    console.error("Get seller plan error:", error);

    if (error instanceof Error && error.message === "Seller plan not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching seller plan",
    });
  }
};

// POST /api/seller-plans
export const createPlan = async (req: AuthRequest, res: Response) => {
  try {
    const validationResult = createSellerPlanSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationResult.error.issues,
      });
    }

    const plan = await createSellerPlan(validationResult.data);

    return res.status(201).json({
      success: true,
      message: "Seller plan created successfully",
      data: plan,
    });
  } catch (error) {
    console.error("Create seller plan error:", error);

    if (
      error instanceof Error &&
      error.message === "Plan with this name already exists"
    ) {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Something went wrong while creating seller plan",
    });
  }
};

// PATCH /api/seller-plans/:id
export const updatePlan = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const validationResult = updateSellerPlanSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationResult.error.issues,
      });
    }

    const plan = await updateSellerPlan(id, validationResult.data);

    return res.status(200).json({
      success: true,
      message: "Seller plan updated successfully",
      data: plan,
    });
  } catch (error) {
    console.error("Update seller plan error:", error);

    if (error instanceof Error) {
      if (error.message === "Seller plan not found") {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      if (error.message === "Plan with this name already exists") {
        return res.status(409).json({
          success: false,
          message: error.message,
        });
      }
    }

    return res.status(500).json({
      success: false,
      message: "Something went wrong while updating seller plan",
    });
  }
};

// DELETE /api/seller-plans/:id
export const deletePlan = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await deleteSellerPlan(id);

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error("Delete seller plan error:", error);

    if (error instanceof Error) {
      if (error.message === "Seller plan not found") {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      if (error.message.includes("active subscriptions")) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
    }

    return res.status(500).json({
      success: false,
      message: "Something went wrong while deleting seller plan",
    });
  }
};

// ==========================================
// SELLER SUBSCRIPTION CONTROLLERS
// ==========================================

// GET /api/seller-plans/available (Public for sellers to see available plans)
export const getAvailablePlans = async (req: AuthRequest, res: Response) => {
  try {
    const plans = await getAvailableSellerPlans();

    return res.status(200).json({
      success: true,
      message: "Available seller plans retrieved successfully",
      data: plans,
    });
  } catch (error) {
    console.error("Get available plans error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching available plans",
    });
  }
};

// GET /api/seller-subscriptions/current (Seller current subscription)
export const getCurrentSubscription = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const subscription = await getCurrentSellerSubscription(req.user.userId);

    if (!subscription) {
      return res.status(200).json({
        success: true,
        message: "No active subscription found",
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Current subscription retrieved successfully",
      data: subscription,
    });
  } catch (error) {
    console.error("Get current subscription error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching current subscription",
    });
  }
};

// POST /api/seller-subscriptions (Subscribe to a plan)
export const subscribeToPlan = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const validationResult = createSellerSubscriptionSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationResult.error.issues,
      });
    }

    const subscription = await createSellerSubscription(
      req.user.userId,
      validationResult.data.planId,
      validationResult.data.startedAt
    );

    return res.status(201).json({
      success: true,
      message: "Subscription created successfully",
      data: subscription,
    });
  } catch (error) {
    console.error("Subscribe to plan error:", error);

    if (error instanceof Error) {
      if (
        error.message === "Seller not found" ||
        error.message === "Seller plan not found"
      ) {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      if (
        error.message === "User is not a seller" ||
        error.message === "Selected plan is no longer available"
      ) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      if (error.message.includes("already have an active subscription")) {
        return res.status(409).json({
          success: false,
          message: error.message,
        });
      }
    }

    return res.status(500).json({
      success: false,
      message: "Something went wrong while creating subscription",
    });
  }
};

// GET /api/seller-subscriptions (Seller's subscriptions)
export const listSellerSubscriptions = async (
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

    const validationResult = getSellerSubscriptionsQuerySchema.safeParse(
      req.query
    );

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationResult.error.issues,
      });
    }

    const result = await getSellerSubscriptions(
      req.user.userId,
      validationResult.data
    );

    return res.status(200).json({
      success: true,
      message: "Seller subscriptions retrieved successfully",
      data: result.subscriptions,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("List seller subscriptions error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching subscriptions",
    });
  }
};

// GET /api/seller-subscriptions/:id (Get specific subscription)
export const getSubscription = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { id } = req.params;

    const subscription = await getSellerSubscriptionById(id, req.user.userId);

    return res.status(200).json({
      success: true,
      message: "Subscription retrieved successfully",
      data: subscription,
    });
  } catch (error) {
    console.error("Get subscription error:", error);

    if (error instanceof Error) {
      if (error.message === "Subscription not found") {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      if (error.message.includes("do not have access")) {
        return res.status(403).json({
          success: false,
          message: error.message,
        });
      }
    }

    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching subscription",
    });
  }
};

// DELETE /api/seller-subscriptions/:id (Cancel subscription)
export const cancelSubscription = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { id } = req.params;

    const subscription = await cancelSellerSubscription(id, req.user.userId);

    return res.status(200).json({
      success: true,
      message: "Subscription cancelled successfully",
      data: subscription,
    });
  } catch (error) {
    console.error("Cancel subscription error:", error);

    if (error instanceof Error) {
      if (error.message === "Subscription not found") {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      if (error.message.includes("do not have access")) {
        return res.status(403).json({
          success: false,
          message: error.message,
        });
      }
    }

    return res.status(500).json({
      success: false,
      message: "Something went wrong while cancelling subscription",
    });
  }
};

// ==========================================
// ADMIN ONLY CONTROLLERS
// ==========================================

// GET /api/seller-subscriptions (Admin - all subscriptions)
export const listAllSellerSubscriptions = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const validationResult = getSellerSubscriptionsQuerySchema.safeParse(
      req.query
    );

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationResult.error.issues,
      });
    }

    const result = await getAllSellerSubscriptions(validationResult.data);

    return res.status(200).json({
      success: true,
      message: "All seller subscriptions retrieved successfully",
      data: result.subscriptions,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("List all seller subscriptions error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching subscriptions",
    });
  }
};
