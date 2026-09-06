import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import {
  getPayment,
  getPaymentForOrder,
  updatePaymentStatusController,
  processTestPaymentController,
} from "../controllers/payment.controller.js";

const router = Router();

router.get("/order/:orderId", authenticate, authorize("CUSTOMER", "ADMIN"), getPaymentForOrder);
router.get("/:id", authenticate, authorize("CUSTOMER", "ADMIN"), getPayment);
router.post("/:id/process-test", authenticate, processTestPaymentController);
router.patch("/:id/status", authenticate, authorize("ADMIN"), updatePaymentStatusController);

export default router;

