import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { getAdminStats } from "../services/admin-stats.service.js";

export const getStats = async (req: AuthRequest, res: Response) => {
  try {
    const stats = await getAdminStats();

    return res.status(200).json({
      success: true,
      message: "Admin statistics retrieved successfully",
      data: stats,
    });
  } catch (error) {
    console.error("Get admin stats error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching statistics",
    });
  }
};
