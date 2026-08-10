import { Router } from "express";
import {
  getCart,
  addItem,
  updateItem,
  removeItem,
  clear,
} from "../controllers/cart.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", authenticate, getCart);
router.post("/items", authenticate, addItem);
router.patch("/items/:id", authenticate, updateItem);
router.delete("/items/:id", authenticate, removeItem);
router.delete("/clear", authenticate, clear);

export default router;
