import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import {
  getWishlistController,
  addWishlistItemController,
  removeWishlistItemController,
  checkWishlistItemController,
  clearWishlistController,
} from "../controllers/wishlist.controller.js";

const router = Router();

router.get("/", authenticate, authorize("CUSTOMER"), getWishlistController);
router.post("/items", authenticate, authorize("CUSTOMER"), addWishlistItemController);
router.delete("/items/:productId", authenticate, authorize("CUSTOMER"), removeWishlistItemController);
router.get("/check/:productId", authenticate, authorize("CUSTOMER"), checkWishlistItemController);
router.delete("/", authenticate, authorize("CUSTOMER"), clearWishlistController);

export default router;
