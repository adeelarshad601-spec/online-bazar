import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import { checkout } from "../controllers/checkout.controller.js";

const router = Router();

router.post("/", authenticate, authorize("CUSTOMER"), checkout);

export default router;
