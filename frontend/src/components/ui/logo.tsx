import Link from "next/link";
import { ShoppingBag } from "lucide-react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showSubtitle?: boolean;
}

export default function Logo({ size = "md", showSubtitle = false }: LogoProps) {
  const iconSizes = {
    sm: "h-6 w-6 p-1.5",
    md: "h-9 w-9 p-2",
    lg: "h-12 w-12 p-2.5",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  return (
    <Link href="/" className="group inline-flex items-center gap-2.5 focus:outline-none">
      <div className={`relative flex items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform duration-200 ${iconSizes[size]}`}>
        <ShoppingBag className="h-full w-full" />
      </div>
      <div className="flex flex-col text-left">
        <span className={`font-bold tracking-tight text-zinc-900 dark:text-white ${textSizes[size]}`}>
          Online<span className="text-emerald-600 dark:text-emerald-400">-Bazar</span>
        </span>
        {showSubtitle && (
          <span className="text-[10px] font-medium tracking-widest text-zinc-400 uppercase">
            Multi-Vendor Market
          </span>
        )}
      </div>
    </Link>
  );
}
