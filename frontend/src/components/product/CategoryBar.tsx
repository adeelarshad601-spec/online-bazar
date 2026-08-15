"use client";

import Link from "next/link";
import { useCategories } from "@/features/products/queries";
import { Layers } from "lucide-react";

interface CategoryBarProps {
  selectedCategoryId?: string;
}

export default function CategoryBar({ selectedCategoryId }: CategoryBarProps) {
  const { data: categories, isLoading } = useCategories();

  if (isLoading) {
    return (
      <div className="flex w-full items-center gap-2 overflow-x-auto py-2 no-scrollbar">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-8 w-24 shrink-0 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800"
          />
        ))}
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <div className="flex w-full items-center gap-2 overflow-x-auto py-2 no-scrollbar">
      <Link
        href="/products"
        className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
          !selectedCategoryId
            ? "bg-emerald-600 text-white shadow-xs"
            : "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
        }`}
      >
        <Layers className="h-3.5 w-3.5" />
        <span>All Products</span>
      </Link>

      {categories.map((category) => {
        const isSelected = selectedCategoryId === category.id;
        return (
          <Link
            key={category.id}
            href={`/categories/${category.id}`}
            className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
              isSelected
                ? "bg-emerald-600 text-white shadow-xs"
                : "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
            }`}
          >
            {category.name}
          </Link>
        );
      })}
    </div>
  );
}
