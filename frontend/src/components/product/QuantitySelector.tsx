"use client";

import { Minus, Plus } from "lucide-react";

interface QuantitySelectorProps {
  quantity: number;
  maxStock: number;
  onQuantityChange: (qty: number) => void;
}

export default function QuantitySelector({
  quantity,
  maxStock,
  onQuantityChange,
}: QuantitySelectorProps) {
  const handleDecrement = () => {
    if (quantity > 1) {
      onQuantityChange(quantity - 1);
    }
  };

  const handleIncrement = () => {
    if (quantity < maxStock) {
      onQuantityChange(quantity + 1);
    }
  };

  return (
    <div className="space-y-2" id="product-quantity-selector">
      <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
        Quantity
      </label>
      <div className="flex items-center gap-3">
        <div className="flex items-center rounded-xl border border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <button
            type="button"
            onClick={handleDecrement}
            disabled={quantity <= 1}
            className="flex h-9 w-9 items-center justify-center text-zinc-600 transition-colors hover:bg-zinc-100 disabled:opacity-40 dark:text-zinc-300 dark:hover:bg-zinc-800"
            aria-label="Decrease quantity"
            id="qty-decrement-btn"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="w-10 text-center text-xs font-bold text-zinc-900 dark:text-white">
            {quantity}
          </span>
          <button
            type="button"
            onClick={handleIncrement}
            disabled={quantity >= maxStock}
            className="flex h-9 w-9 items-center justify-center text-zinc-600 transition-colors hover:bg-zinc-100 disabled:opacity-40 dark:text-zinc-300 dark:hover:bg-zinc-800"
            aria-label="Increase quantity"
            id="qty-increment-btn"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>

        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
          {maxStock > 0 ? `${maxStock} items available` : "Out of stock"}
        </span>
      </div>
    </div>
  );
}
