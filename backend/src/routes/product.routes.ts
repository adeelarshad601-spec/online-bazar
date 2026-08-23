import { Router } from "express";

import {
  create,
  getAll,
  getOne,
  update,
  remove,
  changeStatus,
  getAllForAdmin,
  getAllForSeller,
  getOneForSeller,
} from "../controllers/product.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import searchRoutes from "./search.routes.js";

const router = Router();

// Public
router.get("/", getAll);
router.get("/admin", authenticate, authorize("ADMIN"), getAllForAdmin);
router.get("/mine", authenticate, getAllForSeller);
router.get("/mine/:id", authenticate, getOneForSeller);
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