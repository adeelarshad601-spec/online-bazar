import Link from "next/link";
import Image from "next/image";
import { Category } from "@/types/category";
import { Layers, ArrowUpRight } from "lucide-react";

interface CategoryCardProps {
  category: Category;
  priority?: boolean;
}

export default function CategoryCard({ category, priority = false }: CategoryCardProps) {
  // Generate consistent icon placeholder based on category name
  const getCategoryIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes("tech") || lower.includes("electro")) return "💻";
    if (lower.includes("fashion") || lower.includes("cloth")) return "👗";
    if (lower.includes("home") || lower.includes("kitchen")) return "🛋️";
    if (lower.includes("beauty") || lower.includes("care")) return "✨";
    if (lower.includes("sport") || lower.includes("outdoor")) return "⚽";
    if (lower.includes("book") || lower.includes("station")) return "📚";
    if (lower.includes("toy") || lower.includes("game")) return "🎮";
    if (lower.includes("auto") || lower.includes("car")) return "🚘";
    return "📦";
  };

  const productCount = category._count?.products;

  return (
    <Link
      href={`/categories/${category.id}`}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/10 dark:border-zinc-800 dark:bg-zinc-900/90 dark:hover:border-emerald-500/50"
      id={`category-card-${category.id}`}
    >
      {/* Background Subtle Gradient Glow on Hover */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gradient-to-br from-emerald-500/10 to-teal-500/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      {/* Top Bar: Icon/Image + Arrow Indicator */}
      <div className="flex items-start justify-between">
        <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-zinc-100 bg-zinc-50 text-2xl shadow-xs transition-transform duration-300 group-hover:scale-110 dark:border-zinc-800 dark:bg-zinc-800">
          {category.image ? (
            <Image
              src={category.image}
              alt={category.name}
              fill
              sizes="48px"
              priority={priority}
              className="object-cover"
            />
          ) : (
            <span>{getCategoryIcon(category.name)}</span>
          )}
        </div>

        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-100 text-zinc-400 transition-colors group-hover:bg-emerald-600 group-hover:text-white dark:bg-zinc-800 dark:text-zinc-500 dark:group-hover:bg-emerald-600 dark:group-hover:text-white">
          <ArrowUpRight className="h-4 w-4" />
        </div>
      </div>

      {/* Content Area */}
      <div className="mt-6 space-y-1">
        <h3 className="text-sm font-bold text-zinc-900 transition-colors group-hover:text-emerald-600 dark:text-white dark:group-hover:text-emerald-400">
          {category.name}
        </h3>
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
          <Layers className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
          <span>
            {productCount !== undefined
              ? `${productCount} ${productCount === 1 ? "Product" : "Products"}`
              : "Explore Catalog"}
          </span>
        </div>
      </div>
    </Link>
  );
}
