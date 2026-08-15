"use client";

import { useState, useEffect } from "react";
import RatingStars from "./RatingStars";
import { ReviewItem } from "@/types/review";
import { X, Loader2, Star, Sparkles } from "lucide-react";

interface ReviewFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { rating: number; comment?: string }) => void;
  isSubmitting?: boolean;
  initialData?: ReviewItem | null;
  productTitle?: string;
}

export default function ReviewFormModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
  initialData,
  productTitle = "Product",
}: ReviewFormModalProps) {
  const [rating, setRating] = useState(initialData?.rating || 5);
  const [comment, setComment] = useState(initialData?.comment || "");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setRating(initialData.rating);
      setComment(initialData.comment || "");
    } else {
      setRating(5);
      setComment("");
    }
    setError(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (rating < 1 || rating > 5) {
      setError("Please select a rating between 1 and 5 stars.");
      return;
    }

    if (comment.trim() && comment.trim().length < 5) {
      setError("Review comment must be at least 5 characters long.");
      return;
    }

    setError(null);
    onSubmit({
      rating,
      comment: comment.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute right-4 top-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Title */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950 dark:text-emerald-300">
            <Sparkles className="h-3.5 w-3.5" />
            <span>{initialData ? "Edit Review" : "Write a Customer Review"}</span>
          </div>
          <h2 className="text-xl font-extrabold text-zinc-900 dark:text-white">
            {initialData ? "Update your experience" : `Review ${productTitle}`}
          </h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {/* Rating Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
              Your Rating (1 to 5 stars)
            </label>
            <div className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-zinc-50/50 p-3.5 dark:border-zinc-800 dark:bg-zinc-800/40">
              <RatingStars
                rating={rating}
                size="lg"
                interactive
                onRatingChange={(newRating) => setRating(newRating)}
              />
              <span className="text-xs font-extrabold text-amber-500">
                {rating} out of 5 stars
              </span>
            </div>
          </div>

          {/* Comment Textarea */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
              Review Comment
            </label>
            <textarea
              rows={4}
              placeholder="Share details of your experience with this product (quality, fit, packaging, value)..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full rounded-2xl border border-zinc-200 bg-white p-3.5 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-600 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
              id="review-comment-textarea"
            />
            <p className="text-[11px] text-zinc-400">Min 5 characters, max 1000 characters.</p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-xs font-bold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 disabled:opacity-50"
              id="submit-review-modal-btn"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Star className="h-4 w-4 fill-white" />
              )}
              <span>{initialData ? "Update Review" : "Submit Review"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
