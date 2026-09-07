import apiClient from "@/lib/api/client";

export interface UserAddressItem {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  address: string;
  unit?: string | null;
  city: string;
  state?: string | null;
  postalCode?: string | null;
  country: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserAddressInput {
  fullName: string;
  phone: string;
  address: string;
  unit?: string | null;
  city: string;
  state?: string | null;
  postalCode?: string | null;
  country?: string;
  isDefault?: boolean;
}

export const getUserAddressesApi = async (): Promise<{ success: boolean; data: UserAddressItem[] }> => {
  const response = await apiClient.get<{ success: boolean; data: UserAddressItem[] }>("/user/addresses");
  return response.data;
};

export const createUserAddressApi = async (data: UserAddressInput): Promise<{ success: boolean; data: UserAddressItem; message: string }> => {
  const response = await apiClient.post<{ success: boolean; data: UserAddressItem; message: string }>("/user/addresses", data);
  return response.data;
};

export const deleteUserAddressApi = async (id: string): Promise<{ success: boolean; message: string }> => {
  const response = await apiClient.delete<{ success: boolean; message: string }>(`/user/addresses/${id}`);
  return response.data;
};
