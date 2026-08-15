"use client";

import { useState } from "react";
import Link from "next/link";
import RatingStars from "./RatingStars";
import ReviewFormModal from "./ReviewFormModal";
import {
  useProductReviews,
  useCreateReview,
  useUpdateReview,
  useDeleteReview,
} from "@/features/reviews/queries";
import { useCurrentUser } from "@/features/auth/queries";
import { ReviewItem } from "@/types/review";
import {
  Star,
  MessageSquare,
  ShieldCheck,
  Edit2,
  Trash2,
  AlertCircle,
  RefreshCw,
  UserCheck,
  Plus,
  Loader2,
  LogIn,
} from "lucide-react";

interface ProductReviewsSectionProps {
  productId: string;
  productTitle?: string;
}

export default function ProductReviewsSection({
  productId,
  productTitle = "Product",
}: ProductReviewsSectionProps) {
  const { data: user } = useCurrentUser();
  const { data, isLoading, isError, refetch } = useProductReviews(productId);

  const { mutate: createReview, isPending: isCreating } = useCreateReview();
  const { mutate: updateReview, isPending: isUpdating } = useUpdateReview(productId);
  const { mutate: deleteReview, isPending: isDeleting } = useDeleteReview(productId);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<ReviewItem | null>(null);
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null);

  const summary = data?.summary || {
    averageRating: 0,
    totalReviews: 0,
    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  };

  const reviews = data?.reviews || [];
  const userHasReview = reviews.some((r) => r.userId === user?.id);

  const handleOpenCreateModal = () => {
    setEditingReview(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (review: ReviewItem) => {
    setEditingReview(review);
    setIsModalOpen(true);
  };

  const handleFormSubmit = (formData: { rating: number; comment?: string }) => {
    if (editingReview) {
      updateReview(
        { reviewId: editingReview.id, payload: formData },
        {
          onSuccess: () => {
            setIsModalOpen(false);
            setEditingReview(null);
          },
        }
      );
    } else {
      createReview(
        { productId, rating: formData.rating, comment: formData.comment },
        {
          onSuccess: () => {
            setIsModalOpen(false);
          },
        }
      );
    }
  };

  const handleDeleteConfirm = (reviewId: string) => {
    deleteReview(reviewId, {
      onSuccess: () => {
        setDeletingReviewId(null);
      },
    });
  };

  return (
    <section className="space-y-8 border-t border-zinc-200 pt-10 dark:border-zinc-800" id="product-reviews-section">
      {/* Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-zinc-900 dark:text-white sm:text-2xl">
              Customer Reviews & Ratings
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Verified feedback from Online-Bazar buyers
            </p>
          </div>
        </div>

        {/* Action Button */}
        {user ? (
          !userHasReview && (
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700"
              id="write-review-btn"
            >
              <Plus className="h-4 w-4" />
              <span>Write a Review</span>
            </button>
          )
        ) : (
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 py-2.5 text-xs font-bold text-zinc-700 shadow-xs hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
          >
            <LogIn className="h-4 w-4 text-emerald-600" />
            <span>Sign in to write a review</span>
          </Link>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <div className="h-32 w-full animate-pulse rounded-3xl bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-24 w-full animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-800/60" />
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-red-200 bg-red-50/50 p-8 text-center dark:border-red-900/40 dark:bg-red-950/20">
          <AlertCircle className="h-8 w-8 text-red-500" />
          <h3 className="mt-2 text-sm font-bold text-red-900 dark:text-red-300">
            Failed to Load Product Reviews
          </h3>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-3 flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-red-700"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Rating Overview Card & Distribution Breakdown */}
          <div className="grid grid-cols-1 gap-6 rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 sm:p-8 lg:grid-cols-3">
            {/* Left: Overall Rating */}
            <div className="flex flex-col items-center justify-center border-b border-zinc-100 pb-6 text-center dark:border-zinc-800 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-6">
              <span className="text-5xl font-black text-zinc-900 dark:text-white">
                {summary.averageRating > 0 ? summary.averageRating.toFixed(1) : "0.0"}
              </span>
              <div className="mt-2">
                <RatingStars rating={Math.round(summary.averageRating)} size="lg" />
              </div>
              <p className="mt-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                Based on {summary.totalReviews} customer reviews
              </p>
            </div>

            {/* Right: Star Rating Distribution Progress Bars */}
            <div className="space-y-2 lg:col-span-2">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = summary.distribution[stars as keyof typeof summary.distribution] || 0;
                const percentage =
                  summary.totalReviews > 0 ? Math.round((count / summary.totalReviews) * 100) : 0;

                return (
                  <div key={stars} className="flex items-center gap-3 text-xs">
                    <span className="w-12 font-semibold text-zinc-600 dark:text-zinc-400">
                      {stars} Stars
                    </span>
                    <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                      <div
                        className="h-full rounded-full bg-amber-400 transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-10 text-right font-mono text-[11px] text-zinc-400">
                      {count} ({percentage}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Review List */}
          {reviews.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-zinc-200 bg-zinc-50/50 p-10 text-center dark:border-zinc-800 dark:bg-zinc-900/30">
              <MessageSquare className="mx-auto h-10 w-10 text-zinc-400" />
              <h4 className="mt-3 text-sm font-bold text-zinc-900 dark:text-white">
                No Customer Reviews Yet
              </h4>
              <p className="mt-1 max-w-sm mx-auto text-xs text-zinc-500 dark:text-zinc-400">
                Be the first verified customer to share your experience with this product!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => {
                const isOwner = user?.id === review.userId;
                const formattedDate = new Date(review.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                });

                return (
                  <div
                    key={review.id}
                    className="relative space-y-3 rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs transition-all dark:border-zinc-800 dark:bg-zinc-900"
                    id={`review-card-${review.id}`}
                  >
                    <div className="flex items-start justify-between">
                      {/* Reviewer User Info */}
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          {review.user?.name ? review.user.name.charAt(0).toUpperCase() : "U"}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-zinc-900 dark:text-white">
                              {review.user?.name || "Verified Customer"}
                            </h4>
                            {review.isVerified && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                                <ShieldCheck className="h-3 w-3" />
                                Verified Buyer
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-zinc-400">{formattedDate}</span>
                        </div>
                      </div>

                      {/* Owner Controls (Edit / Delete) */}
                      {isOwner && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(review)}
                            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                            title="Edit Review"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeletingReviewId(review.id)}
                            className="rounded-lg p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                            title="Delete Review"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Star Rating */}
                    <div>
                      <RatingStars rating={review.rating} size="sm" />
                    </div>

                    {/* Review Comment Body */}
                    {review.comment && (
                      <p className="text-xs leading-relaxed text-zinc-700 dark:text-zinc-300">
                        {review.comment}
                      </p>
                    )}

                    {/* Delete Confirmation Alert Overlay */}
                    {deletingReviewId === review.id && (
                      <div className="mt-3 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-3 text-xs dark:border-red-900/60 dark:bg-red-950/40">
                        <span className="font-semibold text-red-800 dark:text-red-300">
                          Delete this review permanently?
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setDeletingReviewId(null)}
                            className="rounded-lg bg-white px-2.5 py-1 text-[11px] font-bold text-zinc-700 shadow-xs hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-300"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            disabled={isDeleting}
                            onClick={() => handleDeleteConfirm(review.id)}
                            className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-xs hover:bg-red-700"
                          >
                            {isDeleting && <Loader2 className="h-3 w-3 animate-spin" />}
                            <span>Confirm Delete</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Review Create/Edit Form Modal */}
      <ReviewFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        isSubmitting={isCreating || isUpdating}
        initialData={editingReview}
        productTitle={productTitle}
      />
    </section>
  );
}
