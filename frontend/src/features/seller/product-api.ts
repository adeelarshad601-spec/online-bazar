import apiClient from "@/lib/api/client";
import { ApiResponse } from "@/types/auth";
import { Product } from "@/types/product";

export interface CreateProductPayload {
  title: string;
  slug: string;
  description: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  shopId: string;
  categoryId: string;
  images?: string[];
}

export interface UpdateProductPayload {
  title?: string;
  slug?: string;
  description?: string;
  sku?: string;
  price?: number;
  compareAtPrice?: number;
  stock?: number;
  categoryId?: string;
}

export async function createProductApi(payload: CreateProductPayload): Promise<Product> {
  const response = await apiClient.post<ApiResponse<Product>>("/products", payload);
  return response.data.data!;
}

export async function updateProductApi(id: string, payload: UpdateProductPayload): Promise<Product> {
  const response = await apiClient.patch<ApiResponse<Product>>(`/products/${id}`, payload);
  return response.data.data!;
}

export async function deleteProductApi(id: string): Promise<void> {
  await apiClient.delete(`/products/${id}`);
}
