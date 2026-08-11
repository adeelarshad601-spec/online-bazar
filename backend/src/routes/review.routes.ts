import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import {
  createReviewController,
  getProductReviewsController,
  getReviewController,
  updateReviewController,
  deleteReviewController,
} from "../controllers/review.controller.js";

const router = Router();

router.post("/", authenticate, authorize("CUSTOMER"), createReviewController);
router.get("/product/:productId", getProductReviewsController);
router.get("/:id", getReviewController);
router.patch("/:id", authenticate, authorize("CUSTOMER"), updateReviewController);
router.delete("/:id", authenticate, authorize("CUSTOMER", "ADMIN"), deleteReviewController);

export default router;
