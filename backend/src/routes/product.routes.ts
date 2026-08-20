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
import searchRoutes from "./search.routes.js";

const router = Router();

// Public
router.get("/", getAll);
router.use("/search", searchRoutes);
router.get("/:id", getOne);

// Seller + Admin
router.post(
  "/",
  authenticate,
  create
);

router.patch(
  "/:id",
  authenticate,
  update
);

router.delete(
  "/:id",
  authenticate,
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