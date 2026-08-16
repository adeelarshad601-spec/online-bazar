import apiClient from "@/lib/api/client";

export interface OrderItem {
  id: string;
  productId: string;
  variantId?: string | null;
  price: number;
  quantity: number;
  createdAt: string;
  product?: {
    id: string;
    title: string;
    price: number;
    images?: Array<{ url: string }>;
  };
  variant?: {
    id: string;
    name?: string | null;
    price?: number | null;
  } | null;
}

export interface VendorOrder {
  id: string;
  shopId?: string;
  status: string;
  subTotal: number;
  createdAt: string;
  updatedAt?: string;
  shop?: {
    id: string;
    name: string;
    logo?: string | null;
  };
  items: OrderItem[];
}

export interface OrderPayment {
  id?: string;
  method: string;
  status: string;
  amount: number;
  paidAt?: string | null;
  createdAt?: string;
}

export interface ShippingAddressData {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface OrderDetails {
  id: string;
  orderNumber: string;
  totalAmount: number;
  paymentStatus: string;
  status: string;
  shippingAddress: ShippingAddressData;
  createdAt: string;
  updatedAt?: string;
  vendorOrders?: VendorOrder[];
  payment?: OrderPayment | null;
  coupon?: any;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CustomerOrdersData {
  orders: OrderDetails[];
  pagination: PaginationMeta;
}

export interface GetOrdersApiResponse {
  success: boolean;
  message: string;
  data: CustomerOrdersData;
}

export interface GetOrderResponse {
  success: boolean;
  message: string;
  data: OrderDetails;
}

export interface GetPaymentResponse {
  success: boolean;
  message: string;
  data: OrderPayment;
}

export interface CancelOrderApiResponse {
  success: boolean;
  message: string;
  data: OrderDetails;
}

export async function getCustomerOrdersApi(
  page: number = 1,
  limit: number = 10
): Promise<GetOrdersApiResponse> {
  const response = await apiClient.get<GetOrdersApiResponse>(
    `/orders?page=${page}&limit=${limit}`
  );
  return response.data;
}

export async function getOrderByIdApi(orderId: string): Promise<GetOrderResponse> {
  const response = await apiClient.get<GetOrderResponse>(`/orders/${orderId}`);
  return response.data;
}

export async function getPaymentForOrderApi(orderId: string): Promise<GetPaymentResponse> {
  const response = await apiClient.get<GetPaymentResponse>(`/payments/order/${orderId}`);
  return response.data;
}

export async function cancelOrderApi(orderId: string): Promise<CancelOrderApiResponse> {
  const response = await apiClient.patch<CancelOrderApiResponse>(`/orders/${orderId}/cancel`);
  return response.data;
}
