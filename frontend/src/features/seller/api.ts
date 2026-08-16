import apiClient from "@/lib/api/client";
import { ApiResponse } from "@/types/auth";

export interface SellerStatusData {
  id: string;
  name: string;
  email: string;
  role: "CUSTOMER" | "SELLER" | "ADMIN";
  sellerStatus: "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED" | null;
  shop?: {
    id: string;
    name: string;
    slug: string;
    logo?: string | null;
    banner?: string | null;
    description?: string | null;
  } | null;
}

export async function applySellerApi(): Promise<SellerStatusData> {
  const response = await apiClient.post<ApiResponse<SellerStatusData>>("/sellers/apply");
  return response.data.data!;
}

export async function getSellerStatusApi(): Promise<SellerStatusData> {
  const response = await apiClient.get<ApiResponse<SellerStatusData>>("/sellers/me");
  return response.data.data!;
}
