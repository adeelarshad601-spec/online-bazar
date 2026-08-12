import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import {
  getSellerDashboard,
  getSellerPayoutHistory,
  getSellerPayout,
  requestPayout,
  getAdminPayoutsController,
  getAdminPayout,
  updatePayoutStatusController,
} from "../controllers/payout.controller.js";

const router = Router();

router.get("/seller/dashboard", authenticate, authorize("SELLER"), getSellerDashboard);
router.get("/seller", authenticate, authorize("SELLER"), getSellerPayoutHistory);
router.get("/seller/:id", authenticate, authorize("SELLER"), getSellerPayout);
router.post("/seller", authenticate, authorize("SELLER"), requestPayout);

router.get("/admin", authenticate, authorize("ADMIN"), getAdminPayoutsController);
router.get("/admin/:id", authenticate, authorize("ADMIN"), getAdminPayout);
router.patch("/admin/:id/status", authenticate, authorize("ADMIN"), updatePayoutStatusController);

export default router;
