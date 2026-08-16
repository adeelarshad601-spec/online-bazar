import apiClient from "@/lib/api/client";
import { ApiResponse } from "@/types/auth";

export interface VendorOrderItem {
  id: string;
  price: number | string;
  quantity: number;
  product: {
    id: string;
    title: string;
    slug: string;
    price: number | string;
    sku: string;
    images?: Array<{ url: string; altText?: string | null }>;
  };
  variant?: {
    id: string;
    name: string;
    sku: string;
  } | null;
}

export interface VendorOrderDetails {
  id: string;
  orderId: string;
  shopId: string;
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  subTotal: number | string;
  createdAt: string;
  updatedAt: string;
  shop: {
    id: string;
    name: string;
    slug: string;
  };
  items: VendorOrderItem[];
  order?: {
    id: string;
    orderNumber: string;
    shippingAddress: {
      fullName: string;
      phone: string;
      address: string;
      city: string;
      postalCode?: string;
      country?: string;
    };
    paymentStatus: string;
    createdAt: string;
  };
}

export interface VendorOrdersResponse {
  orders: VendorOrderDetails[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function getVendorOrdersApi(status?: string): Promise<VendorOrdersResponse | VendorOrderDetails[]> {
  const response = await apiClient.get<ApiResponse<any>>("/orders/vendor", {
    params: { status },
  });
  return response.data.data;
}

export async function updateVendorOrderStatusApi(id: string, status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED"): Promise<VendorOrderDetails> {
  const response = await apiClient.patch<ApiResponse<VendorOrderDetails>>(`/orders/vendor/${id}/status`, { status });
  return response.data.data!;
}
