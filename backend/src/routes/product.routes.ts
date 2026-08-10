import { Router } from "express";

import {
  create,
  getAll,
  getOne,
  update,
  remove,
  changeStatus,
} from "../controllers/product.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = Router();

// Public
router.get("/", getAll);
router.get("/:id", getOne);

// Seller + Admin
router.post(
  "/",
  authenticate,
  authorize("SELLER", "ADMIN"),
  create
);

router.patch(
  "/:id",
  authenticate,
  authorize("SELLER", "ADMIN"),
  update
);

router.delete(
  "/:id",
  authenticate,
  authorize("SELLER", "ADMIN"),
  remove
);

// Admin only
router.patch(
  "/:id/status",
  authenticate,
  authorize("ADMIN"),
  changeStatus
);

export default router;