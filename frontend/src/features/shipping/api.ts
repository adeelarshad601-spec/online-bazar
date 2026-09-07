import apiClient from "@/lib/api/client";

export interface ShippingQuoteRequest {
  shippingAddress: {
    fullName?: string;
    phone?: string;
    address?: string;
    unit?: string | null;
    city: string;
    state?: string | null;
    postalCode?: string | null;
    country: string;
  };
  buyNowItem?: {
    productId: string;
    variantId?: string | null;
    quantity: number;
  } | null;
}

export interface ShippingQuoteResponse {
  success: boolean;
  message: string;
  data: {
    isDeliverable: boolean;
    matchedZone: {
      id: string;
      name: string;
      shippingCharge: number;
      isFreeShipping: boolean;
      freeShippingMinAmount: number | null;
    } | null;
    shippingAmount: number;
    vendorShipping: Record<string, number>;
  };
}

export interface ShippingZoneItem {
  id: string;
  name: string;
  description?: string | null;
  countries: string[];
  states: string[];
  cities: string[];
  postalCodes: string[];
  shippingCharge: number;
  isFreeShipping: boolean;
  freeShippingMinAmount: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const getShippingQuoteApi = async (payload: ShippingQuoteRequest): Promise<ShippingQuoteResponse> => {
  const response = await apiClient.post<ShippingQuoteResponse>("/shipping/quote", payload);
  return response.data;
};

export const getShippingZonesApi = async (): Promise<{ success: boolean; data: ShippingZoneItem[] }> => {
  const response = await apiClient.get<{ success: boolean; data: ShippingZoneItem[] }>("/shipping/zones");
  return response.data;
};

export const createShippingZoneApi = async (data: Partial<ShippingZoneItem>): Promise<{ success: boolean; data: ShippingZoneItem; message: string }> => {
  const response = await apiClient.post("/shipping/zones", data);
  return response.data;
};

export const updateShippingZoneApi = async ({ id, data }: { id: string; data: Partial<ShippingZoneItem> }): Promise<{ success: boolean; data: ShippingZoneItem; message: string }> => {
  const response = await apiClient.put(`/shipping/zones/${id}`, data);
  return response.data;
};

export const deleteShippingZoneApi = async (id: string): Promise<{ success: boolean; message: string }> => {
  const response = await apiClient.delete(`/shipping/zones/${id}`);
  return response.data;
};
