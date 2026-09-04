"use client";

import { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const currentScroll = window.scrollY;

      if (totalHeight > 0) {
        const progress = Math.min(100, Math.max(0, (currentScroll / totalHeight) * 100));
        setScrollProgress(progress);
      }

      if (currentScroll > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ease-in-out ${
        isVisible
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-8 pointer-events-none"
      }`}
    >
      <button
        onClick={scrollToTop}
        aria-label="Scroll to top"
        className="group relative flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-zinc-950 shadow-xl shadow-emerald-500/25 border border-emerald-400/50 hover:bg-emerald-400 hover:scale-110 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 dark:focus:ring-offset-zinc-950"
      >
        {/* SVG Scroll Progress Circle */}
        <svg className="absolute inset-0 h-full w-full -rotate-90 p-0.5" viewBox="0 0 48 48">
          <circle
            cx="24"
            cy="24"
            r="21"
            stroke="currentColor"
            strokeWidth="2.5"
            fill="transparent"
            className="text-emerald-700/20"
          />
          <circle
            cx="24"
            cy="24"
            r="21"
            stroke="currentColor"
            strokeWidth="2.5"
            fill="transparent"
            strokeDasharray={132}
            strokeDashoffset={132 - (132 * scrollProgress) / 100}
            strokeLinecap="round"
            className="text-emerald-950 transition-all duration-150"
          />
        </svg>

        {/* Up Arrow Icon */}
        <ChevronUp className="h-6 w-6 stroke-[2.5] transition-transform duration-200 group-hover:-translate-y-0.5" />

        {/* Tooltip on Hover */}
        <span className="absolute bottom-full mb-2 hidden group-hover:block whitespace-nowrap rounded-lg bg-zinc-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-lg border border-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:border-zinc-200 animate-in fade-in zoom-in-95 duration-150">
          Back to top
        </span>
      </button>
    </div>
  );
}
