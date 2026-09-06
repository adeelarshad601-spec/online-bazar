import apiClient from "@/lib/api/client";
import { ApiResponse } from "@/types/auth";

export interface AdminPayoutItem {
  id: string;
  shopId: string;
  amount: number | string;
  commission: number | string;
  payoutAmount: number | string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "CANCELLED";
  paidAt?: string | null;
  createdAt: string;
  shop?: {
    id: string;
    name: string;
    seller?: {
      id: string;
      name: string;
      email: string;
    };
  };
}

export interface AdminPayoutsData {
  payouts: AdminPayoutItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function getAdminPayoutsApi(status?: string): Promise<AdminPayoutsData> {
  const response = await apiClient.get<ApiResponse<AdminPayoutsData>>("/payouts/admin", {
    params: { status: status || undefined },
  });
  return response.data.data!;
}

export async function updateAdminPayoutStatusApi(
  id: string,
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "CANCELLED"
): Promise<AdminPayoutItem> {
  const response = await apiClient.patch<ApiResponse<AdminPayoutItem>>(`/payouts/admin/${id}/status`, {
    status,
  });
  return response.data.data!;
}
