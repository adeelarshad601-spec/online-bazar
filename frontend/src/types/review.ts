import { PaginationMeta } from "./product";

export interface ReviewUser {
  id: string;
  name: string;
}

export interface ReviewItem {
  id: string;
  rating: number;
  comment?: string | null;
  userId: string;
  productId: string;
  isVerified?: boolean;
  createdAt: string;
  updatedAt?: string;
  user: ReviewUser;
}

export interface RatingDistribution {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
}

export interface ReviewSummary {
  averageRating: number;
  totalReviews: number;
  distribution: RatingDistribution;
}

export interface ProductReviewsResponse {
  product: {
    id: string;
    title: string;
  };
  summary: ReviewSummary;
  reviews: ReviewItem[];
  pagination: PaginationMeta;
}

export interface CreateReviewPayload {
  productId: string;
  rating: number;
  comment?: string;
}

export interface UpdateReviewPayload {
  rating?: number;
  comment?: string;
}
