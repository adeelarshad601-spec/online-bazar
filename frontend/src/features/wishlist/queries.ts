import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getWishlistApi,
  addToWishlistApi,
  removeFromWishlistApi,
  checkWishlistApi,
  clearWishlistApi,
} from "./api";
import { Wishlist, WishlistCheckResponse } from "@/types/wishlist";
import { toast } from "sonner";
import { useCurrentUser } from "@/features/auth/queries";

export const WISHLIST_QUERY_KEY = ["wishlist"];
export const WISHLIST_CHECK_QUERY_KEY = (productId: string) => ["wishlist", "check", productId];

export function useWishlist() {
  const { data: user } = useCurrentUser();

  return useQuery<Wishlist>({
    queryKey: WISHLIST_QUERY_KEY,
    queryFn: getWishlistApi,
    enabled: Boolean(user),
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
}

export function useCheckWishlist(productId: string) {
  const { data: user } = useCurrentUser();

  return useQuery<WishlistCheckResponse>({
    queryKey: WISHLIST_CHECK_QUERY_KEY(productId),
    queryFn: () => checkWishlistApi(productId),
    enabled: Boolean(user && productId),
    staleTime: 1000 * 60 * 5,
  });
}

export function useAddToWishlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => addToWishlistApi(productId),
    onSuccess: (_, productId) => {
      queryClient.invalidateQueries({ queryKey: WISHLIST_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: WISHLIST_CHECK_QUERY_KEY(productId) });
      toast.success("Added to wishlist!");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Failed to add to wishlist. Please try again.";
      toast.error(message);
    },
  });
}

export function useRemoveFromWishlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => removeFromWishlistApi(productId),
    onSuccess: (_, productId) => {
      queryClient.invalidateQueries({ queryKey: WISHLIST_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: WISHLIST_CHECK_QUERY_KEY(productId) });
      toast.success("Removed from wishlist");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Failed to remove from wishlist. Please try again.";
      toast.error(message);
    },
  });
}

export function useClearWishlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: clearWishlistApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WISHLIST_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["wishlist", "check"] });
      toast.success("Wishlist cleared");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Failed to clear wishlist. Please try again.";
      toast.error(message);
    },
  });
}
