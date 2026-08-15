"use client";

import { ProductVariant } from "@/types/product";
import { Check } from "lucide-react";

interface VariantSelectorProps {
  variants?: ProductVariant[];
  selectedVariantId?: string;
  onSelectVariant: (variant: ProductVariant) => void;
}

export default function VariantSelector({
  variants,
  selectedVariantId,
  onSelectVariant,
}: VariantSelectorProps) {
  if (!variants || variants.length === 0) return null;

  return (
    <div className="space-y-3" id="product-variant-selector">
      <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
        Select Variant / Option
      </label>

      <div className="flex flex-wrap gap-2.5">
        {variants.map((variant) => {
          const isSelected = selectedVariantId === variant.id;
          const isOutOfStock = variant.stock <= 0;

          return (
            <button
              key={variant.id}
              type="button"
              disabled={isOutOfStock}
              onClick={() => onSelectVariant(variant)}
              className={`group relative flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-all ${
                isSelected
                  ? "border-emerald-600 bg-emerald-50 text-emerald-900 shadow-xs dark:bg-emerald-950 dark:text-emerald-200"
                  : isOutOfStock
                  ? "border-zinc-200 bg-zinc-100 text-zinc-400 cursor-not-allowed dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-600"
                  : "border-zinc-200 bg-white text-zinc-700 hover:border-emerald-500 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
              }`}
            >
              <span>{variant.name}</span>
              {variant.price && (
                <span className="text-[11px] font-normal text-zinc-500 dark:text-zinc-400">
                  (${variant.price.toFixed(2)})
                </span>
              )}
              {isSelected && <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />}
              {isOutOfStock && (
                <span className="text-[9px] font-bold uppercase text-red-500">(Out of Stock)</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
