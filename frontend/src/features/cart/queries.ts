import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCartApi,
  addToCartApi,
  updateCartItemApi,
  removeCartItemApi,
  clearCartApi,
} from "./api";
import { Cart, AddCartItemPayload } from "@/types/cart";
import { toast } from "sonner";
import { useCurrentUser } from "@/features/auth/queries";

export const CART_QUERY_KEY = ["cart"];

export function useCart() {
  const { data: user } = useCurrentUser();

  return useQuery<Cart>({
    queryKey: CART_QUERY_KEY,
    queryFn: getCartApi,
    enabled: Boolean(user),
    staleTime: 1000 * 60 * 2,
    retry: false,
  });
}

export function useAddToCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AddCartItemPayload) => addToCartApi(payload),
    onSuccess: (updatedCart) => {
      queryClient.setQueryData(CART_QUERY_KEY, updatedCart);
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
      toast.success("Item added to cart!");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Failed to add item to cart. Please try again.";
      toast.error(message);
    },
  });
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ cartItemId, quantity }: { cartItemId: string; quantity: number }) =>
      updateCartItemApi(cartItemId, quantity),
    onSuccess: (updatedCart) => {
      queryClient.setQueryData(CART_QUERY_KEY, updatedCart);
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
      toast.success("Cart updated!");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Failed to update quantity. Please try again.";
      toast.error(message);
    },
  });
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (cartItemId: string) => removeCartItemApi(cartItemId),
    onSuccess: (updatedCart) => {
      queryClient.setQueryData(CART_QUERY_KEY, updatedCart);
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
      toast.success("Item removed from cart");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Failed to remove item. Please try again.";
      toast.error(message);
    },
  });
}

export function useClearCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: clearCartApi,
    onSuccess: (updatedCart) => {
      queryClient.setQueryData(CART_QUERY_KEY, updatedCart);
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
      toast.success("Cart cleared");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Failed to clear cart. Please try again.";
      toast.error(message);
    },
  });
}
