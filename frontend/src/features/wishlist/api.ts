import apiClient from "@/lib/api/client";
import { ApiResponse } from "@/types/auth";
import { Wishlist, WishlistItem, WishlistCheckResponse } from "@/types/wishlist";
import { Product } from "@/types/product";

function normalizeProduct(p: any): Product {
  return {
    ...p,
    price: typeof p.price === "number" ? p.price : parseFloat(String(p.price || 0)),
    compareAtPrice: p.compareAtPrice
      ? typeof p.compareAtPrice === "number"
        ? p.compareAtPrice
        : parseFloat(String(p.compareAtPrice))
      : null,
    stock: typeof p.stock === "number" ? p.stock : parseInt(String(p.stock || 0), 10),
  };
}

function normalizeWishlist(rawWishlist: any): Wishlist {
  if (!rawWishlist) {
    return { id: null, items: [] };
  }

  const items = (rawWishlist.items || []).map((item: any) => ({
    ...item,
    product: item.product ? normalizeProduct(item.product) : item.product,
  }));

  return {
    id: rawWishlist.id || null,
    items,
  };
}

export async function getWishlistApi(): Promise<Wishlist> {
  const response = await apiClient.get<ApiResponse<any>>("/wishlist");
  return normalizeWishlist(response.data.data);
}

export async function addToWishlistApi(productId: string): Promise<WishlistItem> {
  const response = await apiClient.post<ApiResponse<any>>("/wishlist/items", { productId });
  const rawItem = response.data.data;
  return {
    ...rawItem,
    product: rawItem?.product ? normalizeProduct(rawItem.product) : rawItem?.product,
  };
}

export async function removeFromWishlistApi(productId: string): Promise<{ id: string }> {
  const response = await apiClient.delete<ApiResponse<any>>(`/wishlist/items/${productId}`);
  return response.data.data || { id: productId };
}

export async function checkWishlistApi(productId: string): Promise<WishlistCheckResponse> {
  const response = await apiClient.get<ApiResponse<WishlistCheckResponse>>(`/wishlist/check/${productId}`);
  return response.data.data || { isWishlisted: false };
}

export async function clearWishlistApi(): Promise<{ deleted: number }> {
  const response = await apiClient.delete<ApiResponse<any>>("/wishlist");
  return response.data.data || { deleted: 0 };
}
