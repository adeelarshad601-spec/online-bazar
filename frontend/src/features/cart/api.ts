import apiClient from "@/lib/api/client";
import { ApiResponse } from "@/types/auth";
import { Cart, AddCartItemPayload } from "@/types/cart";

function normalizeCart(rawCart: any): Cart {
  if (!rawCart) {
    return { id: "", items: [], totalItems: 0, totalAmount: 0 };
  }

  const items = (rawCart.items || []).map((item: any) => {
    const rawPrice = item.price;
    const rawSubtotal = item.subtotal;
    const prodPrice = item.product?.price;

    return {
      ...item,
      price: typeof rawPrice === "number" ? rawPrice : parseFloat(String(rawPrice || 0)),
      subtotal: typeof rawSubtotal === "number" ? rawSubtotal : parseFloat(String(rawSubtotal || 0)),
      product: item.product
        ? {
            ...item.product,
            price: typeof prodPrice === "number" ? prodPrice : parseFloat(String(prodPrice || 0)),
          }
        : item.product,
    };
  });

  const rawTotal = rawCart.totalAmount;
  const totalAmount = typeof rawTotal === "number" ? rawTotal : parseFloat(String(rawTotal || 0));

  return {
    id: rawCart.id || "",
    items,
    totalItems: rawCart.totalItems ?? items.length,
    totalAmount,
  };
}

export async function getCartApi(): Promise<Cart> {
  const response = await apiClient.get<ApiResponse<any>>("/cart");
  return normalizeCart(response.data.data);
}

export async function addToCartApi(payload: AddCartItemPayload): Promise<Cart> {
  const response = await apiClient.post<ApiResponse<any>>("/cart/items", payload);
  return normalizeCart(response.data.data);
}

export async function updateCartItemApi(cartItemId: string, quantity: number): Promise<Cart> {
  const response = await apiClient.patch<ApiResponse<any>>(`/cart/items/${cartItemId}`, { quantity });
  return normalizeCart(response.data.data);
}

export async function removeCartItemApi(cartItemId: string): Promise<Cart> {
  const response = await apiClient.delete<ApiResponse<any>>(`/cart/items/${cartItemId}`);
  return normalizeCart(response.data.data);
}

export async function clearCartApi(): Promise<Cart> {
  const response = await apiClient.delete<ApiResponse<any>>("/cart/clear");
  return normalizeCart(response.data.data);
}
