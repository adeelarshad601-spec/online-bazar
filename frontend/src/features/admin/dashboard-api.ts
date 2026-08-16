import apiClient from "@/lib/api/client";
import { ApiResponse } from "@/types/auth";

export interface AdminStatsData {
  users: {
    total: number;
    sellers: number;
    pendingSellers: number;
  };
  products: {
    total: number;
  };
  orders: {
    total: number;
  };
  payouts: {
    pending: number;
    completed: number;
  };
  sales: {
    total: number | string;
  };
}

export async function getAdminStatsApi(): Promise<AdminStatsData> {
  const response = await apiClient.get<ApiResponse<AdminStatsData>>("/admin/stats");
  return response.data.data!;
}
