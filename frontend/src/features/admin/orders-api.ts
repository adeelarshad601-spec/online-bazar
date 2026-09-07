import apiClient from "@/lib/api/client";
import { ApiResponse } from "@/types/auth";
import { OrderDetails } from "@/features/orders/api";

export interface AdminOrdersResponse {
  orders: OrderDetails[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function getAdminOrdersApi(page: number = 1, limit: number = 10, status?: string): Promise<AdminOrdersResponse> {
  const response = await apiClient.get<ApiResponse<AdminOrdersResponse>>("/orders/admin", {
    params: { page, limit, status },
  });
  return response.data.data!;
}

export async function updateAdminOrderStatusApi(id: string, status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED"): Promise<OrderDetails> {
  const response = await apiClient.patch<ApiResponse<OrderDetails>>(`/orders/admin/${id}/status`, { status });
  return response.data.data!;
}

export async function processAdminOrderRefundApi(id: string, data: { reason?: string; deductShipping?: boolean }): Promise<{ order: OrderDetails; refundSummary: any }> {
  const response = await apiClient.post<ApiResponse<any>>(`/orders/${id}/refund`, data);
  return response.data.data!;
}

