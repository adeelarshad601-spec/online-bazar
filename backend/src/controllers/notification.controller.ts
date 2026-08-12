import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import {
  notificationIdParamSchema,
  notificationQuerySchema,
} from "../validators/notification.validator.js";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "../services/notification.service.js";

export const listNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const validation = notificationQuerySchema.safeParse(req.query);
    if (!validation.success) {
      return res.status(400).json({ success: false, message: "Invalid query", errors: validation.error.issues });
    }

    const data = await getNotifications(req.user!.userId, validation.data.page, validation.data.limit);

    return res.status(200).json({ success: true, message: "Notifications fetched successfully", data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

export const unreadCount = async (req: AuthRequest, res: Response) => {
  try {
    const data = await getUnreadCount(req.user!.userId);
    return res.status(200).json({ success: true, message: "Unread count fetched", data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

export const readNotification = async (req: AuthRequest, res: Response) => {
  try {
    const validation = notificationIdParamSchema.safeParse(req.params);
    if (!validation.success) {
      return res.status(400).json({ success: false, message: "Invalid id", errors: validation.error.issues });
    }

    await markAsRead(req.user!.userId, validation.data.id);

    return res.status(200).json({ success: true, message: "Notification marked as read" });
  } catch (err) {
    if (err instanceof Error && err.message === "Notification not found") {
      return res.status(404).json({ success: false, message: err.message });
    }
    if (err instanceof Error && err.message === "Access denied") {
      return res.status(403).json({ success: false, message: err.message });
    }
    console.error(err);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

export const readAllNotifications = async (req: AuthRequest, res: Response) => {
  try {
    await markAllAsRead(req.user!.userId);
    return res.status(200).json({ success: true, message: "All notifications marked as read" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

export const removeNotification = async (req: AuthRequest, res: Response) => {
  try {
    const validation = notificationIdParamSchema.safeParse(req.params);
    if (!validation.success) {
      return res.status(400).json({ success: false, message: "Invalid id", errors: validation.error.issues });
    }

    await deleteNotification(req.user!.userId, validation.data.id);
    return res.status(200).json({ success: true, message: "Notification deleted" });
  } catch (err) {
    if (err instanceof Error && err.message === "Notification not found") {
      return res.status(404).json({ success: false, message: err.message });
    }
    if (err instanceof Error && err.message === "Access denied") {
      return res.status(403).json({ success: false, message: err.message });
    }
    console.error(err);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};
