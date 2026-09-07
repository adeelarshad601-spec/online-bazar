import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import {
  getShippingQuoteHandler,
  getShippingZonesHandler,
  getShippingZoneByIdHandler,
  createShippingZoneHandler,
  updateShippingZoneHandler,
  deleteShippingZoneHandler,
} from "../controllers/shipping.controller.js";

const router = Router();

// Public / Customer quote calculation endpoint
router.post("/quote", (req: any, res: any, next: any) => {
  if (req.headers.authorization || req.cookies?.token) {
    return authenticate(req, res, next);
  }
  next();
}, getShippingQuoteHandler);

// Admin routes
router.get("/zones", authenticate, authorize("ADMIN"), getShippingZonesHandler);
router.get("/zones/:id", authenticate, authorize("ADMIN"), getShippingZoneByIdHandler);
router.post("/zones", authenticate, authorize("ADMIN"), createShippingZoneHandler);
router.put("/zones/:id", authenticate, authorize("ADMIN"), updateShippingZoneHandler);
router.delete("/zones/:id", authenticate, authorize("ADMIN"), deleteShippingZoneHandler);

export default router;
