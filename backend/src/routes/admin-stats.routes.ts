import { Router } from "express";
import { getStats } from "../controllers/admin-stats.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = Router();

// GET /api/admin/stats - Get admin dashboard statistics
router.get(
  "/stats",
  authenticate,
  authorize("ADMIN"),
  getStats
);

export default router;
