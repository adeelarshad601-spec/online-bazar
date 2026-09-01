"use client";

import { useCategories } from "@/features/products/queries";
import Link from "next/link";
import { useState } from "react";

export default function CategoryPillBar() {
  const { data: categories } = useCategories();
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const defaultPills = [
    { id: "all", name: "All Products" },
    { id: "watch", name: "Watch" },
    { id: "earbuds", name: "Earbuds" },
    { id: "mouse", name: "Mouse" },
    { id: "decoration", name: "Decoration" },
    { id: "headphones", name: "Headphones" },
    { id: "speakers", name: "Speakers" },
  ];

  const pillList =
    categories && categories.length > 0
      ? [{ id: "all", name: "All Products" }, ...categories.map((c) => ({ id: c.id, name: c.name }))]
      : defaultPills;

  return (
    <div className="w-full overflow-x-auto py-2 scrollbar-none">
      <div className="flex items-center gap-2.5 min-w-max px-1">
        {pillList.map((pill) => {
          const isActive = activeCategory === pill.id;
          return pill.id === "all" ? (
            <button
              key={pill.id}
              onClick={() => setActiveCategory(pill.id)}
              className={`rounded-full px-5 py-2 text-xs font-semibold transition-all ${
                isActive
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              }`}
            >
              {pill.name}
            </button>
          ) : (
            <Link
              key={pill.id}
              href={`/categories/${pill.id}`}
              onClick={() => setActiveCategory(pill.id)}
              className={`rounded-full px-5 py-2 text-xs font-semibold transition-all ${
                isActive
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              }`}
            >
              {pill.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
