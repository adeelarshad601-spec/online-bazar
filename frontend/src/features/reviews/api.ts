import apiClient from "@/lib/api/client";
import { ApiResponse } from "@/types/auth";
import {
  ProductReviewsResponse,
  ReviewItem,
  CreateReviewPayload,
  UpdateReviewPayload,
} from "@/types/review";

export async function getProductReviewsApi(
  productId: string,
  params?: { page?: number; limit?: number }
): Promise<ProductReviewsResponse> {
  const response = await apiClient.get<ApiResponse<ProductReviewsResponse>>(
    `/reviews/product/${productId}`,
    { params }
  );
  return (
    response.data.data || {
      product: { id: productId, title: "" },
      summary: {
        averageRating: 0,
        totalReviews: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      },
      reviews: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
    }
  );
}

export async function createReviewApi(payload: CreateReviewPayload): Promise<ReviewItem> {
  const response = await apiClient.post<ApiResponse<ReviewItem>>("/reviews", payload);
  return response.data.data!;
}

export async function updateReviewApi(
  reviewId: string,
  payload: UpdateReviewPayload
): Promise<ReviewItem> {
  const response = await apiClient.patch<ApiResponse<ReviewItem>>(`/reviews/${reviewId}`, payload);
  return response.data.data!;
}

export async function deleteReviewApi(reviewId: string): Promise<{ id: string }> {
  const response = await apiClient.delete<ApiResponse<{ id: string }>>(`/reviews/${reviewId}`);
  return response.data.data || { id: reviewId };
}
