import { Router } from "express";
import {
  updateUserProfile,
  updateUserPassword,
  removeAccount,
} from "../controllers/user.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.patch("/profile", authenticate, updateUserProfile);

router.patch("/password", authenticate, updateUserPassword);

router.delete("/account", authenticate, removeAccount);

export default router;