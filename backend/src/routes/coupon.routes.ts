import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import {
  createCouponController,
  getCouponsController,
  getCouponController,
  updateCouponController,
  deleteCouponController,
  validateCouponController,
} from "../controllers/coupon.controller.js";

const router = Router();

router.post("/", authenticate, authorize("ADMIN"), createCouponController);
router.get("/", authenticate, authorize("ADMIN"), getCouponsController);
router.get("/:id", authenticate, authorize("ADMIN"), getCouponController);
router.patch("/:id", authenticate, authorize("ADMIN"), updateCouponController);
router.delete("/:id", authenticate, authorize("ADMIN"), deleteCouponController);
router.post("/validate", authenticate, authorize("CUSTOMER"), validateCouponController);

export default router;
