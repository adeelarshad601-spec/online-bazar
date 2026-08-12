import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import {
  listNotifications,
  unreadCount,
  readNotification,
  readAllNotifications,
  removeNotification,
} from "../controllers/notification.controller.js";

const router = Router();

router.use(authenticate);

router.get("/", listNotifications);
router.get("/unread-count", unreadCount);
router.patch("/:id/read", readNotification);
router.patch("/read-all", readAllNotifications);
router.delete("/:id", removeNotification);

export default router;
