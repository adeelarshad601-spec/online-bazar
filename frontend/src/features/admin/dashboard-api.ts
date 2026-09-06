import apiClient from "@/lib/api/client";
import { ApiResponse } from "@/types/auth";

export interface AdminStatsData {
  users: {
    total: number;
    customers?: number;
    sellers: number;
    admins?: number;
    pendingSellers: number;
  };
  products: {
    total: number;
    approved?: number;
    pending?: number;
  };
  orders: {
    total: number;
    completed?: number;
    processing?: number;
    pending?: number;
    cancelled?: number;
  };
  payouts: {
    pending: number;
    completed: number;
    pendingAmount?: number | string;
    completedAmount?: number | string;
  };
  sales: {
    total: number | string;
    gmv?: number | string;
    platformCommission?: number | string;
    sellerEarnings?: number | string;
  };
}


export async function getAdminStatsApi(): Promise<AdminStatsData> {
  const response = await apiClient.get<ApiResponse<AdminStatsData>>("/admin/stats");
  return response.data.data!;
}
