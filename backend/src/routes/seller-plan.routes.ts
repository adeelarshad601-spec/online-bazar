import { Router } from "express";
import {
  listSellerPlans,
  getSellerPlan,
  createPlan,
  updatePlan,
  deletePlan,
  getAvailablePlans,
  getCurrentSubscription,
  subscribeToPlan,
  listSellerSubscriptions,
  getSubscription,
  cancelSubscription,
  listAllSellerSubscriptions,
} from "../controllers/seller-plan.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = Router();

// ==========================================
// SPECIFIC ROUTES (must come before generic /:id routes)
// ==========================================

// Sellers: Get available plans to subscribe to
// MUST BE BEFORE /:id route
router.get(
  "/available",
  authenticate,
  authorize("SELLER"),
  getAvailablePlans
);

// ==========================================
// SELLER SUBSCRIPTION ROUTES (must come before generic /:id)
// ==========================================

// Seller: Get current active subscription
router.get(
  "/subscriptions/current",
  authenticate,
  authorize("SELLER"),
  getCurrentSubscription
);

// Seller: Subscribe to a plan
router.post(
  "/subscriptions",
  authenticate,
  authorize("SELLER"),
  subscribeToPlan
);

// Seller: Get all their subscriptions
router.get(
  "/subscriptions",
  authenticate,
  authorize("SELLER"),
  listSellerSubscriptions
);

// Seller: Get a specific subscription
router.get(
  "/subscriptions/:id",
  authenticate,
  authorize("SELLER"),
  getSubscription
);

// Seller: Cancel a subscription
router.delete(
  "/subscriptions/:id",
  authenticate,
  authorize("SELLER"),
  cancelSubscription
);

// ==========================================
// SELLER PLAN ROUTES (ADMIN ONLY)
// ==========================================

// Admin: List all plans
router.get(
  "/",
  authenticate,
  authorize("ADMIN"),
  listSellerPlans
);

// Admin: Create a new plan
router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  createPlan
);

// Admin: Get a specific plan (generic route - must come last)
router.get(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  getSellerPlan
);

// Admin: Update a plan
router.patch(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  updatePlan
);

// Admin: Delete a plan
router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  deletePlan
);

// ==========================================
// ADMIN SUBSCRIPTION ROUTES
// ==========================================

// Admin: Get all subscriptions
router.get(
  "/admin/subscriptions",
  authenticate,
  authorize("ADMIN"),
  listAllSellerSubscriptions
);

export default router;
