import apiClient from "@/lib/api/client";
import { ApiResponse } from "@/types/auth";
import { SellerStatusData } from "@/features/seller/api";

export async function getAdminSellersApi(status?: string): Promise<SellerStatusData[]> {
  const response = await apiClient.get<ApiResponse<SellerStatusData[]>>("/sellers", {
    params: { status },
  });
  return response.data.data || [];
}

export async function approveSellerApi(id: string): Promise<SellerStatusData> {
  const response = await apiClient.patch<ApiResponse<SellerStatusData>>(`/sellers/${id}/approve`);
  return response.data.data!;
}

export async function rejectSellerApi(id: string): Promise<SellerStatusData> {
  const response = await apiClient.patch<ApiResponse<SellerStatusData>>(`/sellers/${id}/reject`);
  return response.data.data!;
}

export async function suspendSellerApi(id: string): Promise<SellerStatusData> {
  const response = await apiClient.patch<ApiResponse<SellerStatusData>>(`/sellers/${id}/suspend`);
  return response.data.data!;
}

export async function reactivateSellerApi(id: string): Promise<SellerStatusData> {
  const response = await apiClient.patch<ApiResponse<SellerStatusData>>(`/sellers/${id}/reactivate`);
  return response.data.data!;
}
