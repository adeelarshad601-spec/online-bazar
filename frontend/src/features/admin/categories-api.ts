import apiClient from "@/lib/api/client";
import { ApiResponse } from "@/types/auth";
import { Category } from "@/types/category";

export interface CreateCategoryPayload {
  name: string;
  slug: string;
  image?: string;
}

export interface UpdateCategoryPayload {
  name?: string;
  slug?: string;
  image?: string;
}

export async function createCategoryApi(payload: CreateCategoryPayload): Promise<Category> {
  const response = await apiClient.post<ApiResponse<Category>>("/categories", payload);
  return response.data.data!;
}

export async function updateCategoryApi(id: string, payload: UpdateCategoryPayload): Promise<Category> {
  const response = await apiClient.patch<ApiResponse<Category>>(`/categories/${id}`, payload);
  return response.data.data!;
}

export async function deleteCategoryApi(id: string): Promise<void> {
  await apiClient.delete(`/categories/${id}`);
}
