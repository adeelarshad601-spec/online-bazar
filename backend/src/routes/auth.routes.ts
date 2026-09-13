import { Router } from "express";
import { register, login, adminLoginController, getMe, refresh, logout } from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/admin-login", adminLoginController);
router.post("/refresh", refresh);
router.get("/me", authenticate, getMe);
router.post("/logout", logout);
export default router;