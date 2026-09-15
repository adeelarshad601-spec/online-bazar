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
  variants?: Array<{
    id?: string;
    name?: string;
    sku?: string;
    price?: number | null;
    stock?: number;
    options?: Record<string, any>;
  }>;
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
  images?: string[];
  variants?: Array<{
    id?: string;
    name?: string;
    sku?: string;
    price?: number | null;
    stock?: number;
    options?: Record<string, any>;
  }>;
}

export async function createProductApi(payload: CreateProductPayload): Promise<Product> {
  const response = await apiClient.post<ApiResponse<Product>>("/products", payload);
  return response.data.data!;
}

export async function getSellerProductsApi(): Promise<Product[]> {
  const response = await apiClient.get<ApiResponse<Product[]>>("/products/mine");
  return response.data.data || [];
}

export async function getSellerProductByIdApi(id: string): Promise<Product> {
  const response = await apiClient.get<ApiResponse<Product>>(`/products/mine/${id}`);
  return response.data.data!;
}

export async function updateProductApi(id: string, payload: UpdateProductPayload): Promise<Product> {
  const response = await apiClient.patch<ApiResponse<Product>>(`/products/${id}`, payload);
  return response.data.data!;
}

export async function deleteProductApi(id: string): Promise<void> {
  await apiClient.delete(`/products/${id}`);
}
