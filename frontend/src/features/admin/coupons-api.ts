import apiClient from "@/lib/api/client";
import { ApiResponse } from "@/types/auth";

export interface CouponItem {
  id: string;
  code: string;
  type: "PERCENTAGE" | "FIXED";
  value: number | string;
  minOrderAmount?: number | string | null;
  maxDiscount?: number | string | null;
  usageLimit?: number | null;
  usedCount: number;
  expiresAt?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCouponPayload {
  code: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  usageLimit?: number;
  expiresAt?: string;
  isActive?: boolean;
}

export interface UpdateCouponPayload {
  code?: string;
  type?: "PERCENTAGE" | "FIXED";
  value?: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  usageLimit?: number;
  expiresAt?: string;
  isActive?: boolean;
}

export async function getCouponsApi(): Promise<CouponItem[]> {
  const response = await apiClient.get<ApiResponse<any>>("/coupons");
  const data = response.data.data;
  if (Array.isArray(data)) {
    return data;
  }
  if (data && Array.isArray(data.coupons)) {
    return data.coupons;
  }
  return [];
}


export async function createCouponApi(payload: CreateCouponPayload): Promise<CouponItem> {
  const response = await apiClient.post<ApiResponse<CouponItem>>("/coupons", payload);
  return response.data.data!;
}

export async function updateCouponApi(id: string, payload: UpdateCouponPayload): Promise<CouponItem> {
  const response = await apiClient.patch<ApiResponse<CouponItem>>(`/coupons/${id}`, payload);
  return response.data.data!;
}

export async function deleteCouponApi(id: string): Promise<void> {
  await apiClient.delete(`/coupons/${id}`);
}
