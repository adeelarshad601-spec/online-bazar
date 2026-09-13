import { Request, Response } from "express";
import { registerSchema, loginSchema } from "../validators/auth.validator.js";
import { registerUser, loginUser, getCurrentUser, adminLogin } from "../services/auth.service.js";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { verifyRefreshToken, generateAccessToken } from "../utils/jwt.js";
export const register = async (req: Request, res: Response) => {
  try {
    const validationResult = registerSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationResult.error.issues,
      });
    }

    const user = await registerUser(validationResult.data);

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: user,
    });
  } catch (error) {
    console.error("Register error:", error);

    if (
      error instanceof Error &&
      error.message === "Email is already registered"
    ) {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Something went wrong while registering user",
    });
  }
};

// Login controller
export const login = async (req: Request, res: Response) => {
  try {
    const validationResult = loginSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationResult.error.issues,
      });
    }

    const result = await loginUser(validationResult.data);

    res.cookie("accessToken", result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: result.user,
    });
  } catch (error) {
    console.error("Login error:", error);

    if (
      error instanceof Error &&
      (error.message === "Invalid email or password" ||
       error.message === "Admin accounts must use the admin login")
    ) {
      return res.status(401).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Something went wrong while logging in",
    });
  }
};

// Admin Login controller
export const adminLoginController = async (req: Request, res: Response) => {
  try {
    const validationResult = loginSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationResult.error.issues,
      });
    }

    const result = await adminLogin(validationResult.data);

    res.cookie("accessToken", result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Admin login successful",
      data: result.user,
    });
  } catch (error) {
    console.error("Admin login error:", error);

    if (
      error instanceof Error &&
      (error.message === "Invalid email or password" ||
       error.message === "This account does not have admin access")
    ) {
      return res.status(401).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Something went wrong while logging in",
    });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    //get current user from database using req.user.userId
    const user = await getCurrentUser(req.user.userId);

    return res.status(200).json({
      success: true,
      message: "Current user fetched successfully",
      data: user,
    });
  } catch (error) {
    console.error("Get current user error:", error);

    if (
      error instanceof Error &&
      error.message === "User not found"
    ) {
      return res.status(404).json({
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

//logout controller
export const refresh = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token required",
      });
    }

    const payload = verifyRefreshToken(refreshToken);
    const user = await getCurrentUser(payload.userId);

    const accessToken = generateAccessToken({
      userId: user.id,
      role: user.role,
    });

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Session refreshed successfully",
      data: user,
    });
  } catch (error) {
    console.error("Refresh token error:", error);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired refresh token",
    });
  }
};

export const logout = async (req: Request, res: Response) => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  return res.status(200).json({
    success: true,
    message: "Logout successful",
  });
};