"use client";

import { useState } from "react";
import Image from "next/image";
import { ProductImage } from "@/types/product";
import { ShoppingBag, ZoomIn } from "lucide-react";

interface ProductGalleryProps {
  images?: ProductImage[];
  title: string;
}

export default function ProductGallery({ images, title }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  const hasImages = images && images.length > 0;
  const currentImage = hasImages ? images[selectedIndex] : null;

  return (
    <div className="space-y-4" id="product-detail-gallery">
      {/* Main Image Display */}
      <div
        className="relative aspect-square w-full overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-50 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
      >
        {currentImage ? (
          <Image
            src={currentImage.url}
            alt={currentImage.altText || title}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className={`object-cover transition-transform duration-500 ease-out ${
              isZoomed ? "scale-125 cursor-zoom-in" : "scale-100"
            }`}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-zinc-400 dark:text-zinc-600">
            <ShoppingBag className="h-20 w-20 stroke-[1.5]" />
          </div>
        )}

        {currentImage && (
          <div className="pointer-events-none absolute right-3 top-3 rounded-full bg-white/80 p-2 text-zinc-600 shadow-xs backdrop-blur-md dark:bg-zinc-900/80 dark:text-zinc-300">
            <ZoomIn className="h-4 w-4" />
          </div>
        )}
      </div>

      {/* Thumbnails Row */}
      {hasImages && images.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
          {images.map((img, index) => (
            <button
              key={img.id || index}
              type="button"
              onClick={() => setSelectedIndex(index)}
              className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 transition-all ${
                index === selectedIndex
                  ? "border-emerald-600 ring-2 ring-emerald-600/30 scale-105"
                  : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <Image
                src={img.url}
                alt={`${title} thumbnail ${index + 1}`}
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
