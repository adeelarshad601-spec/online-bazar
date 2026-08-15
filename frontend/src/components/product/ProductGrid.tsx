import { Product } from "@/types/product";
import ProductCard from "./ProductCard";
import { PackageOpen } from "lucide-react";

interface ProductGridProps {
  products: Product[];
  emptyTitle?: string;
  emptyMessage?: string;
}

export default function ProductGrid({
  products,
  emptyTitle = "No Products Found",
  emptyMessage = "We couldn't find any products in the catalog right now.",
}: ProductGridProps) {
  if (!products || products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-zinc-300 bg-zinc-50/50 p-12 text-center dark:border-zinc-800 dark:bg-zinc-900/30">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 shadow-inner dark:bg-emerald-950 dark:text-emerald-300">
          <PackageOpen className="h-7 w-7" />
        </div>
        <h3 className="mt-4 text-base font-bold text-zinc-900 dark:text-white">{emptyTitle}</h3>
        <p className="mt-1 max-w-sm text-xs text-zinc-500 dark:text-zinc-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4" id="storefront-product-grid">
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} priority={index < 4} />
      ))}
    </div>
  );
}
