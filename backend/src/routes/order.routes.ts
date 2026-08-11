import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import {
  cancelOrder,
  getAdminOrders,
  getOrder,
  getOrders,
  getVendorOrders,
  updateAdminOrderStatus,
  updateVendorOrderStatus,
} from "../controllers/order.controller.js";

const router = Router();

router.get("/", authenticate, authorize("CUSTOMER"), getOrders);
router.get("/vendor", authenticate, authorize("SELLER"), getVendorOrders);
router.patch(
  "/vendor/:id/status",
  authenticate,
  authorize("SELLER"),
  updateVendorOrderStatus
);
router.get("/admin", authenticate, authorize("ADMIN"), getAdminOrders);
router.patch(
  "/admin/:id/status",
  authenticate,
  authorize("ADMIN"),
  updateAdminOrderStatus
);
// Admin route accessible at /api/orders/:id/status for updating order status
router.patch(
  "/:id/status",
  authenticate,
  authorize("ADMIN"),
  updateAdminOrderStatus
);
router.get("/:id", authenticate, authorize("CUSTOMER"), getOrder);
router.patch("/:id/cancel", authenticate, authorize("CUSTOMER"), cancelOrder);

export default router;
