import apiClient from "@/lib/api/client";
import { ApiResponse } from "@/types/auth";
import { ShopDetails } from "@/types/shop";

export interface CreateShopPayload {
  name: string;
  slug: string;
  logo?: string;
  banner?: string;
  description?: string;
}

export interface UpdateShopPayload {
  name?: string;
  slug?: string;
  logo?: string;
  banner?: string;
  description?: string;
}

export async function getMyShopApi(): Promise<ShopDetails | null> {
  try {
    const response = await apiClient.get<ApiResponse<ShopDetails>>("/shops/mine");
    return response.data.data || null;
  } catch (err: any) {
    if (err.response?.status === 404) return null;
    throw err;
  }
}

export async function createShopApi(payload: CreateShopPayload): Promise<ShopDetails> {
  const response = await apiClient.post<ApiResponse<ShopDetails>>("/shops", payload);
  return response.data.data!;
}

export async function updateShopApi(id: string, payload: UpdateShopPayload): Promise<ShopDetails> {
  const response = await apiClient.patch<ApiResponse<ShopDetails>>(`/shops/${id}`, payload);
  return response.data.data!;
}
