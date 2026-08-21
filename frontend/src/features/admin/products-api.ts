import apiClient from "@/lib/api/client";
import { ApiResponse } from "@/types/auth";
import { Product } from "@/types/product";

export async function getAdminProductsApi(): Promise<Product[]> {
  const response = await apiClient.get<ApiResponse<Product[]>>("/products/admin");
  return response.data.data || [];
}

export async function updateProductStatusApi(id: string, status: "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED"): Promise<Product> {
  const response = await apiClient.patch<ApiResponse<Product>>(`/products/${id}/status`, { status });
  return response.data.data!;
}
