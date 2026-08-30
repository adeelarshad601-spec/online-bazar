import { Response } from "express";
import {
  updateProfileSchema,
  changePasswordSchema,
  deleteAccountSchema,
} from "../validators/user.validator.js";
import {
  updateProfile,
  changePassword,
  deleteAccount,
} from "../services/user.service.js";
import { AuthRequest } from "../middleware/auth.middleware.js";

export const updateUserProfile = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const validationResult = updateProfileSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationResult.error.issues,
      });
    }

    const user = await updateProfile(
      req.user.userId,
      validationResult.data
    );

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: user,
    });
  } catch (error) {
    console.error("Update profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const updateUserPassword = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const validationResult = changePasswordSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationResult.error.issues,
      });
    }

    await changePassword(
      req.user.userId,
      validationResult.data
    );

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Current password is incorrect"
    ) {
      return res.status(401).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const removeAccount = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const validationResult = deleteAccountSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationResult.error.issues,
      });
    }

    await deleteAccount(req.user.userId, validationResult.data);

    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Current password is incorrect"
    ) {
      return res.status(401).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Delete account error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};