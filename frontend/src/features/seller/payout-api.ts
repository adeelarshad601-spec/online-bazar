import apiClient from "@/lib/api/client";
import { ApiResponse } from "@/types/auth";

export interface SellerPayoutDashboardData {
  shopId: string;
  shopName: string;
  totalEarnings: number | string;
  balance: number | string;
  payoutRequests: number;
}

export interface SellerPayoutItem {
  id: string;
  shopId: string;
  amount: number | string;
  commission: number | string;
  payoutAmount: number | string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  transactionId?: string | null;
  paidAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SellerPayoutsResponse {
  payouts: SellerPayoutItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function getSellerPayoutDashboardApi(): Promise<SellerPayoutDashboardData> {
  const response = await apiClient.get<ApiResponse<SellerPayoutDashboardData>>("/payouts/seller/dashboard");
  return response.data.data!;
}

export async function getSellerPayoutsApi(page: number = 1, limit: number = 10, status?: string): Promise<SellerPayoutsResponse> {
  const response = await apiClient.get<ApiResponse<SellerPayoutsResponse>>("/payouts/seller", {
    params: { page, limit, status },
  });
  return response.data.data!;
}

export async function requestSellerPayoutApi(amount: number): Promise<SellerPayoutItem> {
  const response = await apiClient.post<ApiResponse<SellerPayoutItem>>("/payouts/seller", { amount });
  return response.data.data!;
}
