import apiClient from "@/lib/api/client";
import { ApiResponse, User } from "@/types/auth";

export interface UpdateProfileInput {
  name?: string;
  avatar?: string | null;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface DeleteAccountInput {
  currentPassword: string;
}

export async function updateUserProfileApi(payload: UpdateProfileInput): Promise<User> {
  const response = await apiClient.patch<ApiResponse<User>>("/users/profile", payload);
  return response.data.data!;
}

export async function updateUserPasswordApi(payload: ChangePasswordInput): Promise<void> {
  await apiClient.patch("/users/password", payload);
}

export async function deleteAccountApi(payload: DeleteAccountInput): Promise<void> {
  await apiClient.delete("/users/account", { data: payload });
}
