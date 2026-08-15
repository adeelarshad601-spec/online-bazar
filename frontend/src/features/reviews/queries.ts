import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getProductReviewsApi,
  createReviewApi,
  updateReviewApi,
  deleteReviewApi,
} from "./api";
import { ProductReviewsResponse, CreateReviewPayload, UpdateReviewPayload } from "@/types/review";
import { PRODUCT_DETAILS_QUERY_KEY } from "@/features/products/queries";
import { toast } from "sonner";

export const PRODUCT_REVIEWS_QUERY_KEY = (productId: string) => ["reviews", "product", productId];

export function useProductReviews(productId: string, params?: { page?: number; limit?: number }) {
  return useQuery<ProductReviewsResponse>({
    queryKey: PRODUCT_REVIEWS_QUERY_KEY(productId),
    queryFn: () => getProductReviewsApi(productId, params),
    enabled: Boolean(productId),
    staleTime: 1000 * 60 * 3,
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateReviewPayload) => createReviewApi(payload),
    onSuccess: (_, payload) => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_REVIEWS_QUERY_KEY(payload.productId) });
      queryClient.invalidateQueries({ queryKey: PRODUCT_DETAILS_QUERY_KEY(payload.productId) });
      toast.success("Review submitted successfully!");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Failed to submit review. Please try again.";
      toast.error(message);
    },
  });
}

export function useUpdateReview(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reviewId, payload }: { reviewId: string; payload: UpdateReviewPayload }) =>
      updateReviewApi(reviewId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_REVIEWS_QUERY_KEY(productId) });
      queryClient.invalidateQueries({ queryKey: PRODUCT_DETAILS_QUERY_KEY(productId) });
      toast.success("Review updated successfully!");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Failed to update review. Please try again.";
      toast.error(message);
    },
  });
}

export function useDeleteReview(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reviewId: string) => deleteReviewApi(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_REVIEWS_QUERY_KEY(productId) });
      queryClient.invalidateQueries({ queryKey: PRODUCT_DETAILS_QUERY_KEY(productId) });
      toast.success("Review deleted successfully!");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Failed to delete review. Please try again.";
      toast.error(message);
    },
  });
}
