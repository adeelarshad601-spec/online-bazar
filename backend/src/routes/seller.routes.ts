import { Router } from "express";
import {
  apply,
  getMe,
  getAll,
  getOne,
  approve,
  reject,
  suspend,
  reactivate,
} from "../controllers/seller.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = Router();

router.post(
  "/apply",
  authenticate,
  authorize("CUSTOMER"),
  apply
);
router.get("/me", authenticate, getMe);
router.get("/", authenticate, authorize("ADMIN"), getAll);
router.get("/:id", authenticate, authorize("ADMIN"), getOne);
router.patch(
  "/:id/approve",
  authenticate,
  authorize("ADMIN"),
  approve
);
router.patch(
  "/:id/reject",
  authenticate,
  authorize("ADMIN"),
  reject
);
router.patch(
  "/:id/suspend",
  authenticate,
  authorize("ADMIN"),
  suspend
);
router.patch(
  "/:id/reactivate",
  authenticate,
  authorize("ADMIN"),
  reactivate
);

export default router;
