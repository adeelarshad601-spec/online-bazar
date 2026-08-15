"use client";

import { useState } from "react";
import { Star } from "lucide-react";

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onRatingChange?: (newRating: number) => void;
}

export default function RatingStars({
  rating,
  maxRating = 5,
  size = "md",
  interactive = false,
  onRatingChange,
}: RatingStarsProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const starSizes = {
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
    lg: "h-6 w-6",
  };

  const currentDisplayRating = interactive && hoverRating !== null ? hoverRating : rating;

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: maxRating }).map((_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= currentDisplayRating;

        if (interactive) {
          return (
            <button
              key={index}
              type="button"
              onMouseEnter={() => setHoverRating(starValue)}
              onMouseLeave={() => setHoverRating(null)}
              onClick={() => onRatingChange && onRatingChange(starValue)}
              className="p-0.5 transition-transform hover:scale-125 focus:outline-none"
              aria-label={`Rate ${starValue} out of ${maxRating} stars`}
            >
              <Star
                className={`${starSizes[size]} transition-colors ${
                  isFilled
                    ? "fill-amber-400 text-amber-400"
                    : "text-zinc-300 dark:text-zinc-700"
                }`}
              />
            </button>
          );
        }

        return (
          <Star
            key={index}
            className={`${starSizes[size]} ${
              isFilled ? "fill-amber-400 text-amber-400" : "text-zinc-300 dark:text-zinc-700"
            }`}
          />
        );
      })}
    </div>
  );
}
