import apiClient from "@/lib/api/client";
import { User, LoginInput, RegisterInput, ApiResponse } from "@/types/auth";

export const registerApi = async (data: RegisterInput): Promise<User> => {
  const payload = {
    ...data,
    email: data.email.trim().toLowerCase(),
  };
  const response = await apiClient.post<ApiResponse<User>>("/auth/register", payload);
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || "Failed to register user");
  }
  return response.data.data;
};

export const loginApi = async (data: LoginInput): Promise<User> => {
  const payload = {
    ...data,
    email: data.email.trim().toLowerCase(),
  };
  const response = await apiClient.post<ApiResponse<User>>("/auth/login", payload);
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || "Failed to log in");
  }
  return response.data.data;
};

export const getCurrentUserApi = async (): Promise<User | null> => {
  try {
    const response = await apiClient.get<ApiResponse<User>>("/auth/me");
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    // Unauthenticated or session expired returns null without throwing unhandled rejection
    return null;
  }
};

export const logoutApi = async (): Promise<void> => {
  await apiClient.post("/auth/logout");
};
